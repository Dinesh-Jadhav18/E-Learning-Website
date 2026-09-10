import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Radiobtn from "../Components/RadioBtn/Radiobtn";
import axios from "axios";
import { toast } from "react-hot-toast";

const Forgetpassword = () => {
  const [userType, setUserType] = useState("");
  const [data, setData] = useState({ email: "" });

  const navigate = useNavigate();

  // Your Render backend URL
  const BASE_URL = "https://e-learning-backend-9oie.onrender.com/api";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value,
    });
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();

    // Check email
    if (!data.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Correct email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email.trim())) {
      toast.error("Please provide a valid email");
      return;
    }

    // Check user type
    if (!userType) {
      toast.error("Please select user type");
      return;
    }

    try {
      console.log("User Type:", userType);
      console.log("Email:", data.email);

      const response = await axios.post(
        `${BASE_URL}/${userType}/forgetpassword`,
        {
          Email: data.email.trim(),
        }
      );

      console.log("Response:", response.data);

      toast.success("Email sent successfully");
    } catch (error) {
      console.error("Forgot password error:", error);

      console.error("Server response:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
          "An error occurred while sending the email"
      );
    }
  };

  return (
    <section className="h-[100vh] flex items-center justify-center">
      <form
        noValidate
        className="w-96 p-10 flex flex-col justify-center gap-4 text-white shadow-[0_0_10px_white] bg-cyan-900 rounded-lg"
        onSubmit={onFormSubmit}
      >
        <h1 className="text-2xl font-bold text-white">
          Forgot Your Password?
        </h1>

        <p className="text-lg text-white">
          Enter your email address below to reset your password.
        </p>

        <label
          htmlFor="email"
          className="text-2xl text-white font-semibold rounded-md"
        >
          Email Address
        </label>

        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          value={data.email}
          onChange={handleChange}
          className="bg-transparent border-2 border-white py-3 px-4 focus:outline-none focus:border-yellow-500 rounded-lg"
        />

        <div className="radio-btn">
          <Radiobtn
            userType={userType}
            setUserType={setUserType}
          />
        </div>

        <div className="flex flex-row items-center justify-between mt-4">
          <button
            type="submit"
            className="bg-yellow-500 text-cyan-900 py-2 px-4 font-bold hover:bg-yellow-800 rounded-md"
          >
            Send
          </button>

          <p
            className="text-xl text-yellow-500 flex items-center cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <IoArrowBack className="text-xl" />
            Go back
          </p>
        </div>
      </form>
    </section>
  );
};

export default Forgetpassword;