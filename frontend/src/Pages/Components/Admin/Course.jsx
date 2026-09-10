import React, { useState, useEffect } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Course = () => {
  const [courseReq, setCourseReq] = useState([]);

  const { data } = useParams();
  const navigator = useNavigate();

  // =====================================================
  // RENDER BACKEND URL
  // =====================================================
  const BASE_URL =
    "https://e-learning-backend-9oie.onrender.com/api";

  // =====================================================
  // FORMAT DAY
  // =====================================================
  const formatDay = (day) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return daysOfWeek[day];
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================
  const formatTime = (time) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // =====================================================
  // GET COURSE REQUESTS
  // =====================================================
  useEffect(() => {
    const fetchCourseRequests = async () => {
      try {
        console.log(
          "Course request URL:",
          `${BASE_URL}/admin/${data}/approve/course`
        );

        const response = await axios.get(
          `${BASE_URL}/admin/${data}/approve/course`,
          {
            withCredentials: true,
          }
        );

        console.log("Course response:", response.data);

        setCourseReq(response.data?.data || []);
      } catch (error) {
        console.error(
          "Error fetching course requests:",
          error
        );

        console.error(
          "Server response:",
          error.response?.data
        );

        console.error(
          "Status:",
          error.response?.status
        );
      }
    };

    if (data) {
      fetchCourseRequests();
    }
  }, [data]);

  // =====================================================
  // APPROVE COURSE
  // =====================================================
  const handleAccept = async (id, info) => {
    console.log("Approving course:", id);
    console.log("Teacher email:", info.Email);

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/${data}/approve/course/${id}`,
        {
          Isapproved: true,
          email: info.Email,
          Firstname: info.enrolledteacher,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Approve response:", response.data);

      if (response.status === 200) {
        setCourseReq((previous) =>
          previous.filter((req) => req._id !== id)
        );

        alert(
          response.data?.message ||
            "Course approved successfully"
        );
      }
    } catch (error) {
      console.error(
        "Error approving course request:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Error approving course request"
      );
    }
  };

  // =====================================================
  // REJECT COURSE
  // =====================================================
  const handleReject = async (id, info) => {
    console.log("Rejecting course:", id);
    console.log("Teacher email:", info.Email);

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/${data}/approve/course/${id}`,
        {
          Isapproved: false,
          email: info.Email,
          Firstname: info.enrolledteacher,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Reject response:", response.data);

      if (response.status === 200) {
        setCourseReq((previous) =>
          previous.filter((req) => req._id !== id)
        );

        alert(
          response.data?.message ||
            "Course rejected successfully"
        );
      }
    } catch (error) {
      console.error(
        "Error rejecting course request:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Error rejecting course request"
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="h-[100vh]">
      {/* ===================================================
          NAVBAR
      =================================================== */}
      <nav className="h-16 sm:h-20 md:h-24 lg:h-24 w-full bg-[#042439] flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">

        {/* Back button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <h1
              onClick={() => navigator(`/admin/${data}`)}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-700 font-bold font-mono ml-2 cursor-pointer"
            >
              ◀ Back
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center">
          <div className="relative mr-4">
            <IoIosNotificationsOutline className="h-8 w-8 text-white" />

            <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </div>

          <button
            onClick={() => navigator("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ===================================================
          COURSE REQUESTS
      =================================================== */}
      {courseReq.length > 0 ? (
        <div className="mt-3 text-gray-100 p-5">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {courseReq.map((req, index) => (
              <div
                key={req._id || index}
                className="bg-gray-800 p-4 rounded-md shadow-[0_0_10px_white]"
              >
                {/* Course name */}
                <h2 className="text-lg text-yellow-500 font-bold">
                  {req.coursename
                    ? req.coursename.toUpperCase()
                    : "COURSE"}
                </h2>

                {/* Description */}
                <p className="text-yellow-700 font-semibold">
                  {req.description}
                </p>

                {/* Teacher */}
                <div className="flex items-center mt-2">
                  <p className="text-yellow-300">
                    Enrolled Teacher :
                  </p>

                  <p className="text-white font-semibold pl-1">
                    {req.enrolledteacher?.Firstname}{" "}
                    {req.enrolledteacher?.Lastname}
                  </p>
                </div>

                {/* Timing */}
                <div className="flex flex-col justify-start mt-2">
                  <p className="text-gray-400 text-xl font-bold mr-2">
                    Timing:
                  </p>

                  <div className="text-white">
                    {req.schedule?.length > 0 ? (
                      req.schedule.map(
                        (scheduleItem, idx) => (
                          <div key={idx}>
                            <p className="text-yellow-800">
                              Day:{" "}
                              {formatDay(
                                scheduleItem.day
                              )}
                            </p>

                            <p className="text-yellow-300">
                              Start Time:{" "}
                              {formatTime(
                                scheduleItem.starttime
                              )}
                            </p>

                            <p className="text-yellow-300">
                              End Time:{" "}
                              {formatTime(
                                scheduleItem.endtime
                              )}
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <p>No schedule available</p>
                    )}
                  </div>
                </div>

                {/* Approval Status */}
                <div className="flex items-center mt-2">
                  <p className="text-yellow-300 mr-2">
                    Approval Status:
                  </p>

                  <p
                    className={`text-white ${
                      req.isapproved
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {req.isapproved
                      ? "Approved"
                      : "Pending"}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-row gap-3 mt-3">

                  {/* Approve */}
                  <button
                    className="text-white bg-green-500 px-4 py-2 rounded-md hover:bg-green-600"
                    onClick={() =>
                      handleAccept(req._id, {
                        Email:
                          req.enrolledteacher?.Email,
                        enrolledteacher:
                          req.enrolledteacher?.Firstname,
                      })
                    }
                  >
                    Approve
                  </button>

                  {/* Reject */}
                  <button
                    className="text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={() =>
                      handleReject(req._id, {
                        Email:
                          req.enrolledteacher?.Email,
                        enrolledteacher:
                          req.enrolledteacher?.Firstname,
                      })
                    }
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center mt-10">
          <p className="text-white text-xl">
            No course requests found.
          </p>
        </div>
      )}
    </div>
  );
};

export default Course;