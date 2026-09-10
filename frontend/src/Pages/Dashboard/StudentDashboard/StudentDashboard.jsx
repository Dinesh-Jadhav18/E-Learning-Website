import React, { useEffect, useState } from "react";
import teachingImg from "../../Images/Teaching.svg";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import logo from "../../Images/logo.svg";

function StudentDashboard() {
  const { ID } = useParams();
  const navigator = useNavigate();

  const [data, setData] = useState({});
  const [error, setError] = useState("");

  // =========================================================
  // BACKEND URL
  // =========================================================
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
  ).replace(/\/$/, "");

  // =========================================================
  // RESPONSE HANDLER
  // Prevents: Unexpected token '<', "<!doctype..."
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
  // LOGOUT
  // =========================================================
  const Handlelogout = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/student/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const result = await parseResponse(response);

      console.log("Logout response:", result);

      if (result.statusCode === 200) {
        navigator("/");
      } else {
        alert(result.message || "Logout failed.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message);
    }
  };

  // =========================================================
  // GET STUDENT DETAILS
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
          `${API_BASE_URL}/api/Student/StudentDocument/${ID}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const user = await parseResponse(response);

        console.log("Student data:", user.data);

        setData(user.data || {});
      } catch (error) {
        console.error("Student data error:", error);
        setError(error.message);
      }
    };

    getData();
  }, [ID, API_BASE_URL]);

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <nav className="bg-[#04253A] px-10 py-3 flex justify-between items-center">
        <NavLink to="/">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              className="w-14"
              alt="Shiksharthee logo"
            />

            <h1 className="text-2xl text-[#4E84C1] font-bold">
              Shiksharthee
            </h1>
          </div>
        </NavLink>

        <button
          onClick={Handlelogout}
          className="bg-[#0D199D] text-white py-2 px-5 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </nav>

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}
      {error && (
        <div className="fixed top-20 right-5 z-50 bg-red-600 text-white px-5 py-3 rounded-md shadow-lg">
          {error}
        </div>
      )}

      {/* =====================================================
          WELCOME SECTION
      ===================================================== */}
      <div className="bg-[#008280] flex justify-between items-center">
        <div className="text-white font-semibold text-5xl ml-72">
          <h1 className="mb-5 text-[#071645]">
            Welcome to{" "}
            <span className="text-white">
              Shiksharthee
            </span>
          </h1>

          <h3 className="ml-16 text-[#071645]">
            {data?.Firstname || ""} {data?.Lastname || ""}
          </h3>
        </div>

        <div className="m-5 mr-20">
          <img
            src={teachingImg}
            alt="Teaching"
            width={300}
          />
        </div>
      </div>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <div className="bg-[#071645] w-52 min-h-[120vh] max-h-[130vh] absolute top-20">
        
        {/* PROFILE */}
        <div className="flex flex-col gap-5 text-xl items-center text-white mt-8 mb-10">
          <img
            src="https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png"
            alt="profile_img"
            width={50}
          />

          <p>
            {data?.Firstname || ""}{" "}
            {data?.Lastname || ""}
          </p>
        </div>

        {/* SIDEBAR LINKS */}
        <div className="flex flex-col gap-1">

          {/* TEACHER */}
          <NavLink
            to={`/Student/Dashboard/${ID}/Search`}
            className={({ isActive }) =>
              isActive
                ? "bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1]"
                : "p-3 text-center font-semibold text-[#4E84C1]"
            }
          >
            Teacher
          </NavLink>

          {/* CLASSES */}
          <NavLink
            to={`/Student/Dashboard/${ID}/Classes`}
            className={({ isActive }) =>
              isActive
                ? "bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1]"
                : "p-3 text-center font-semibold text-[#4E84C1]"
            }
          >
            Classes
          </NavLink>

          {/* COURSES */}
          <NavLink
            to={`/Student/Dashboard/${ID}/Courses`}
            className={({ isActive }) =>
              isActive
                ? "bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1]"
                : "p-3 text-center font-semibold text-[#4E84C1]"
            }
          >
            Courses
          </NavLink>

        </div>
      </div>
    </>
  );
}

export default StudentDashboard;