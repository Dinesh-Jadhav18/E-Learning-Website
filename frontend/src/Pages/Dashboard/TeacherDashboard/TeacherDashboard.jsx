import React, { useEffect, useState } from 'react';
import teachingImg from '../../Images/Teaching.svg';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import logo from '../../Images/logo.svg';

// Backend URL
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://YOUR-BACKEND-URL.com'
).replace(/\/$/, '');

// Safe response parser
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    if (contentType.includes('application/json')) {
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

  if (!contentType.includes('application/json')) {
    throw new Error(
      'Server returned HTML/text instead of JSON. Check your backend URL.'
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response received from server.');
  }
};

function TeacherDashboard() {
  const { ID } = useParams();
  const navigator = useNavigate();

  const [data, setdata] = useState({});
  const [error, setError] = useState('');

  // Logout
  const Handlelogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const result = await parseResponse(response);

      console.log(result);

      if (result.statusCode === 200) {
        navigator('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  // Get teacher data
  useEffect(() => {
    if (!ID) return;

    const getData = async () => {
      try {
        setError('');

        const response = await fetch(
          `${API_BASE_URL}/api/Teacher/TeacherDocument/${ID}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            credentials: 'include',
          }
        );

        const user = await parseResponse(response);

        console.log('Teacher data:', user);

        setdata(user?.data || {});
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
        setError(error.message);
        setdata({});
      }
    };

    getData();
  }, [ID]);

  return (
    <>
      {/* Navbar */}
      <nav className="bg-[#04253A] px-10 py-3 flex justify-between items-center">
        <NavLink to="/">
          <div className="flex items-center gap-3">
            <img src={logo} className="w-14" alt="Shiksharthee logo" />

            <h1 className="text-2xl text-[#4E84C1] font-bold">
              Shiksharthee
            </h1>
          </div>
        </NavLink>

        <div className="bg-[#0D199D] text-white py-2 px-5 rounded-full cursor-pointer">
          <p onClick={Handlelogout}>Logout</p>
        </div>
      </nav>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 text-center py-2 px-4">
          {error}
        </div>
      )}

      {/* Welcome section */}
      <div className="bg-[#008280] flex justify-between items-center">
        <div className="text-[#071645] font-semibold text-5xl ml-72">
          <h1 className="mb-5">
            Welcome to <span className="text-white">Shiksharthee</span>
          </h1>

          <h3 className="ml-16 text-[#071645]">
            {data.Firstname || ''} {data.Lastname || ''}
          </h3>
        </div>

        <div className="m-5 mr-20">
          <img
            src={teachingImg}
            alt="teaching"
            width={300}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="bg-[#071645] w-52 h-full absolute top-20">
        <div className="flex flex-col gap-5 text-xl items-center text-white mt-8 mb-10">
          <img
            src="https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png"
            alt="profile_img"
            width={50}
          />

          <p>
            {data.Firstname || ''} {data.Lastname || ''}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <NavLink
            to={`/Teacher/Dashboard/${ID}/Home`}
            className={({ isActive }) =>
              isActive
                ? 'bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1]'
                : 'p-3 text-center font-semibold text-[#4E84C1]'
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to={`/Teacher/Dashboard/${ID}/Classes`}
            className={({ isActive }) =>
              isActive
                ? 'bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1]'
                : 'p-3 text-center font-semibold text-[#4E84C1]'
            }
          >
            Classes
          </NavLink>

          <NavLink
            to={`/Teacher/Dashboard/${ID}/Courses`}
            className={({ isActive }) =>
              isActive
                ? 'bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1]'
                : 'p-3 text-center font-semibold text-[#4E84C1]'
            }
          >
            Courses
          </NavLink>
        </div>
      </div>
    </>
  );
}

export default TeacherDashboard;