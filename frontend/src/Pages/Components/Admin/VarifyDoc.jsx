import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function VarifyDoc() {
  const { type, adminID, ID } = useParams();

  const [data, setData] = useState(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigator = useNavigate();

  // =====================================================
  // RENDER BACKEND URL
  // =====================================================
  const BASE_URL =
    "https://e-learning-backend-9oie.onrender.com/api";

  // =====================================================
  // HANDLE MESSAGE
  // =====================================================
  const handleMessage = (event) => {
    setValue(event.target.value);
  };

  // =====================================================
  // APPROVE / REJECT / REUPLOAD
  // =====================================================
  const Approval = async (id, type, approve, email) => {
    try {
      setError("");

      const approvalData = {
        Isapproved: approve,
        remarks: value,
        email: email,
      };

      console.log("Approval URL:");
      console.log(
        `${BASE_URL}/admin/${adminID}/approve/${type}/${id}`
      );

      console.log("Approval data:", approvalData);

      const response = await fetch(
        `${BASE_URL}/admin/${adminID}/approve/${type}/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approvalData),
        }
      );

      const responseText = await response.text();

      let responseData = {};

      try {
        responseData = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (jsonError) {
        console.error(
          "Approval API returned non-JSON response:"
        );

        console.error(responseText);

        setError(
          "Server returned an invalid response. Please check the backend API."
        );

        return;
      }

      console.log("Approval response:", responseData);

      if (!response.ok) {
        setError(
          responseData?.message ||
            `Request failed with status ${response.status}`
        );

        console.error(
          "Approval failed:",
          response.status,
          responseData
        );

        return;
      }

      console.log("Approval successful");

      // Go back to admin page after successful action
      navigator(`/admin/${adminID}`);
    } catch (error) {
      console.error("Approval error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  // =====================================================
  // GET DOCUMENT DATA
  // =====================================================
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const URL = `${BASE_URL}/admin/${adminID}/documents/${type}/${ID}`;

        console.log("Document API URL:");
        console.log(URL);

        const response = await fetch(URL, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        let responseData = {};

        try {
          responseData = responseText
            ? JSON.parse(responseText)
            : {};
        } catch (jsonError) {
          console.error(
            "Document API returned non-JSON response:"
          );

          console.error(responseText);

          setError(
            "Server returned HTML instead of JSON. Check your Render API URL and backend route."
          );

          return;
        }

        console.log("Document response:", responseData);

        if (!response.ok) {
          setError(
            responseData?.message ||
              `Failed to load documents (${response.status})`
          );

          return;
        }

        setData(responseData?.data || null);
      } catch (err) {
        console.error("Document error:", err);

        setError(
          "Unable to connect to the server. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (adminID && type && ID) {
      getData();
    }
  }, [adminID, type, ID]);

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <>
        <nav className="h-16 sm:h-20 md:h-24 lg:h-24 w-full bg-[#042439] flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="flex items-center">
            <h1
              onClick={() => navigator(`/admin/${adminID}`)}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-700 font-bold font-mono ml-2 cursor-pointer"
            >
              ◀ Back
            </h1>
          </div>

          <div>
            <h2 className="text-2xl text-white font-bold">
              Document Details
            </h2>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => navigator("/")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="flex justify-center items-center mt-20">
          <p className="text-white text-2xl">
            Loading documents...
          </p>
        </div>
      </>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <>
      {/* ===================================================
          NAVBAR
      =================================================== */}
      <nav className="h-16 sm:h-20 md:h-24 lg:h-24 w-full bg-[#042439] flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex items-center">
          <h1
            onClick={() => navigator(`/admin/${adminID}`)}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-700 font-bold font-mono ml-2 cursor-pointer"
          >
            ◀ Back
          </h1>
        </div>

        <div>
          <h2 className="text-2xl text-white font-bold">
            Document Details
          </h2>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => navigator("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ===================================================
          ERROR
      =================================================== */}
      {error && (
        <div className="flex justify-center mt-5">
          <p className="text-red-500 text-lg font-semibold">
            {error}
          </p>
        </div>
      )}

      {/* ===================================================
          STUDENT DOCUMENTS
      =================================================== */}
      {type === "student" &&
        data &&
        data.theStudent &&
        data.studentDocs && (
          <>
            {/* Student Information */}
            <div className="flex gap-10 text-gray-200 justify-center mt-5 text-[1.3rem] flex-wrap">
              <p>
                Full Name : {data.theStudent.Firstname}{" "}
                {data.theStudent.Lastname}
              </p>

              <p>
                Phone No : {data.studentDocs.Phone}
              </p>

              <p>
                Highest Education :{" "}
                {data.studentDocs.Highesteducation}
              </p>

              <p>
                Address : {data.studentDocs.Address}
              </p>
            </div>

            {/* Documents */}
            <div className="flex mt-10 justify-center gap-20 flex-wrap text-gray-200 font-bold">

              {/* Secondary */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.studentDocs.Secondary}
                  alt="Secondary Marksheet"
                  width={500}
                />

                <p>
                  10th Marksheet
                  <span className="text-[#8DE855]">
                    {" "}
                    : {data.studentDocs.SecondaryMarks}%
                  </span>
                </p>
              </div>

              {/* Higher Secondary */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.studentDocs.Higher}
                  alt="Higher Secondary Marksheet"
                  width={500}
                />

                <p>
                  12th Marksheet
                  <span className="text-[#8DE855]">
                    {" "}
                    : {data.studentDocs.HigherMarks}%
                  </span>
                </p>
              </div>

              {/* Aadhaar */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.studentDocs.Aadhaar}
                  alt="Aadhaar Card"
                  width={500}
                />

                <p>Aadhaar Card</p>
              </div>

              {/* Action Section */}
              <div className="flex items-end mb-10 flex-col gap-10">

                {/* Remarks */}
                <textarea
                  value={value}
                  onChange={handleMessage}
                  className="w-96 h-60 mt-6 text-black p-5"
                  placeholder="Write reason for rejecting application ..."
                />

                {/* Buttons */}
                <div className="flex items-center gap-3">

                  {/* Approve */}
                  <button
                    className="px-5 py-1 bg-green-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-green-900"
                    onClick={() =>
                      Approval(
                        data.theStudent._id,
                        "student",
                        "approved",
                        data.theStudent.Email
                      )
                    }
                  >
                    Approve !
                  </button>

                  {/* Reject */}
                  <button
                    className="px-5 py-1 bg-red-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-red-900"
                    onClick={() =>
                      Approval(
                        data.theStudent._id,
                        "student",
                        "rejected",
                        data.theStudent.Email
                      )
                    }
                  >
                    Reject !
                  </button>

                  {/* Reupload */}
                  <button
                    className="px-5 py-1 bg-blue-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-blue-900"
                    onClick={() =>
                      Approval(
                        data.theStudent._id,
                        "student",
                        "reupload",
                        data.theStudent.Email
                      )
                    }
                  >
                    Reupload !
                  </button>

                </div>
              </div>
            </div>
          </>
        )}

      {/* ===================================================
          TEACHER DOCUMENTS
      =================================================== */}
      {type === "teacher" &&
        data &&
        data.theTeacher &&
        data.teacherDocs && (
          <>
            {/* Teacher Information */}
            <div className="flex gap-10 text-gray-200 justify-center mt-5 text-[1.3rem] flex-wrap">
              <p>
                Full Name : {data.theTeacher.Firstname}{" "}
                {data.theTeacher.Lastname}
              </p>

              <p>
                Phone No : {data.teacherDocs.Phone}
              </p>

              <p>
                Experience :{" "}
                {data.teacherDocs.Experience} years
              </p>

              <p>
                Address : {data.teacherDocs.Address}
              </p>
            </div>

            {/* Documents */}
            <div className="flex mt-10 justify-center gap-20 flex-wrap text-gray-200 font-bold">

              {/* Secondary */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.teacherDocs.Secondary}
                  alt="Secondary Marksheet"
                  width={500}
                />

                <p>
                  10th Marksheet
                  <span className="text-[#8DE855]">
                    {" "}
                    : {data.teacherDocs.SecondaryMarks}%
                  </span>
                </p>
              </div>

              {/* Higher Secondary */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.teacherDocs.Higher}
                  alt="Higher Secondary Marksheet"
                  width={500}
                />

                <p>
                  12th Marksheet
                  <span className="text-[#8DE855]">
                    {" "}
                    : {data.teacherDocs.HigherMarks}%
                  </span>
                </p>
              </div>

              {/* UG */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.teacherDocs.UG}
                  alt="UG Marksheet"
                  width={500}
                />

                <p>
                  U.G. Marksheet
                  <span className="text-[#8DE855]">
                    {" "}
                    : {data.teacherDocs.UGmarks}
                  </span>
                </p>
              </div>

              {/* PG */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.teacherDocs.PG}
                  alt="PG Marksheet"
                  width={500}
                />

                <p>
                  P.G. Marksheet
                  <span className="text-[#8DE855]">
                    {" "}
                    : {data.teacherDocs.PGmarks}
                  </span>
                </p>
              </div>

              {/* Aadhaar */}
              <div className="m-5 flex flex-col gap-3">
                <img
                  src={data.teacherDocs.Aadhaar}
                  alt="Aadhaar Card"
                  width={500}
                />

                <p>Aadhaar Card</p>
              </div>

              {/* Action Section */}
              <div className="flex items-end mb-10 flex-col gap-10">

                {/* Remarks */}
                <textarea
                  value={value}
                  onChange={handleMessage}
                  className="w-96 h-60 mt-6 text-black p-5"
                  placeholder="Write reason for rejecting application ..."
                />

                {/* Buttons */}
                <div className="flex items-center gap-3">

                  {/* Approve */}
                  <button
                    className="px-5 py-1 bg-green-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-green-900"
                    onClick={() =>
                      Approval(
                        data.theTeacher._id,
                        "teacher",
                        "approved",
                        data.theTeacher.Email
                      )
                    }
                  >
                    Approve !
                  </button>

                  {/* Reject */}
                  <button
                    className="px-5 py-1 bg-red-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-red-900"
                    onClick={() =>
                      Approval(
                        data.theTeacher._id,
                        "teacher",
                        "rejected",
                        data.theTeacher.Email
                      )
                    }
                  >
                    Reject !
                  </button>

                  {/* Reupload */}
                  <button
                    className="px-5 py-1 bg-blue-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:bg-blue-900 hover:scale-95"
                    onClick={() =>
                      Approval(
                        data.theTeacher._id,
                        "teacher",
                        "reupload",
                        data.theTeacher.Email
                      )
                    }
                  >
                    Reupload !
                  </button>

                </div>
              </div>
            </div>
          </>
        )}
    </>
  );
}

export default VarifyDoc;