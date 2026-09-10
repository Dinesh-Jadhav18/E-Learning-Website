import React, { useEffect, useState } from "react";

function Popup({ onClose, subject, allSubject }) {
  const [details, setDetails] = useState({});
  const [Tdec, setTeacherDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // BACKEND URL
  // =========================================================
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
  ).replace(/\/$/, "");

  const price = {
    math: 700,
    physics: 800,
    computer: 1000,
    chemistry: 600,
    biology: 500,
  };

  // =========================================================
  // GET TEACHER FROM SELECTED COURSE
  // =========================================================
  useEffect(() => {
    if (!subject || !allSubject) {
      setDetails({});
      return;
    }

    const selectedSubject = allSubject.find(
      (item) => item._id === subject._id
    );

    setDetails(selectedSubject?.enrolledteacher || {});
  }, [subject, allSubject]);

  // =========================================================
  // GET TEACHER DOCUMENT DETAILS
  // =========================================================
  useEffect(() => {
    const getData = async () => {
      if (!details?.Teacherdetails) {
        return;
      }

      try {
        setLoading(true);

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
              teacherID: details.Teacherdetails,
            }),
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        const text = await response.text();

        // -----------------------------------------------------
        // HANDLE SERVER ERROR
        // -----------------------------------------------------
        if (!response.ok) {
          let message = `Request failed (${response.status})`;

          if (contentType.includes("application/json")) {
            try {
              const errorData = JSON.parse(text);
              message = errorData.message || message;
            } catch (error) {
              // Keep default error message
            }
          } else if (text) {
            message = `${message}: ${text.substring(0, 150)}`;
          }

          throw new Error(message);
        }

        // -----------------------------------------------------
        // MAKE SURE RESPONSE IS JSON
        // -----------------------------------------------------
        if (!contentType.includes("application/json")) {
          throw new Error(
            "Server returned HTML/text instead of JSON. Check your backend URL."
          );
        }

        const result = JSON.parse(text);

        console.log("Teacher details:", result.data);

        setTeacherDetails(result.data || null);
      } catch (error) {
        console.error("Teacher details error:", error);
        setTeacherDetails(null);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [details, API_BASE_URL]);

  // =========================================================
  // COURSE PRICE
  // =========================================================
  const courseName = subject?.coursename?.toLowerCase() || "";

  const coursePrice = price[courseName];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#008280] w-96 h-[20rem] rounded-md relative">
        {/* ===================================================
            CLOSE BUTTON
        =================================================== */}
        <div
          className="absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2"
          onClick={onClose}
        >
          ✖️
        </div>

        {/* ===================================================
            COURSE NAME
        =================================================== */}
        <div className="text-center my-5 text-gray-900 text-3xl font-semibold">
          <p>
            {subject?.coursename
              ? subject.coursename.toUpperCase()
              : "COURSE"}
          </p>
        </div>

        {/* ===================================================
            COURSE DESCRIPTION
        =================================================== */}
        <div className="text-center text-gray-900 px-3 mb-3">
          <p>
            {subject?.description || "No description available"}
          </p>
        </div>

        <hr />

        {/* ===================================================
            TEACHER DETAILS
        =================================================== */}
        {details && Object.keys(details).length > 0 ? (
          <div className="flex flex-col justify-center p-5 text-1xl gap-4">
            {/* TEACHER NAME */}
            <p>
              Teacher :{" "}
              <span className="text-white">
                {details?.Firstname || ""}{" "}
                {details?.Lastname || ""}
              </span>
            </p>

            {/* EMAIL */}
            <p>
              Email :{" "}
              <span className="text-white">
                {details?.Email || "Not available"}
              </span>
            </p>

            {/* FEES */}
            <p>
              Fees :{" "}
              <span className="text-white">
                {coursePrice
                  ? `Rs. ${coursePrice} per month / per student`
                  : "Not available"}
              </span>
            </p>
          </div>
        ) : (
          <div className="text-center p-5 text-white">
            Teacher details not available.
          </div>
        )}

        {/* ===================================================
            OPTIONAL LOADING MESSAGE
        =================================================== */}
        {loading && (
          <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">
            Loading teacher details...
          </div>
        )}
      </div>
    </div>
  );
}

export default Popup;