import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Withdrawal from "./Withdrawal";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
).replace(/\/$/, "");

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    if (contentType.includes("application/json")) {
      try {
        const errorData = JSON.parse(text);
        message = errorData.message || message;
      } catch {
        // Ignore JSON parsing error
      }
    } else if (text) {
      message = `${message}: ${text.substring(0, 150)}`;
    }

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      "Server returned HTML/text instead of JSON. Check your backend URL."
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response received from server.");
  }
};

function DashboardTeacher() {
  const { ID } = useParams();

  const [data, setdata] = useState({});
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const [amount, setAmount] = useState(0);
  const [Tdec, setTeacherDetails] = useState(null);

  const price = {
    math: 700,
    physics: 800,
    computer: 1000,
    chemistry: 600,
    biology: 500,
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // --------------------------------------------------
  // Get teacher document/details
  // --------------------------------------------------
  useEffect(() => {
    const getData = async () => {
      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/Teacher/TeacherDocument/${ID}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const user = await parseResponse(response);

        setdata(user.data || {});
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setError(error.message);
      }
    };

    if (ID) {
      getData();
    }
  }, [ID]);

  // --------------------------------------------------
  // Get teacher details
  // --------------------------------------------------
  useEffect(() => {
    const getTeacherDetails = async () => {
      if (!data?.Teacherdetails) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/teacher/teacherdocuments`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              teacherID: data.Teacherdetails,
            }),
          }
        );

        const res = await parseResponse(response);

        setTeacherDetails(res.data || null);
      } catch (error) {
        console.error("Error fetching teacher details:", error);
        setError(error.message);
      }
    };

    getTeacherDetails();
  }, [data]);

  // --------------------------------------------------
  // Get teacher balance
  // --------------------------------------------------
  useEffect(() => {
    const getAmount = async () => {
      if (!ID) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/payment/teacher/${ID}/balance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const user = await parseResponse(response);

        setAmount(user.data?.newTeacher?.Balance || 0);
      } catch (error) {
        console.error("Error fetching teacher balance:", error);
      }
    };

    getAmount();
  }, [ID, popup]);

  // --------------------------------------------------
  // Get enrolled courses
  // --------------------------------------------------
  useEffect(() => {
    const getCourses = async () => {
      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/course/Teacher/${ID}/enrolled`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const res = await parseResponse(response);

        setCourses(res.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(error.message);
      }
    };

    if (ID) {
      getCourses();
    }
  }, [ID]);

  return (
    <>
      <div className="m-5 ml-60 text-white flex flex-col gap-7">

        {/* Top Buttons */}
        <div className="text-[1.1rem] w-[30rem] flex gap-60 items-center">

          <div className="bg-[#1671D8] p-3 rounded-md cursor-pointer">
            Details
          </div>

          <div
            onClick={() => setPopup(true)}
            className="bg-[#1671D8] p-3 rounded-md cursor-pointer"
          >
            Remuneration
          </div>

        </div>

        <hr />

        {/* Error Message */}
        {error && (
          <div className="text-red-400 bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Teacher Details + Courses */}
        <div className="flex gap-32">

          {/* Teacher Information */}
          <div className="flex flex-col gap-5">

            <p>
              Name:{" "}
              <span className="text-black">
                {data?.Firstname} {data?.Lastname}
              </span>
            </p>

            <p>
              Email:{" "}
              <span className="text-black">
                {data?.Email}
              </span>
            </p>

            <p>
              Phone:{" "}
              <span className="text-black">
                {Tdec?.Phone || "N/A"}
              </span>
            </p>

            <p>
              Address:{" "}
              <span className="text-black">
                {Tdec?.Address || "N/A"}
              </span>
            </p>

            <p>
              Experience:{" "}
              <span className="text-black">
                {Tdec?.Experience || "0"} years
              </span>
            </p>

          </div>

          {/* Courses */}
          <div>
            <div className="flex gap-3 flex-col">

              <p className="bg-[#1671D8] py-1 px-2 w-fit">
                Courses
              </p>

              {courses
                .filter((course) => course?.isapproved)
                .map((course) => (

                  <p
                    key={course._id}
                    className="py-1 px-2 rounded-xl w-fit"
                  >

                    {course?.coursename}:{" "}

                    <span className="text-black">

                      {" [ "}

                      {course?.schedule
                        ?.map((days) => {
                          const startHours = Math.floor(
                            days.starttime / 60
                          );

                          const startMinutes =
                            days.starttime % 60;

                          const endHours = Math.floor(
                            days.endtime / 60
                          );

                          const endMinutes =
                            days.endtime % 60;

                          return `${daysOfWeek[days.day]} ${startHours}:${String(
                            startMinutes
                          ).padStart(2, "0")} - ${endHours}:${String(
                            endMinutes
                          ).padStart(2, "0")}`;
                        })
                        .join(", ")}

                      {" ] "}

                    </span>

                    <span className="text-black font-bold">
                      {" => "}
                      Rs.{" "}
                      {price[course?.coursename?.toLowerCase()] ||
                        "N/A"}{" "}
                      per student / per month
                    </span>

                  </p>

                ))}

            </div>
          </div>

        </div>

        {/* Withdrawal Popup */}
        {popup && (
          <Withdrawal
            onClose={() => setPopup(false)}
            TA={amount}
          />
        )}

      </div>
    </>
  );
}

export default DashboardTeacher;