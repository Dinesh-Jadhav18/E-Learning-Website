import React, { useState } from "react";

import "./Styles.css";

import { NavLink, useNavigate } from "react-router-dom";

import Images from "../Images/Grammar-correction.svg";

import Radiobtn from "../Components/RadioBtn/Radiobtn";

import Header from "../Home/Header/Header";

// Backend URL
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
).replace(/\/$/, "");

// Safely parse server response
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

const Signup = () => {
  const [Firstname, setFirstName] = useState("");
  const [Lastname, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setErr("");

    // Client-side validation
    const newErrors = {};

    if (!Firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (!Lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }

    // Email validation
    if (!Email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!Password.trim()) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(Password)) {
      newErrors.password =
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
    }

    // User type validation
    if (!userType) {
      newErrors.userType = "Please select a user type";
    }

    // Stop if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data
    const data = {
      Firstname: Firstname.trim(),
      Lastname: Lastname.trim(),
      Email: Email.trim(),
      Password: Password,
    };

    setLoading(true);

    try {
      /*
       * Backend routes:
       *
       * /api/student/signup
       * /api/teacher/signup
       *
       * If userType = student:
       * https://your-backend.onrender.com/api/student/signup
       *
       * If userType = teacher:
       * https://your-backend.onrender.com/api/teacher/signup
       */

      const response = await fetch(
        `${API_BASE_URL}/api/${userType}/signup`,
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await parseResponse(response);

      if (response.ok) {
        console.log("Registration successful");

        // Show backend message if available
        setErr(responseData.message || "");

        navigate("/varifyEmail");
        return;
      }

      // Bad request / validation error
      if (response.status === 400) {
        setErrors(
          responseData.errors || {
            general:
              responseData.message || "Invalid registration details.",
          }
        );
      } else {
        setErr(
          responseData.message ||
            `Registration failed. Status code: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Signup error:", error);

      setErrors({});
      setErr(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="section">
        <article className="article">
          <div className="header">
            <h3 className="head">WELCOME</h3>
            <h4 className="Sub-head">join us today !!</h4>
          </div>

          <div className="inpts">
            <form onSubmit={handleSubmit}>

              {/* First Name */}
              <input
                type="text"
                className="input-x input-4"
                placeholder="Firstname"
                value={Firstname}
                onChange={(e) => setFirstName(e.target.value)}
              />

              {errors.firstname && (
                <div className="error-message">
                  {errors.firstname}
                </div>
              )}

              {/* Last Name */}
              <input
                type="text"
                className="input-x input-5"
                placeholder="Lastname"
                value={Lastname}
                onChange={(e) => setLastName(e.target.value)}
              />

              {errors.lastname && (
                <div className="error-message">
                  {errors.lastname}
                </div>
              )}

              {/* Email */}
              <input
                type="text"
                className="input-x input-6"
                placeholder="Email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {errors.email && (
                <div className="error-message">
                  {errors.email}
                </div>
              )}

              {/* Password */}
              <input
                type="password"
                className="input-x input-7"
                placeholder="Password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {errors.password && (
                <div className="error-message">
                  {errors.password}
                </div>
              )}

              {/* User Type */}
              <div className="rad-btns">
                <Radiobtn
                  userType={userType}
                  setUserType={setUserType}
                />
              </div>

              {errors.userType && (
                <div className="error-message">
                  {errors.userType}
                </div>
              )}

              {/* Login Link */}
              <div className="signupage">
                <span>Already have an account? </span>

                <NavLink
                  to="/Login"
                  style={{ color: "green" }}
                  className="link"
                >
                  login
                </NavLink>
              </div>

              {/* Signup Button */}
              <div className="btn">
                <button
                  type="submit"
                  className="btn-4"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Signup"}
                </button>
              </div>
            </form>

            {/* General Error */}
            {err && (
              <div className="error-message">
                {err}
              </div>
            )}
          </div>
        </article>

        <div className="right-part">
          <img
            src={Images}
            alt=""
            className="imgs"
          />
        </div>
      </div>

      <p className="text-sm text-red-400 absolute bottom-3 left-3">
        * Password must be at least 8 characters long and include an
        uppercase letter, a lowercase letter, a number, and a special
        character.
      </p>
    </>
  );
};

export default Signup;