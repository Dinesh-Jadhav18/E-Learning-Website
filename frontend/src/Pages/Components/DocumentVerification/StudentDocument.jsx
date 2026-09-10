import React, { useEffect, useState } from "react";
import Input from "../DocumentVerification/InputComponent/Input.jsx";
import InputUpload from "../DocumentVerification/Inputupload/InputUpload.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import logo from "../../Images/logo.svg";

const StudentDocument = () => {
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const { Data } = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  // =====================================================
  // RENDER BACKEND URL
  // =====================================================
  const BASE_URL =
    "https://e-learning-backend-9oie.onrender.com/api";

  // =====================================================
  // FORM DATA
  // =====================================================
  const [formData, setFormData] = useState({
    Phone: "",
    Address: "",
    Highesteducation: "",
    SecondarySchool: "",
    HigherSchool: "",
    SecondaryMarks: "",
    HigherMarks: "",
    Aadhaar: null,
    Secondary: null,
    Higher: null,
  });

  // =====================================================
  // GET STUDENT DATA
  // =====================================================
  useEffect(() => {
    const getData = async () => {
      try {
        setError("");

        const URL = `${BASE_URL}/student/StudentDocument/${Data}`;

        console.log("Student Document GET URL:");
        console.log(URL);

        const response = await fetch(URL, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        let user = {};

        try {
          user = responseText
            ? JSON.parse(responseText)
            : {};
        } catch (jsonError) {
          console.error(
            "Server returned non-JSON response:"
          );
          console.error(responseText);

          setError(
            "Server returned HTML instead of JSON. Please check your Render backend URL and route."
          );

          return;
        }

        console.log("Student document response:", user);

        if (!response.ok) {
          setError(
            user?.message ||
              `Failed to fetch data (${response.status})`
          );

          return;
        }

        setData(user?.data || {});

        // Set existing student data into form
        setFormData({
          Phone: user?.data?.Phone || "",
          Address: user?.data?.Address || "",
          Highesteducation:
            user?.data?.Highesteducation || "",
          SecondarySchool:
            user?.data?.SecondarySchool || "",
          HigherSchool:
            user?.data?.HigherSchool || "",
          SecondaryMarks:
            user?.data?.SecondaryMarks || "",
          HigherMarks:
            user?.data?.HigherMarks || "",
          Aadhaar: null,
          Secondary: null,
          Higher: null,
        });
      } catch (error) {
        console.error("Error fetching student data:", error);

        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    };

    if (Data) {
      getData();
    }
  }, [Data]);

  // =====================================================
  // HANDLE FILE CHANGE
  // =====================================================
  const handleFileChange = (fileType, e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      [fileType]: file,
    }));
  };

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // HANDLE FORM SUBMIT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoader(true);
    setError("");

    const formDataObj = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      // Do not append null file values
      if (value !== null && value !== undefined) {
        formDataObj.append(key, value);
      }
    });

    try {
      const URL = `${BASE_URL}/student/verification/${Data}`;

      console.log("Student verification POST URL:");
      console.log(URL);

      const response = await fetch(URL, {
        method: "POST",
        credentials: "include",
        body: formDataObj,
      });

      const responseText = await response.text();

      let responseData = {};

      try {
        responseData = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (jsonError) {
        console.error(
          "Verification API returned non-JSON response:"
        );

        console.error(responseText);

        setLoader(false);

        setError(
          "Server returned HTML instead of JSON. Please check your Render backend route."
        );

        return;
      }

      console.log(
        "Verification response:",
        responseData
      );

      setLoader(false);

      if (!response.ok) {
        setError(
          responseData?.message ||
            `Submission failed (${response.status})`
        );

        return;
      }

      console.log(
        "Form submitted successfully!"
      );

      navigate("/pending");
    } catch (error) {
      console.error(
        "Error submitting student documents:",
        error
      );

      setLoader(false);

      setError(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <>
      {/* =================================================
          LOADER
      ================================================= */}
      {loader && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <RotatingLines
            visible={true}
            height="100"
            width="100"
            color="#0D286F"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />

          <span className="text-white text-xl mt-3">
            Uploading ...
          </span>
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="flex items-center justify-between px-10 py-2 bg-[#0D286F]">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            className="w-14"
            alt="logo"
          />

          <h1 className="text-2xl text-[#4E84C1] font-bold">
            Shiksharthee
          </h1>
        </div>

        <h2 className="text-white text-xl">
          Document Verification (Student)
        </h2>
      </div>

      <hr />

      {/* =================================================
          FORM
      ================================================= */}
      <form onSubmit={handleSubmit}>
        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}
        <p className="text-[#4E84C1] p-5 px-10">
          Personal Information
        </p>

        <div className="flex flex-wrap gap-20 px-36 mb-10">
          {/* First Name */}
          <Input
            label={"First Name"}
            placeholder={"First Name"}
            value={data?.Firstname || ""}
            readonly
          />

          {/* Last Name */}
          <Input
            label={"Last Name"}
            placeholder={"Last Name"}
            value={data?.Lastname || ""}
            readonly
          />

          {/* Phone */}
          <Input
            label={"Phone No."}
            placeholder={"Phone No."}
            value={formData.Phone}
            onChange={(e) =>
              handleInputChange(
                "Phone",
                e.target.value
              )
            }
          />
        </div>

        {/* =================================================
            ADDRESS / EDUCATION / AADHAAR
        ================================================= */}
        <div className="flex flex-wrap gap-20 px-36">
          {/* Address */}
          <Input
            label={"Home Address"}
            placeholder={"Home Address"}
            value={formData.Address}
            onChange={(e) =>
              handleInputChange(
                "Address",
                e.target.value
              )
            }
          />

          {/* Highest Education */}
          <Input
            label={"Highest Education"}
            placeholder={"Highest Education"}
            value={formData.Highesteducation}
            onChange={(e) =>
              handleInputChange(
                "Highesteducation",
                e.target.value
              )
            }
          />

          {/* Aadhaar */}
          <InputUpload
            label={"Upload Aadhar Card"}
            placeholder={"Upload Aadhar Card"}
            value={formData.Aadhaar}
            onChange={(e) =>
              handleFileChange(
                "Aadhaar",
                e
              )
            }
          />
        </div>

        {/* =================================================
            EDUCATIONAL INFORMATION
        ================================================= */}
        <p className="text-[#4E84C1] p-5 px-10 pt-10">
          Educational Information
        </p>

        <div className="border h-full mx-36">

          {/* =================================================
              SECONDARY
          ================================================= */}
          <div className="flex flex-row gap-7">
            <div className="bg-[#0D286F] p-[1rem] m-3 rounded-sm">
              <p className="text-white text-sm">
                Secondary
              </p>
            </div>

            {/* Board Name */}
            <Input
              placeholder={"10th Board Name"}
              value={formData.SecondarySchool}
              onChange={(e) =>
                handleInputChange(
                  "SecondarySchool",
                  e.target.value
                )
              }
            />

            {/* Marks */}
            <Input
              placeholder={"Total Marks (%)"}
              value={formData.SecondaryMarks}
              onChange={(e) =>
                handleInputChange(
                  "SecondaryMarks",
                  e.target.value
                )
              }
            />

            {/* File */}
            <div className="mt-[-1.5rem]">
              <InputUpload
                placeholder={"Upload 10th Result"}
                value={formData.Secondary}
                onChange={(e) =>
                  handleFileChange(
                    "Secondary",
                    e
                  )
                }
              />
            </div>
          </div>

          <hr />

          {/* =================================================
              HIGHER SECONDARY
          ================================================= */}
          <div className="flex flex-row gap-7">
            <div className="bg-[#0D286F] p-[1rem] m-3 rounded-sm">
              <p className="text-white text-sm">
                Higher Secondary
              </p>
            </div>

            {/* Board Name */}
            <Input
              placeholder={"12th Board Name"}
              value={formData.HigherSchool}
              onChange={(e) =>
                handleInputChange(
                  "HigherSchool",
                  e.target.value
                )
              }
            />

            {/* Marks */}
            <Input
              placeholder={"Total Marks (%)"}
              value={formData.HigherMarks}
              onChange={(e) =>
                handleInputChange(
                  "HigherMarks",
                  e.target.value
                )
              }
            />

            {/* File */}
            <div className="mt-[-1.5rem]">
              <InputUpload
                placeholder={"Upload 12th Result"}
                value={formData.Higher}
                onChange={(e) =>
                  handleFileChange(
                    "Higher",
                    e
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}
        {error && (
          <p className="text-red-400 text-xl m-5 text-center font-semibold">
            !! {error}
          </p>
        )}

        {/* =================================================
            SUBMIT
        ================================================= */}
        <div className="bg-[#0D286F] p-3 m-3 mt-1 rounded-md absolute right-32 bottom-5 cursor-pointer">
          <button
            className="text-white text-sm"
            type="submit"
            disabled={loader}
          >
            {loader
              ? "Uploading..."
              : "Submit ▶️"}
          </button>
        </div>
      </form>
    </>
  );
};

export default StudentDocument;