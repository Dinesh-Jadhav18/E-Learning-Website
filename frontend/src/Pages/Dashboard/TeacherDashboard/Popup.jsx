import React, { useState } from "react";
import { useParams } from "react-router-dom";

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

function Popup({ onClose, subject }) {
  const { ID } = useParams();

  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const dateGap = 3; // 3 hours

  const [day, setDay] = useState({
    sun: false,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
  });

  const [dayValue, setDayValue] = useState({
    sun: "",
    mon: "",
    tue: "",
    wed: "",
    thu: "",
    fri: "",
    sat: "",
  });

  const dayIndex = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  // Convert HH:MM to minutes
  const convertTimeToMinutes = (time) => {
    if (!time) return null;

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  };

  // Convert minutes to HH:MM
  const convertMinutesToTime = (minutes) => {
    if (minutes === null || minutes === undefined) {
      return "";
    }

    // Don't allow time beyond 23:59
    if (minutes >= 24 * 60) {
      return "";
    }

    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");

    return `${hours}:${mins}`;
  };

  const handleCheckboxChange = (dayName) => {
    setDay((prevDay) => ({
      ...prevDay,
      [dayName]: !prevDay[dayName],
    }));
  };

  const handleTimeChange = (dayName, value) => {
    setDayValue((prev) => ({
      ...prev,
      [dayName]: value,
    }));
  };

  const addCourse = async () => {
    if (!ID) {
      alert("Teacher ID is missing.");
      return;
    }

    if (!subject) {
      alert("Course name is missing.");
      return;
    }

    if (!desc.trim()) {
      alert("Fill the description.");
      return;
    }

    // Get selected days
    const selectedDays = Object.keys(day)
      .filter((d) => day[d])
      .map((d) => {
        const startTime = convertTimeToMinutes(dayValue[d]);

        return {
          day: dayIndex[d],
          starttime: startTime,
          endtime:
            startTime !== null
              ? startTime + dateGap * 60
              : null,
        };
      });

    // Check if at least one day is selected
    if (selectedDays.length === 0) {
      alert("Please select at least one day and time.");
      return;
    }

    // Check missing time
    const hasMissingTime = selectedDays.some(
      (d) => d.starttime === null
    );

    if (hasMissingTime) {
      alert("Please fill in the time for all selected days.");
      return;
    }

    // Check if end time goes beyond midnight
    const invalidTime = selectedDays.some(
      (d) => d.endtime > 24 * 60 - 1
    );

    if (invalidTime) {
      alert("Please select a start time that allows a 3-hour class.");
      return;
    }

    // Check time range
    const invalidTimeRange = selectedDays.some((d) => {
      if (d.starttime >= d.endtime) {
        return true;
      }

      return d.endtime - d.starttime > dateGap * 60;
    });

    if (invalidTimeRange) {
      alert("Class duration cannot be more than 3 hours.");
      return;
    }

    const data = {
      coursename: subject.toLowerCase(),
      description: desc.trim(),
      schedule: selectedDays,
    };

    console.log("Course data:", data);

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/course/${subject}/create/${ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await parseResponse(response);

      console.log("Create course response:", responseData);

      alert(
        responseData.message || "Course created successfully!"
      );

      // Close popup only after successful API response
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating course:", error);

      alert(
        error.message || "Failed to create course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center">
      <div className="bg-[#008280] w-[30rem] h-fit py-4 mt-1 rounded-md">

        {/* Close Button */}
        <div
          className="absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2"
          onClick={loading ? undefined : onClose}
        >
          ✖️
        </div>

        {/* Course Name */}
        <div className="text-center my-10 text-white text-3xl font-semibold">
          <p>{subject}</p>
        </div>

        <div className="m-5 flex flex-col gap-4 text-white text-xl">

          {/* Course Name Input */}
          <div>
            <label>Course name: </label>

            <input
              type="text"
              className="bg-[#32B0AE] p-2 rounded-md w-52 border-0 outline-0"
              value={subject || ""}
              readOnly
            />
          </div>

          {/* Timing */}
          <label>Timing:</label>

          {Object.keys(day).map((d) => {
            const startTime = convertTimeToMinutes(dayValue[d]);

            const endTime =
              startTime !== null
                ? startTime + dateGap * 60
                : null;

            return (
              <div
                key={d}
                className="flex items-center justify-center gap-2"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={day[d]}
                  onChange={() => handleCheckboxChange(d)}
                />

                {/* Day */}
                <label className="w-[4rem]">
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </label>

                {/* Start Time */}
                <input
                  className="w-[7rem] rounded-sm text-black pl-2"
                  type="time"
                  value={dayValue[d]}
                  onChange={(e) =>
                    handleTimeChange(d, e.target.value)
                  }
                />

                {/* End Time */}
                <input
                  className="w-[7rem] rounded-sm text-black pl-2"
                  type="time"
                  readOnly
                  value={
                    endTime !== null
                      ? convertMinutesToTime(endTime)
                      : ""
                  }
                />
              </div>
            );
          })}

          {/* Description */}
          <div>
            <label>Description: </label>

            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="bg-[#32B0AE] p-2 rounded-md w-52 ml-3 border-0 outline-0"
              placeholder="Course description"
            />
          </div>
        </div>

        {/* Create Course Button */}
        <div className="flex items-center justify-center mt-7">
          <span
            onClick={loading ? undefined : addCourse}
            className={`bg-[#335699] text-white px-10 py-3 rounded-md text-xl ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {loading ? "Creating..." : "Create Course"}
          </span>
        </div>

      </div>
    </div>
  );
}

export default Popup;