import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DateTime from "./DateTime";

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

function AddClass({ onClose }) {
  const { ID } = useParams();

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [CourseId, setCourseId] = useState("");
  const [allowedDays, setCurrData] = useState([]);

  const DAY = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  function setToMidnight(dateTimeString) {
    const selectedDate = new Date(dateTimeString);

    if (Number.isNaN(selectedDate.getTime())) {
      return [0, ""];
    }

    const hours = selectedDate.getUTCHours();
    const minutes = selectedDate.getUTCMinutes();
    const seconds = selectedDate.getUTCSeconds();

    const totalMinutes = hours * 60 + minutes;

    selectedDate.setUTCHours(0, 0, 0, 0);

    const modifiedDateTimeString = selectedDate.toISOString();

    return [totalMinutes, modifiedDateTimeString];
  }

  // Get teacher's enrolled courses
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

        const courseData = res.data || [];

        setCourses(courseData);

        // Select first approved course
        const approvedCourses = courseData.filter(
          (course) => course.isapproved
        );

        if (approvedCourses.length > 0) {
          setCourseId(approvedCourses[0]._id);
        } else if (courseData.length > 0) {
          setCourseId(courseData[0]._id);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(error.message);
      }
    };

    if (ID) {
      getCourses();
    }
  }, [ID]);

  // Update allowed days when course changes
  useEffect(() => {
    const selectedCourse = courses.find(
      (course) => course._id === CourseId
    );

    setCurrData(selectedCourse?.schedule || []);
  }, [CourseId, courses]);

  const addCourses = async () => {
    setError("");

    if (!date || !note.trim() || !link.trim()) {
      alert("All fields are required!");
      return;
    }

    if (!CourseId) {
      alert("Please select a course!");
      return;
    }

    const currentDate = new Date();
    const givenDate = new Date(date);

    if (Number.isNaN(givenDate.getTime())) {
      alert("Please choose a valid date!");
      return;
    }

    if (currentDate > givenDate) {
      alert("Choose a valid Date!");
      return;
    }

    const modifyDate = setToMidnight(date);

    if (!modifyDate[1]) {
      alert("Invalid date or time!");
      return;
    }

    const data = {
      title: note.trim(),
      timing: modifyDate[0],
      date: modifyDate[1],
      link: link.trim(),
      status: "upcoming",
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/course/${CourseId}/teacher/${ID}/add-class`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const res = await parseResponse(response);

      alert(res.message || "Class added successfully!");

      if (response.ok && res.statusCode === 200) {
        onClose();
      }
    } catch (error) {
      console.error("Error adding class:", error);
      setError(error.message);
      alert(error.message || "Failed to add class.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[60%] h-[70%] bg-blue-gray-700 text-white rounded-md">
        {/* Close button */}
        <div
          className="absolute w-9 h-9 bg-[#E2B659] rounded-xl cursor-pointer flex items-center justify-center m-2"
          onClick={onClose}
        >
          ✖️
        </div>

        {/* Header */}
        <div className="flex justify-center mt-5 gap-10 border-b-2 py-5">
          <p className="text-2xl">Create next class</p>

          <select
            value={CourseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="text-gray-900 rounded-md w-28 px-2 border-0 outline-0"
          >
            {courses
              .filter((course) => course.isapproved)
              .map((course) => (
                <option key={course._id} value={course._id}>
                  {course.coursename?.toUpperCase()} [
                  {course.schedule
                    ?.map((day) => DAY[day.day])
                    .join(", ")}
                  ]
                </option>
              ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="flex items-center justify-around my-20 mx-5">
          <div className="flex gap-5 text-black">
            <label className="text-xl text-white">
              Date & Time:
            </label>

            <DateTime
              setDate={setDate}
              allowedDays={allowedDays}
            />
          </div>
        </div>

        {/* Link and Title */}
        <div className="m-10 flex items-center justify-center gap-20 mb-20">
          <div className="flex gap-5">
            <label className="text-xl">Link:</label>

            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              type="url"
              className="border-0 outline-0 text-gray-900 py-1 px-3 rounded-sm"
              placeholder="Class link"
            />
          </div>

          <div className="flex gap-5">
            <label className="text-xl">Title:</label>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              type="text"
              className="border-0 outline-0 text-gray-900 py-1 px-3 rounded-sm"
              placeholder="Class title"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-center mb-4">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-center">
          <div
            onClick={addCourses}
            className="bg-[#E2B659] w-32 text-center py-2 rounded-sm text-brown-900 text-xl cursor-pointer"
          >
            Submit
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddClass;