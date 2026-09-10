import React, { useState } from "react";
import "./Login.css";
import Admin from "./Images/Admin.svg";
import { useNavigate } from "react-router-dom";
import Header from "../Home/Header/Header";

// Backend URL
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://YOUR-BACKEND-URL.com"
).replace(/\/$/, "");

// Safely handle JSON responses
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

export default function AdminLogin() {
  const [User, setUser] = useState("");
  const [Password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setErr("");

    // Client-side validation
    const newErrors = {};

    if (!User.trim()) {
      newErrors.User = "User Name is required";
    }

    if (!Password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      username: User.trim(),
      password: Password,
    };

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await parseResponse(response);

      setErr(responseData.message || "");

      // Successful login
      if (response.ok) {
        const userid = responseData?.data?.admin?._id;

        if (!userid) {
          throw new Error(
            "Login successful, but admin ID was not received from the server."
          );
        }

        navigate(`/admin/${userid}`);
        return;
      }

      // Incorrect password
      if (response.status === 401) {
        setErrors({
          password:
            responseData.message || "Incorrect password",
        });
      }

      // Account locked/disabled
      else if (response.status === 403) {
        setErrors({
          general:
            responseData.message || "Login failed",
        });
      }

      // Admin does not exist / bad request
      else if (response.status === 400) {
        setErrors({
          general:
            responseData.message || "Admin does not exist",
        });
      }

      // Other errors
      else {
        setErrors({
          general:
            responseData.message ||
            "An unexpected error occurred",
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);

      setErr("");

      setErrors({
        general:
          error.message ||
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <section className="main">
        {/* Image */}
        <div className="img-3">
          <img
            src={Admin}
            width={500}
            alt="Admin Login"
          />
        </div>

        <div className="container py-5">
          <div className="para1">
            <h2>WELCOME BACK!</h2>
          </div>

          <div className="para">
            <h5>Please Log Into Your Account.</h5>
          </div>

          <div className="form">
            <form onSubmit={handleSubmit}>

              {/* Username */}
              <div className="input-1">
                <input
                  type="text"
                  placeholder="User name"
                  className="input-0"
                  value={User}
                  onChange={(e) => {
                    setUser(e.target.value);

                    if (errors.User) {
                      setErrors((prev) => ({
                        ...prev,
                        User: "",
                      }));
                    }
                  }}
                />

                {errors.User && (
                  <div className="error-message">
                    {errors.User}
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

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }
                  }}
                />

                {errors.password && (
                  <div className="error-message">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Login Button */}
              <div className="btns">
                <button
                  type="submit"
                  className="btns-1"
                  disabled={loading}
                >
                  {loading ? "Logging In..." : "Log In"}
                </button>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="error-message">
                  {errors.general}
                </div>
              )}

            </form>
          </div>
        </div>
      </section>
    </>
  );
}