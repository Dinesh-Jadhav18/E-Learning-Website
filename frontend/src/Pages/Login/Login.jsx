import React, { useState } from "react";

import HR from "../Login/Images/HR.svg";

import "./Login.css";

import { NavLink, useNavigate } from "react-router-dom";

import Radiobtn from "../Components/RadioBtn/Radiobtn";

import Header from "../Home/Header/Header";

export default function Login() {
  // State to hold user input and errors
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  // Your deployed Render backend URL
  const BASE_URL = "https://e-learning-backend-9oie.onrender.com/api";

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setErr("");

    // Client-side validation
    const newErrors = {};

    if (!Email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email.trim())) {
      newErrors.email = "Invalid email format";
    }

    if (!Password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!userType) {
      newErrors.general = "Please select Student or Teacher";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data object to send to backend
    const data = {
      Email: Email.trim(),
      Password: Password,
    };

    try {
      console.log("Login URL:", `${BASE_URL}/${userType}/login`);
      console.log("User Type:", userType);
      console.log("Email:", Email);

      // Send login request to Render backend
      const response = await fetch(
        `${BASE_URL}/${userType}/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      // Read response safely
      const responseText = await response.text();

      let responseData = {};

      try {
        responseData = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (jsonError) {
        console.error("Invalid JSON response:", responseText);

        setErrors({
          general: "Server returned an invalid response",
        });

        return;
      }

      console.log("Login response:", responseData);

      // Handle unsuccessful response
      if (!response.ok) {
        console.error(
          "Login failed:",
          response.status,
          responseData
        );

        if (response.status === 401) {
          setErrors({
            password:
              responseData.message || "Incorrect password",
          });
        } else if (response.status === 403) {
          setErrors({
            general:
              responseData.message ||
              "Your account is disabled or not authorized",
          });
        } else if (response.status === 400) {
          setErrors({
            general:
              responseData.message ||
              "User does not exist",
          });
        } else if (response.status === 404) {
          setErrors({
            general:
              "Login API route was not found",
          });
        } else if (response.status === 405) {
          setErrors({
            general:
              "Login method is not allowed. Check the backend POST route.",
          });
        } else if (response.status === 422) {
          setErrors({
            general:
              responseData.message ||
              '"Email" must be a valid email',
          });
        } else {
          setErrors({
            general:
              responseData.message ||
              `Login failed (${response.status})`,
          });
        }

        return;
      }

      // Check if user data exists
      const user = responseData?.data?.user;

      if (!user) {
        console.error("User data missing:", responseData);

        setErrors({
          general: "Login successful, but user data was not received",
        });

        return;
      }

      const userid = user._id;

      console.log("Login successful");
      console.log("User:", user);
      console.log("User ID:", userid);
      console.log("Approval status:", user.Isapproved);

      // ==============================
      // PENDING
      // ==============================
      if (user.Isapproved === "pending") {
        if (user.Teacherdetails || user.Studentdetails) {
          navigate("/pending");
        } else {
          if (userType === "student") {
            navigate(`/StudentDocument/${userid}`);
          } else if (userType === "teacher") {
            navigate(`/TeacherDocument/${userid}`);
          }
        }
      }

      // ==============================
      // APPROVED
      // ==============================
      else if (user.Isapproved === "approved") {
        if (userType === "student") {
          navigate(`/Student/Dashboard/${userid}/Search`);
        } else if (userType === "teacher") {
          navigate(`/Teacher/Dashboard/${userid}/Home`);
        }
      }

      // ==============================
      // REUPLOAD
      // ==============================
      else if (user.Isapproved === "reupload") {
        navigate(`/rejected/${userType}/${userid}`);
      }

      // ==============================
      // BANNED / OTHER STATUS
      // ==============================
      else {
        setErr("You are banned from our platform!");
      }
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        general:
          "Unable to connect to the server. Please try again.",
      });
    }
  };

  return (
    <>
      <Header />

      <section className="main">
        <div className="container">

          {/* Headings */}
          <div className="para1">
            <h2>WELCOME BACK!</h2>
          </div>

          <div className="para">
            <h5>Please Log Into Your Account.</h5>
          </div>

          <div className="form">
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="input-1">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input-0"
                  value={Email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                    setErr("");
                  }}
                />

                {errors.email && (
                  <div className="error-message">
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="input-2">
                <input
                  type="password"
                  placeholder="Password"
                  className="input-0"
                  value={Password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                    setErr("");
                  }}
                />

                {errors.password && (
                  <div className="error-message">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Radio buttons */}
              <div className="radio-btn">
                <Radiobtn
                  userType={userType}
                  setUserType={setUserType}
                />
              </div>

              {/* Signup */}
              <div className="signup-link">
                <span>Don't have an account? </span>

                <NavLink
                  to="/signup"
                  className="link text-yellow-400 text-semibold text-md"
                >
                  signup
                </NavLink>
              </div>

              {/* Forget Password */}
              <div
                className="text-yellow-400 text-semibold pt-3 cursor-pointer"
                onClick={() => navigate("/forgetpassword")}
              >
                Forget Password?
              </div>

              {/* Login button */}
              <div className="btns">
                <button
                  type="submit"
                  className="btns-1"
                >
                  Log In
                </button>
              </div>

              {/* General errors */}
              {errors.general && (
                <p className="text-red-400 text-sm">
                  {errors.general}
                </p>
              )}

              {err && (
                <p className="text-red-400 text-sm">
                  {err}
                </p>
              )}

            </form>
          </div>
        </div>

        {/* Image */}
        <div className="img-3">
          <img
            src={HR}
            width={600}
            alt=""
          />
        </div>
      </section>
    </>
  );
}