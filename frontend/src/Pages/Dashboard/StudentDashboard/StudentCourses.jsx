import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Popup from "./Popup";

function StudentCourses() {
  const { ID } = useParams();

  const [data, setData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [subDetails, setSubDetails] = useState({});
  const [subD, setSubD] = useState([]);
  const [error, setError] = useState("");

  // =========================================================
  // BACKEND URL
  // =========================================================
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
  ).replace(/\/$/, "");

  // =========================================================
  // RESPONSE HANDLER
  // Prevents: Unexpected token '<'
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
          // Keep default error
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
  // GET STUDENT ENROLLED COURSES
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
          `${API_BASE_URL}/api/course/student/${ID}/enrolled`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const user = await parseResponse(response);

        console.log("Student courses:", user.data);

        setData(user.data || []);
      } catch (error) {
        console.error("Student courses error:", error);
        setError(error.message);
        setData([]);
      }
    };

    getData();
  }, [ID, API_BASE_URL]);

  // =========================================================
  // OPEN COURSE POPUP
  // =========================================================
  const openPopup = async (sub) => {
    if (!sub) {
      return;
    }

    try {
      setError("");

      setSubDetails(sub);

      const response = await fetch(
        `${API_BASE_URL}/api/course/${encodeURIComponent(
          sub.coursename
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await parseResponse(response);

      console.log("Course details:", result.data);

      setSubD(result.data || []);
      setPopup(true);
    } catch (error) {
      console.error("Course details error:", error);
      setError(error.message);
    }
  };

  // =========================================================
  // COURSE PRICES
  // =========================================================
  const price = {
    math: 700,
    physics: 800,
    computer: 1000,
    chemistry: 600,
    biology: 500,
  };

  // =========================================================
  // DAYS
  // =========================================================
  const daysName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // =========================================================
  // COURSE IMAGES
  // =========================================================
  const Image = {
    physics:
      "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/8e9bf690d23d886f63466a814cfbec78187f91d2",

    chemistry:
      "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/3e546b344774eb0235acc6bf6dad7814a59d6e95",

    biology:
      "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/28ac70002ae0a676d9cfb0f298f3e453d12b5555",

    math:
      "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/61930117e428a1f0f7268f888a84145f93aa0664",

    computer:
      "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/a64c93efe984ab29f1dfb9e8d8accd9ba449f272",
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

  return (
    <>
      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}
      {error && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-5 py-3 rounded-md shadow-lg">
          {error}
        </div>
      )}

      {/* =====================================================
          COURSES
      ===================================================== */}
      <div className="flex gap-10 pl-[12rem] mt-12 flex-wrap justify-center mb-2">
        {data.length > 0 ? (
          data.map((sub) => {
            const courseName =
              sub?.coursename?.toLowerCase() || "";

            return (
              <div
                key={sub._id}
                className="text-white rounded-md bg-[#042439] cursor-pointer text-center p-3 w-[15rem]"
                onClick={() => openPopup(sub)}
              >
                {/* COURSE IMAGE + NAME */}
                <div className="flex justify-center items-center">
                  <img
                    src={Image[courseName]}
                    alt={sub?.coursename || "course"}
                    width={60}
                  />

                  <p>
                    {sub?.coursename
                      ? sub.coursename.toUpperCase()
                      : "COURSE"}
                  </p>
                </div>

                {/* DESCRIPTION */}
                <p className="mt-5 text-gray-300 text-sm text-center px-2">
                  {sub?.description || "No description available"}
                </p>

                {/* SCHEDULE */}
                {sub?.schedule?.length > 0 && (
                  <div>
                    <p className="mt-2 text-blue-700 font-bold">
                      Timing:
                    </p>

                    {"[ "}

                    {sub.schedule
                      .map((daytime) => {
                        const day =
                          daysName[daytime?.day] || "Unknown";

                        return `${day} ${formatTime(
                          daytime?.starttime
                        )} - ${formatTime(daytime?.endtime)}`;
                      })
                      .join(", ")}

                    {" ]"}
                  </div>
                )}

                {/* COURSE PRICE */}
                {price[courseName] && (
                  <p className="mt-3 text-gray-300 text-sm">
                    Fees: Rs. {price[courseName]}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-gray-500 mt-10 text-lg">
            No enrolled courses found.
          </div>
        )}
      </div>

      {/* =====================================================
          POPUP
      ===================================================== */}
      {popup && (
        <Popup
          onClose={() => setPopup(false)}
          subject={subDetails}
          allSubject={subD}
        />
      )}
    </>
  );
}

export default StudentCourses;