import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header/Header';

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
).replace(/\/$/, "");

// Safely parse JSON responses
const parseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
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

function Search() {
    const { subject } = useParams();

    const [data, setData] = useState(subject || "");
    const [course, setCourse] = useState([]);
    const [openTM, setOpenTM] = useState(false);
    const [Tdec, setTeacherDetails] = useState(null);
    const [tname, setTname] = useState({});
    const [loading, setLoading] = useState(false);
    const [teacherLoading, setTeacherLoading] = useState(false);
    const [error, setError] = useState("");

    const daysName = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    // Search teachers/courses
    const SearchTeacher = async () => {
        const Subject = data?.trim().toLowerCase();

        if (!Subject) {
            alert("Please enter a subject.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/course/${encodeURIComponent(Subject)}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

            const responseData = await parseResponse(response);

            if (responseData.statusCode === 200) {
                setCourse(responseData.data || []);
            } else {
                setCourse([]);
                setError(responseData.message || "No courses found.");
            }
        } catch (error) {
            console.error("Search error:", error);
            setCourse([]);
            setError(
                error.message ||
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Automatically search when page opens
    useEffect(() => {
        if (subject) {
            SearchTeacher();
        }
    }, [subject]);

    // Open teacher details
    const openTeacherDec = async (id, fname, lname, sub) => {
        setTname({
            fname,
            lname,
            sub
        });

        setTeacherLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/teacher/teacherdocuments`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify({
                        teacherID: id
                    })
                }
            );

            const responseData = await parseResponse(response);

            if (responseData.statusCode === 200) {
                setTeacherDetails(responseData.data || {});
                setOpenTM(true);
            } else {
                throw new Error(
                    responseData.message || "Unable to load teacher details."
                );
            }
        } catch (error) {
            console.error("Teacher details error:", error);

            alert(
                error.message ||
                "Unable to load teacher details. Please try again."
            );
        } finally {
            setTeacherLoading(false);
        }
    };

    // Format time
    const formatTime = (minutes) => {
        if (minutes === undefined || minutes === null) {
            return "--:--";
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return `${hours}:${mins.toString().padStart(2, "0")}`;
    };

    return (
        <>
            <Header />

            <div className="flex flex-col items-center justify-center">

                {/* Search Box */}
                <div className="search mb-10">
                    <img
                        src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/6c476f454537d7f27cae2b4d0f31e2b59b3020f5"
                        width={30}
                        alt="Search"
                    />

                    <input
                        type="text"
                        placeholder="Ex: Math ..."
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                SearchTeacher();
                            }
                        }}
                    />

                    <button
                        className="w-32"
                        onClick={SearchTeacher}
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Find Teacher"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="text-red-600 font-semibold mb-5">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="mb-5 text-gray-600">
                        Loading courses...
                    </div>
                )}

                {/* Course List */}
                <div className="overflow-auto w-full flex flex-col items-center">

                    {!loading && course.length === 0 && (
                        <div className="text-gray-600 mb-5">
                            No teachers/courses found.
                        </div>
                    )}

                    {course.map((Data) => (
                        <div
                            key={Data._id}
                            className="relative bg-blue-600 p-4 gap-6 h-20 mb-3 flex items-start rounded-sm w-[75rem]"
                        >

                            {/* Course Name */}
                            <div className="text-blue-900 font-bold">
                                {Data?.coursename
                                    ? Data.coursename.toUpperCase()
                                    : "COURSE"}
                            </div>

                            {/* Teacher Name */}
                            <div
                                onClick={() =>
                                    Data?.enrolledteacher &&
                                    openTeacherDec(
                                        Data.enrolledteacher.Teacherdetails,
                                        Data.enrolledteacher.Firstname,
                                        Data.enrolledteacher.Lastname,
                                        Data.coursename
                                    )
                                }
                                className="text-gray-300 cursor-pointer font-bold"
                            >
                                {Data?.enrolledteacher?.Firstname || ""}{" "}
                                {Data?.enrolledteacher?.Lastname || ""}
                            </div>

                            {/* Description */}
                            <div className="text-gray-900">
                                <span className="text-gray-900">
                                    Desc :
                                </span>{" "}
                                {Data?.description || "No description"}
                            </div>

                            {/* Students */}
                            <div>
                                {Data?.enrolledStudent?.length || 0}/20
                            </div>

                            {/* Enroll Button */}
                            <div className="absolute right-4">
                                <div
                                    onClick={() =>
                                        alert("Pls login to enroll it")
                                    }
                                    className="text-white bg-blue-900 py-2 px-3 cursor-not-allowed"
                                >
                                    Enroll Now
                                </div>
                            </div>

                            {/* Timing */}
                            <div className="absolute bottom-2">
                                <span className="mt-2 font-bold">
                                    Timing :{" "}
                                </span>

                                {"[ "}

                                {Array.isArray(Data?.schedule)
                                    ? Data.schedule
                                          .map((daytime) => {
                                              const dayName =
                                                  daysName[daytime.day] ||
                                                  "Unknown Day";

                                              return `${dayName} ${formatTime(
                                                  daytime.starttime
                                              )} - ${formatTime(
                                                  daytime.endtime
                                              )}`;
                                          })
                                          .join(", ")
                                    : "No schedule"}

                                {" ]"}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Teacher Details Popup */}
                {openTM && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">

                        <div className="bg-[#008280] w-96 h-[21rem] rounded-md">

                            {/* Close Button */}
                            <div
                                className="absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2"
                                onClick={() => {
                                    setOpenTM(false);
                                    setTeacherDetails(null);
                                }}
                            >
                                ✖️
                            </div>

                            <div className="flex flex-col justify-center p-5 text-1xl gap-4">

                                {/* Course */}
                                <p className="text-center text-2xl bg-blue-900 rounded-sm py-1 text-white mb-5">
                                    {tname?.sub
                                        ? tname.sub.toUpperCase()
                                        : "COURSE"}
                                </p>

                                {/* Teacher Name */}
                                <p>
                                    Teacher Name :{" "}
                                    <span className="text-white">
                                        {tname?.fname || ""}{" "}
                                        {tname?.lname || ""}
                                    </span>
                                </p>

                                {/* Education */}
                                <p>
                                    Education :{" "}
                                    <span className="text-white">
                                        Postgraduate from{" "}
                                        <b className="text-gray-200">
                                            {Tdec?.PGcollege || "N/A"}
                                        </b>{" "}
                                        with{" "}
                                        {Tdec?.PGmarks ?? "N/A"} CGPA
                                    </span>
                                </p>

                                {/* Experience */}
                                <p>
                                    Experience :{" "}
                                    <span className="text-white">
                                        {Tdec?.Experience ?? "N/A"} years
                                    </span>
                                </p>

                                {/* Course Name */}
                                <p>
                                    Course Name :{" "}
                                    <span className="text-white">
                                        {tname?.sub
                                            ? tname.sub.toUpperCase()
                                            : "N/A"}
                                    </span>
                                </p>

                                {teacherLoading && (
                                    <p className="text-white text-center">
                                        Loading teacher details...
                                    </p>
                                )}

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Search;