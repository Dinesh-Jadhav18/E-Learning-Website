import React, { useEffect, useState } from "react";
import "./Search.css";
import { useParams } from "react-router-dom";
import logo from "../../Images/logo.svg";
import Success from "./Success";

function Search() {
  const [data, setData] = useState("");
  const [course, setCourse] = useState([]);
  const [courseID, setCourseID] = useState([]);
  const [popup, setPopup] = useState(false);
  const [idArray, setIdArray] = useState([]);
  const { ID } = useParams();

  const [openTM, setOpenTM] = useState(false);
  const [Tdec, setTeacherDetails] = useState(null);
  const [tname, setTname] = useState({});

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
  // COMMON RESPONSE HANDLER
  // Prevents: Unexpected token '<', "<!doctype..."
  // =========================================================
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
        `Server returned non-JSON response (${response.status}). Check your backend URL.`
      );
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error("Invalid JSON response received from server.");
    }
  };

  // =========================================================
  // CLOSE SUCCESS POPUP
  // =========================================================
  const closePopup = () => {
    setPopup(false);
    window.location.reload();
  };

  // =========================================================
  // OPEN TEACHER DETAILS
  // =========================================================
  const openTeacherDec = async (id, fname, lname, sub) => {
    try {
      setTname({
        fname,
        lname,
        sub,
      });

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
            teacherID: id,
          }),
        }
      );

      const result = await parseResponse(response);

      console.log("Teacher details:", result.data);

      setTeacherDetails(result.data);
      setOpenTM(true);
    } catch (error) {
      console.error("Teacher details error:", error);
      alert(error.message);
    }
  };

  // =========================================================
  // GET ENROLLED COURSES
  // =========================================================
  useEffect(() => {
    const getData = async () => {
      try {
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

        console.log("Enrolled courses:", user.data);

        const enrolledCourses = user.data || [];

        setCourseID(enrolledCourses);

        setIdArray(enrolledCourses.map((item) => item._id));
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
      }
    };

    if (ID) {
      getData();
    }
  }, [ID, API_BASE_URL]);

  // =========================================================
  // SEARCH TEACHER / COURSE
  // =========================================================
  const SearchTeacher = async (sub) => {
    const subject = sub.trim().toLowerCase();

    if (!subject) {
      setCourse([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/course/${encodeURIComponent(subject)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await parseResponse(response);

      if (result.statusCode === 200) {
        setCourse(result.data || []);
      } else {
        setCourse([]);
        alert(result.message || "No courses found");
      }

      setData("");
    } catch (error) {
      console.error("Search error:", error);
      alert(error.message);
    }
  };

  // =========================================================
  // ENROLL COURSE
  // =========================================================
  const handleEnroll = async (courseName, id) => {
    try {
      // -------------------------------------------------------
      // STEP 1: VERIFY STUDENT
      // -------------------------------------------------------
      const checkResponse = await fetch(
        `${API_BASE_URL}/api/course/${encodeURIComponent(
          courseName
        )}/${id}/verify/student/${ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const checkResult = await parseResponse(checkResponse);

      console.log("Student verification:", checkResult);

      if (checkResult.statusCode !== 200) {
        alert(checkResult.message || "You cannot enroll in this course.");
        return;
      }

      // -------------------------------------------------------
      // STEP 2: CREATE RAZORPAY ORDER
      // -------------------------------------------------------
      const coursePrice = price[courseName.toLowerCase()];

      if (!coursePrice) {
        alert("Course price is not configured.");
        return;
      }

      const paymentResponse = await fetch(
        `${API_BASE_URL}/api/payment/course/${id}/${encodeURIComponent(
          courseName
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            fees: coursePrice * 100,
          }),
        }
      );

      const paymentData = await parseResponse(paymentResponse);

      console.log("Payment order:", paymentData);

      // -------------------------------------------------------
      // STEP 3: GET RAZORPAY KEY
      // -------------------------------------------------------
      const keyResponse = await fetch(
        `${API_BASE_URL}/api/payment/razorkey`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const keyData = await parseResponse(keyResponse);

      console.log("Razorpay key received");

      // -------------------------------------------------------
      // STEP 4: CHECK RAZORPAY
      // -------------------------------------------------------
      if (!window.Razorpay) {
        alert("Razorpay is not loaded. Please refresh the page.");
        return;
      }

      if (!paymentData?.data?.id) {
        alert("Payment order ID was not received from the server.");
        return;
      }

      if (!keyData?.data?.key) {
        alert("Razorpay key was not received from the server.");
        return;
      }

      // -------------------------------------------------------
      // STEP 5: RAZORPAY OPTIONS
      // -------------------------------------------------------
      const options = {
        key: keyData.data.key,
        amount: coursePrice * 100,
        currency: "INR",
        name: "Shiksharthee",
        description: "Enroll in a course",
        image: logo,
        order_id: paymentData.data.id,

        handler: async (razorpayResponse) => {
          try {
            const {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            } = razorpayResponse;

            // -------------------------------------------------
            // STEP 6: VERIFY PAYMENT
            // -------------------------------------------------
            const verificationData = {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            };

            const verificationResponse = await fetch(
              `${API_BASE_URL}/api/payment/confirmation/course/${id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(verificationData),
              }
            );

            const verificationResult = await parseResponse(
              verificationResponse
            );

            console.log("Payment verification:", verificationResult);

            // -------------------------------------------------
            // STEP 7: ADD STUDENT TO COURSE
            // -------------------------------------------------
            if (verificationResult.statusCode === 200) {
              const addStudentResponse = await fetch(
                `${API_BASE_URL}/api/course/${encodeURIComponent(
                  courseName
                )}/${id}/add/student/${ID}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                }
              );

              const addStudentResult = await parseResponse(
                addStudentResponse
              );

              console.log("Student added:", addStudentResult);

              if (addStudentResult.statusCode === 200) {
                setPopup(true);
              } else {
                alert(
                  addStudentResult.message ||
                    "Payment successful, but enrollment failed."
                );
              }
            } else {
              alert(
                verificationResult.message ||
                  "Payment verification failed."
              );
            }
          } catch (error) {
            console.error("Payment confirmation error:", error);
            alert(error.message);
          }
        },

        prefill: {
          name: "",
          email: "",
        },

        notes: {
          address: "Shiksharthee",
        },

        theme: {
          color: "#3399cc",
        },
      };

      // -------------------------------------------------------
      // STEP 8: OPEN RAZORPAY
      // -------------------------------------------------------
      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      });

      rzp1.open();
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(error.message);
    }
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================
  const formatTime = (minutes) => {
    if (typeof minutes !== "number") {
      return "--:--";
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}:${mins === 0 ? "00" : String(mins).padStart(2, "0")}`;
  };

  return (
    <>
      {/* =====================================================
          SEARCH BAR
      ===================================================== */}
      <div className="search mb-4">
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
              SearchTeacher(data);
            }
          }}
        />

        <button
          className="w-32"
          onClick={() => SearchTeacher(data)}
        >
          Find Teacher
        </button>
      </div>

      {/* =====================================================
          COURSE LIST
      ===================================================== */}
      <div className="overflow-auto">
        {course &&
          course.map((Data) => {
            const courseName = Data?.coursename || "";
            const teacher = Data?.enrolledteacher;
            const enrolledStudents = Data?.enrolledStudent || [];

            return (
              <div
                key={Data._id}
                className="relative bg-blue-600 p-4 gap-6 mb-3 flex rounded-sm max-w-4xl h-20 items-start"
              >
                {/* COURSE NAME */}
                <div className="h-fit font-bold text-blue-900">
                  {courseName.toUpperCase()}
                </div>

                {/* TEACHER NAME */}
                <div
                  onClick={() =>
                    teacher &&
                    openTeacherDec(
                      teacher.Teacherdetails,
                      teacher.Firstname,
                      teacher.Lastname,
                      courseName
                    )
                  }
                  className="text-gray-300 cursor-pointer font-bold"
                >
                  {teacher?.Firstname || ""}{" "}
                  {teacher?.Lastname || ""}
                </div>

                {/* DESCRIPTION */}
                <div className="text-gray-900">
                  <span className="text-black">Desc :</span>{" "}
                  {Data?.description || "No description"}
                </div>

                {/* STUDENT COUNT */}
                <div>
                  {enrolledStudents.length}/20
                </div>

                {/* ENROLL BUTTON */}
                {idArray.includes(Data._id) ? (
                  <div
                    onClick={() =>
                      alert(
                        "You already enrolled, please find another course."
                      )
                    }
                    className="text-white bg-green-900 py-2 px-3 absolute right-4 cursor-not-allowed"
                  >
                    Already Enrolled
                  </div>
                ) : enrolledStudents.length < 20 ? (
                  <div
                    onClick={() =>
                      handleEnroll(courseName, Data._id)
                    }
                    className="text-white bg-blue-900 py-2 px-3 absolute right-4 cursor-pointer"
                  >
                    Enroll Now
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      alert(
                        "Course is already full, please find another course."
                      )
                    }
                    className="text-white bg-red-900 py-2 px-3 absolute right-4 cursor-not-allowed"
                  >
                    Already Full
                  </div>
                )}

                {/* COURSE TIMING */}
                <div className="absolute bottom-2">
                  <span className="mt-2 font-bold">
                    Timing :{" "}
                  </span>

                  {"[ "}

                  {Data?.schedule?.length > 0
                    ? Data.schedule
                        .map((daytime) => {
                          return `${daysName[daytime.day]} ${formatTime(
                            daytime.starttime
                          )} - ${formatTime(daytime.endtime)}`;
                        })
                        .join(", ")
                    : "No schedule"}

                  {" ]"}
                </div>
              </div>
            );
          })}
      </div>

      {/* =====================================================
          TEACHER DETAILS POPUP
      ===================================================== */}
      {openTM && Tdec && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="bg-[#008280] w-96 h-[21rem] rounded-md relative">
            {/* CLOSE BUTTON */}
            <div
              className="absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2"
              onClick={() => setOpenTM(false)}
            >
              ✖️
            </div>

            <div className="flex flex-col justify-center p-5 text-1xl gap-4">
              {/* SUBJECT */}
              <p className="text-center text-2xl bg-blue-900 rounded-sm py-1 text-white mb-5">
                {tname?.sub?.toUpperCase()}
              </p>

              {/* TEACHER NAME */}
              <p>
                Teacher Name :{" "}
                <span className="text-white">
                  {tname?.fname} {tname?.lname}
                </span>
              </p>

              {/* EDUCATION */}
              <p>
                Education :{" "}
                <span className="text-white">
                  Postgraduate from{" "}
                  <b className="text-gray-200">
                    {Tdec?.PGcollege || "Not available"}
                  </b>{" "}
                  with {Tdec?.PGmarks || "N/A"} CGPA
                </span>
              </p>

              {/* EXPERIENCE */}
              <p>
                Experience :{" "}
                <span className="text-white">
                  {Tdec?.Experience || "0"} years
                </span>
              </p>

              {/* COURSE */}
              <p>
                Course :{" "}
                <span className="text-white">
                  {tname?.sub?.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS POPUP
      ===================================================== */}
      {popup && <Success onClose={closePopup} />}
    </>
  );
}

export default Search;