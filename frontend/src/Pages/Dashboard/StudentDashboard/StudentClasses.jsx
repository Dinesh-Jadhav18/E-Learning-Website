import React, { useEffect, useState } from "react";
import Camera from "../Images/Camera.png";
import Clock from "../Images/Clock.png";
import { NavLink, useParams } from "react-router-dom";

function StudentClasses() {
  const { ID } = useParams();

  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  // =========================================================
  // BACKEND URL
  // =========================================================
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
  ).replace(/\/$/, "");

  // =========================================================
  // RESPONSE HANDLER
  // =========================================================
  const parseResponse = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    const text = await response.text();

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      if (contentType.includes("application/json")) {
        try {
          const errorData = JSON.parse(text);
          message = errorData.message || message;
        } catch (error) {
          // Keep default message
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
    } catch (error) {
      throw new Error("Invalid JSON response received from server.");
    }
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================
  const formatTime = (minutes) => {
    if (typeof minutes !== "number") {
      return "";
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}:${String(mins).padStart(2, "0")}`;
  };

  // =========================================================
  // GET STUDENT CLASSES
  // =========================================================
  useEffect(() => {
    const getData = async () => {
      if (!ID) {
        setError("Student ID not found.");
        return;
      }

      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/course/classes/student/${ID}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const user = await parseResponse(response);

        console.log("Student classes response:", user);

        const liveClasses =
          user?.data?.classes?.[0]?.liveClasses || [];

        setData(liveClasses);

        console.log("Live classes:", liveClasses);
      } catch (error) {
        console.error("Student classes error:", error);
        setError(error.message);
        setData([]);
      }
    };

    getData();
  }, [ID, API_BASE_URL]);

  // =========================================================
  // GET UPCOMING CLASSES
  // =========================================================
  const today = new Date();

  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  const upcomingClasses = data.filter((clas) => {
    if (!clas?.date) {
      return false;
    }

    const classDate = new Date(clas.date);

    if (Number.isNaN(classDate.getTime())) {
      return false;
    }

    return classDate >= today && classDate <= oneWeekFromNow;
  });

  // Sort upcoming classes by date and timing
  const sortedClasses = [...upcomingClasses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return (a.timing || 0) - (b.timing || 0);
  });

  // First upcoming class
  const nextClass = sortedClasses[0];

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().slice(0, 10);
  };

  return (
    <div className="ml-60 mt-20 text-white flex justify-between mr-60">

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}
      {error && (
        <div className="absolute top-24 left-60 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* =====================================================
          WEEKLY SCHEDULE
      ===================================================== */}
      <h1 className="absolute bottom-72 left-60 text-[#1671D8] text-2xl mt-4 mb-4 font-semibold">
        Weekly Schedule
      </h1>

      <div className="h-[17rem] w-[30rem] overflow-auto">
        {sortedClasses.length > 0 ? (
          sortedClasses.map((clas, index) => (
            <div
              key={`${clas?._id || clas?.timing || "class"}-${index}`}
              className="flex items-center mb-5"
            >
              <img
                src="https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png"
                alt="profile_img"
                width={30}
              />

              <div className="ml-5 mr-10 font-bold">
                <p className="text-lg">
                  {clas?.coursename || "Course"}

                  <span className="text-black text-sm ml-3">
                    {formatDate(clas?.date)}{" "}
                    {formatTime(clas?.timing)}
                  </span>
                </p>

                <span className="text-blue-500 text-sm ml-3">
                  {clas?.title
                    ? `${clas.title.slice(0, 35)}${
                        clas.title.length > 35 ? " ..." : ""
                      }`
                    : "Class"}
                </span>
              </div>

              <p className="text-sm bg-[#4E84C1] p-2 rounded-lg">
                {clas?.status || "Scheduled"}
              </p>
            </div>
          ))
        ) : (
          <div className="text-gray-500 mt-5">
            No classes scheduled for this week.
          </div>
        )}
      </div>

      {/* =====================================================
          NEXT CLASS CARD
      ===================================================== */}
      {nextClass ? (
        <NavLink
          to={nextClass?.link || "#"}
          target={nextClass?.link ? "_blank" : undefined}
          onClick={(e) => {
            if (!nextClass?.link) {
              e.preventDefault();
              alert("Class link is not available.");
            }
          }}
        >
          <div className="bg-white p-5 h-52 cursor-pointer rounded-lg text-black">
            
            {/* DATE + TIME */}
            <div className="flex gap-3 items-center mb-5 mt-2">
              <img
                src={Clock}
                alt="clock"
                width={50}
              />

              <span className="text-[#4E84C1] text-2xl font-semibold">
                {formatDate(nextClass?.date)}
              </span>

              <span className="text-[#018280] text-2xl ml-2">
                {formatTime(nextClass?.timing)}
              </span>
            </div>

            {/* CLASS DETAILS */}
            <div className="flex gap-12 items-center">
              <div className="ml-3">
                <p>Your next Class</p>

                <p className="text-[#018280] text-3xl font-semibold">
                  {nextClass?.coursename || "Course"}
                </p>

                <p className="text-light-blue-700">
                  {nextClass?.title
                    ? `${nextClass.title.slice(0, 25)}${
                        nextClass.title.length > 25
                          ? " ..."
                          : ""
                      }`
                    : "Class details"}
                </p>
              </div>

              <img
                src={Camera}
                alt="Camera"
                width={70}
              />
            </div>
          </div>
        </NavLink>
      ) : (
        <div className="bg-white p-5 h-52 w-[30rem] rounded-lg text-black">
          <div className="flex gap-3 items-center mb-5 mt-2">
            <img
              src={Clock}
              alt="clock"
              width={50}
            />

            <span className="text-[#4E84C1] text-2xl font-semibold">
              No upcoming class
            </span>
          </div>

          <div className="flex gap-12 items-center">
            <div className="ml-3">
              <p>Your next Class</p>

              <p className="text-[#018280] text-3xl font-semibold">
                No class scheduled
              </p>
            </div>

            <img
              src={Camera}
              alt="Camera"
              width={70}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentClasses;