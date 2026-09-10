import React, { useState, useEffect } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import logo from "../../Images/logo.svg";
import axios from "axios";

const Admin = () => {
  const { data } = useParams();
  const navigator = useNavigate();

  const [StudentData, setStudentData] = useState([]);
  const [TeacherData, setTeacherData] = useState([]);
  const [adminID, setAdminID] = useState(null);
  const [error, setErrors] = useState("");
  const [allmsg, setAllMsg] = useState([]);
  const [open, setOpen] = useState(false);

  // =====================================================
  // IMPORTANT:
  // Your backend is deployed on Render
  // =====================================================
  const BASE_URL =
    "https://e-learning-backend-9oie.onrender.com/api";

  // =====================================================
  // GET ALL MESSAGES
  // =====================================================
  useEffect(() => {
    const getAllMsg = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/messages/all`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const responseText = await response.text();

        let result = {};

        try {
          result = responseText
            ? JSON.parse(responseText)
            : {};
        } catch (jsonError) {
          console.error(
            "Messages API returned non-JSON:",
            responseText
          );
          return;
        }

        if (!response.ok) {
          console.error(
            "Failed to get messages:",
            response.status,
            result
          );
          return;
        }

        setAllMsg(result?.data || []);
      } catch (err) {
        console.error("Messages error:", err.message);
      }
    };

    getAllMsg();
  }, []);

  // =====================================================
  // APPROVE / REJECT STUDENT OR TEACHER
  // =====================================================
  const Approval = async (ID, type, approve) => {
    try {
      const approvalData = {
        Isapproved: approve,
      };

      const response = await fetch(
        `${BASE_URL}/admin/${adminID}/approve/${type}/${ID}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approvalData),
        }
      );

      const responseText = await response.text();

      let result = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (jsonError) {
        console.error(
          "Approval API returned non-JSON:",
          responseText
        );
        return;
      }

      if (!response.ok) {
        console.error(
          "Approval failed:",
          response.status,
          result
        );

        setErrors(
          result?.message || "Approval request failed"
        );

        return;
      }

      console.log("Approval successful:", result);

      if (type === "student") {
        setStudentData((previous) =>
          previous.filter((student) => student._id !== ID)
        );
      } else if (type === "teacher") {
        setTeacherData((previous) =>
          previous.filter((teacher) => teacher._id !== ID)
        );
      }
    } catch (error) {
      console.error("Approval error:", error);
      setErrors(error.message);
    }
  };

  // =====================================================
  // DOCUMENT DETAILS
  // =====================================================
  const docDetails = (type, ID) => {
    navigator(`/VarifyDoc/${type}/${adminID}/${ID}`);
  };

  // =====================================================
  // GET STUDENT + TEACHER APPROVAL DATA
  // =====================================================
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/${data}/approve`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const responseText = await response.text();

        let result = {};

        try {
          result = responseText
            ? JSON.parse(responseText)
            : {};
        } catch (jsonError) {
          console.error(
            "Admin API returned non-JSON:",
            responseText
          );
          return;
        }

        if (!response.ok) {
          console.error(
            "Failed to fetch admin data:",
            response.status,
            result
          );

          setErrors(
            result?.message ||
              `Failed to fetch data (${response.status})`
          );

          return;
        }

        console.log("Admin data:", result);

        setStudentData(
          result?.data?.studentsforApproval || []
        );

        setTeacherData(
          result?.data?.teachersforApproval || []
        );

        setAdminID(result?.data?.admin?._id || null);
      } catch (err) {
        console.error("Admin data error:", err.message);
        setErrors(err.message);
      }
    };

    if (data) {
      getData();
    }
  }, [data]);

  return (
    <div className="h-[100vh]">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <nav className="h-16 sm:h-20 md:h-24 lg:h-24 w-full bg-[#042439] flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <NavLink to="/">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="logo"
              className="w-14 sm:h-12 md:h-14 lg:h-16 xl:h-18"
            />

            <h1 className="text-2xl text-[#4E84C1] font-bold">
              Shiksharthee
            </h1>
          </div>
        </NavLink>

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

      {/* =====================================================
          MAIN SECTION
      ===================================================== */}
      <div className="p-4 sm:p-8 md:p-12 lg:p-10">
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-2xl border-b-2 font-semibold text-white border-white">
          All New Request
        </h1>

        {/* Messages Button */}
        <div
          onClick={() => setOpen((previous) => !previous)}
          className="absolute right-10 top-[6.5rem] text-center cursor-pointer"
        >
          <h4 className="text-white bg-green-800 p-4 w-32">
            Messages
          </h4>
        </div>

        {/* Course Requests Button */}
        <div
          onClick={() => navigator(`/admin/course/${data}`)}
          className="absolute right-52 top-[6.5rem] text-center cursor-pointer"
        >
          <h4 className="text-white bg-blue-800 p-4 w-44">
            Course Requests
          </h4>
        </div>

        {/* =====================================================
            MESSAGES
        ===================================================== */}
        {open && (
          <div className="mt-3 w-[30rem] absolute right-10 bg-gray-700 text-gray-100 p-5 z-10">
            {allmsg.length > 0 ? (
              allmsg.map((msg, index) => (
                <div
                  key={index}
                  className="bg-gray-600 mb-5 rounded-sm p-2"
                >
                  <p className="text-black">
                    Name :{" "}
                    <span className="text-white">
                      {msg.name}
                    </span>
                  </p>

                  <p className="text-light-blue-600">
                    <span className="text-black">
                      Email :{" "}
                    </span>
                    {msg.email}
                  </p>

                  <p>
                    <span className="text-black">
                      Message :{" "}
                    </span>
                    {msg.message}
                  </p>
                </div>
              ))
            ) : (
              <p>No messages found.</p>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          REQUEST SECTIONS
      ===================================================== */}
      <div className="flex items-start justify-center gap-20">

        {/* ===================================================
            STUDENT REQUEST
        =================================================== */}
        <div className="rounded-md">
          <h4 className="text-white bg-blue-gray-900 p-4 w-40">
            Student Request
          </h4>

          {StudentData.length > 0
            ? StudentData.map(
                (student) =>
                  student.Isapproved === "pending" && (
                    <div
                      key={student._id}
                      onClick={() =>
                        docDetails(
                          "student",
                          student._id
                        )
                      }
                      className="flex justify-around items-center mt-8 p-8 bg-blue-gray-600 rounded-md cursor-pointer"
                    >
                      <h1 className="text-[24px] text-1xl text-white mr-3">
                        {student.Firstname}{" "}
                        {student.Lastname}
                      </h1>

                      <p>
                        Status:{" "}
                        <span>
                          {student.Isapproved}
                        </span>
                      </p>
                    </div>
                  )
              )
            : null}
        </div>

        {/* ===================================================
            TEACHER REQUEST
        =================================================== */}
        <div className="rounded-md">
          <h4 className="text-white bg-blue-gray-900 p-4 w-40">
            Teacher Request
          </h4>

          {TeacherData.length > 0
            ? TeacherData.map(
                (teacher) =>
                  teacher.Isapproved === "pending" && (
                    <div
                      key={teacher._id}
                      onClick={() =>
                        docDetails(
                          "teacher",
                          teacher._id
                        )
                      }
                      className="flex justify-around items-center mt-8 p-8 bg-blue-gray-600 rounded-md cursor-pointer"
                    >
                      <h1 className="text-[24px] text-1xl text-white mr-3">
                        {teacher.Firstname}{" "}
                        {teacher.Lastname}
                      </h1>

                      <p>
                        Status:{" "}
                        <span>
                          {teacher.Isapproved}
                        </span>
                      </p>
                    </div>
                  )
              )
            : null}
        </div>

        {/* ===================================================
            REJECTED REQUEST
        =================================================== */}
        <div className="rounded-md">
          <h4 className="text-white bg-red-500 p-4 w-40">
            Rejected Request
          </h4>

          {/* Rejected Teachers */}
          {TeacherData.length > 0
            ? TeacherData.map(
                (teacher) =>
                  teacher.Isapproved === "rejected" && (
                    <div
                      key={teacher._id}
                      onClick={() =>
                        docDetails(
                          "teacher",
                          teacher._id
                        )
                      }
                      className="flex justify-around items-center mt-8 p-8 bg-blue-gray-600 rounded-md cursor-pointer"
                    >
                      <h1 className="text-[24px] text-1xl text-white mr-3">
                        {teacher.Firstname}{" "}
                        {teacher.Lastname}
                      </h1>

                      <p>
                        Msg:{" "}
                        <span>
                          {teacher.Remarks}
                        </span>
                      </p>
                    </div>
                  )
              )
            : null}

          {/* Rejected Students */}
          {StudentData.length > 0
            ? StudentData.map(
                (student) =>
                  student.Isapproved === "rejected" && (
                    <div
                      key={student._id}
                      onClick={() =>
                        docDetails(
                          "student",
                          student._id
                        )
                      }
                      className="flex justify-around items-center mt-8 p-8 bg-blue-gray-600 rounded-md cursor-pointer"
                    >
                      <h1 className="text-[24px] text-1xl text-white mr-3">
                        {student.Firstname}{" "}
                        {student.Lastname}
                      </h1>

                      <p>
                        Msg:{" "}
                        <span>
                          {student.Remarks}
                        </span>
                      </p>
                    </div>
                  )
              )
            : null}
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <p className="text-red-500 text-center mt-5">
          {error}
        </p>
      )}
    </div>
  );
};

export default Admin;