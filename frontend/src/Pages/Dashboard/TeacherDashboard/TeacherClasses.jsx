import React, { useEffect, useState } from "react";
import Camera from "../Images/Camera.png";
import Clock from "../Images/Clock.png";
import AddClass from "./AddClass";
import { NavLink, useParams } from "react-router-dom";

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

function TeacherClasses() {
  const [showPopup, setShowPopup] = useState(false);
  const { ID } = useParams();

  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Get teacher classes
  // --------------------------------------------------
  useEffect(() => {
    const getData = async () => {
      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/course/classes/teacher/${ID}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const user = await parseResponse(response);

        const liveClasses =
          user?.data?.classes?.[0]?.liveClasses || [];

        setData(liveClasses);

        console.log("Teacher classes:", user?.data);
      } catch (error) {
        console.error("Error fetching teacher classes:", error);
        setError(error.message);
      }
    };

    if (ID) {
      getData();
    }
  }, [showPopup, ID]);

  // --------------------------------------------------
  // Format time
  // --------------------------------------------------
  const formatTime = (timing) => {
    if (typeof timing !== "number") {
      return "";
    }

    const hours = Math.floor(timing / 60);
    const minutes = timing % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // Get upcoming classes for next 7 days
  // --------------------------------------------------
  const upcomingClasses = data
    .filter((clas) => {
      if (!clas?.date) {
        return false;
      }

      const classDate = new Date(clas.date);

      if (Number.isNaN(classDate.getTime())) {
        return false;
      }

      const today = new Date();
      const oneWeekFromNow = new Date();

      today.setHours(0, 0, 0, 0);
      oneWeekFromNow.setHours(23, 59, 59, 999);
      oneWeekFromNow.setDate(today.getDate() + 7);

      return (
        classDate >= today &&
        classDate <= oneWeekFromNow
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return (a.timing || 0) - (b.timing || 0);
    });

  // The nearest upcoming class
  const nextClass = upcomingClasses[0];

  // --------------------------------------------------
  // Error UI
  // --------------------------------------------------
  if (error) {
    return (
      <div className="ml-60 mt-20 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="ml-60 mt-20 text-white flex justify-between mr-80">

      {/* Weekly Schedule Title */}
      <h1 className="absolute bottom-72 left-60 text-[#1671D8] text-2xl mt-4 mb-4 font-semibold">
        Weekly Schedule
      </h1>

      {/* Weekly Schedule */}
      <div className="h-[17rem] w-[30rem] overflow-auto">

        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((clas, index) => {

            const classDate = new Date(clas.date);

            return (
              <div
                key={`${clas._id || clas.timing}-${index}`}
                className="flex items-center mb-5"
              >

                {/* Profile Image */}
                <img
                  src="https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png"
                  alt="profile_img"
                  width={30}
                />

                {/* Class Information */}
                <div className="ml-5 mr-10 font-bold">

                  <p className="text-lg">

                    {clas?.coursename || "Course"}

                    <span className="text-black text-sm ml-3">

                      {classDate.toLocaleDateString("en-CA")}

                      {"  "}

                      {formatTime(clas?.timing)}

                    </span>

                  </p>

                  <span className="text-blue-500 text-sm ml-3">
                    {(clas?.title || "").slice(0, 35)}
                    {(clas?.title || "").length > 35 ? " ..." : ""}
                  </span>

                </div>

                {/* Status */}
                <p className="text-sm bg-[#4E84C1] p-2 rounded-lg">
                  {clas?.status || "upcoming"}
                </p>

              </div>
            );
          })
        ) : (
          <p className="text-gray-400 mt-10">
            No upcoming classes in the next 7 days.
          </p>
        )}

      </div>

      {/* Next Class Card */}
      {nextClass && (
        <NavLink
          to={nextClass?.link || "#"}
          target={nextClass?.link ? "_blank" : undefined}
          onClick={(e) => {
            if (!nextClass?.link) {
              e.preventDefault();
            }
          }}
        >
          <div className="bg-white p-5 h-52 cursor-pointer rounded-lg text-black">

            {/* Date and Time */}
            <div className="flex gap-3 items-center mb-5 mt-2">

              <img
                src={Clock}
                alt="clock"
                width={50}
              />

              <span className="text-[#4E84C1] text-2xl font-semibold">
                {nextClass?.date
                  ? new Date(nextClass.date).toLocaleDateString(
                      "en-CA"
                    )
                  : ""}
              </span>

              <span className="text-[#018280] text-2xl ml-2">
                {formatTime(nextClass?.timing)}
              </span>

            </div>

            {/* Class Details */}
            <div className="flex gap-12 items-center">

              <div className="ml-3">

                <p>Your next Class</p>

                <p className="text-[#018280] text-3xl font-semibold">
                  {nextClass?.coursename?.toUpperCase() ||
                    "CLASS"}
                </p>

                <p className="text-light-blue-700">
                  {(nextClass?.title || "").slice(0, 25)}
                  {(nextClass?.title || "").length > 25
                    ? " ..."
                    : ""}
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
      )}

      {/* Add Class Button */}
      <div
        onClick={() => setShowPopup(true)}
        className="absolute right-10 bg-blue-900 p-2 rounded-sm cursor-pointer"
      >
        + ADD CLASS
      </div>

      {/* Add Class Popup */}
      {showPopup && (
        <AddClass
          onClose={() => setShowPopup(false)}
        />
      )}

    </div>
  );
}

export default TeacherClasses;