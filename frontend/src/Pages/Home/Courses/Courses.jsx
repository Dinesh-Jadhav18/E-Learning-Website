import React, { useState } from 'react';
import '../Landing/Landing.css';
import Footer from '../../Footer/Footer';
import Header from '../Header/Header';

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

function Courses() {
  const [facList, setFacList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const teachersList = async (sub) => {
    try {
      setLoading(true);
      setError('');
      setFacList([]);

      const response = await fetch(
        `${API_BASE_URL}/api/course/${sub}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const data = await parseResponse(response);

      console.log('Faculty data:', data);

      setFacList(data?.data || []);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
      setError(error.message || 'Failed to load faculty list');
      setFacList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="courses">
        <p>Faculty List</p>

        <hr className="underLine" />

        {/* Subjects */}
        <div className="subjects">

          <div
            className="subject"
            onClick={() => teachersList('physics')}
          >
            <img
              src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/8e9bf690d23d886f63466a814cfbec78187f91d2"
              alt="Physics"
            />
            <p>Physics</p>
          </div>

          <div
            className="subject"
            onClick={() => teachersList('chemistry')}
          >
            <img
              src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/3e546b344774eb0235acc6bf6dad7814a59d6e95"
              alt="Chemistry"
            />
            <p>Chemistry</p>
          </div>

          <div
            className="subject"
            onClick={() => teachersList('biology')}
          >
            <img
              src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/28ac70002ae0a676d9cfb0f298f3e453d12b5555"
              alt="Biology"
            />
            <p>Biology</p>
          </div>

          <div
            className="subject"
            onClick={() => teachersList('math')}
          >
            <img
              src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/61930117e428a1f0f7268f888a84145f93aa0664"
              alt="Math"
            />
            <p>Math</p>
          </div>

          <div
            className="subject"
            onClick={() => teachersList('computer')}
          >
            <img
              src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/a64c93efe984ab29f1dfb9e8d8accd9ba449f272"
              alt="Computer"
            />
            <p>Computer</p>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center mt-10">
            <p>Loading faculty...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex justify-center items-center mt-10">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Faculty List */}
        {!loading && !error && facList.length > 0 && (
          <div className="flex items-center justify-center gap-10 flex-wrap">

            {facList.map((fac) => {
              const teacher = fac?.enrolledteacher;

              if (!teacher) {
                return null;
              }

              return (
                <div
                  key={fac._id}
                  className="bg-[#99afbc] p-5 rounded-md"
                >
                  <div className="flex gap-3 items-center mb-2">

                    <img
                      src="https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png"
                      alt="profile_img"
                      width={50}
                    />

                    <div className="flex flex-col justify-center items-start pl-3">

                      <p>
                        {teacher.Firstname || ''}{' '}
                        {teacher.Lastname || ''}
                      </p>

                      <h4 className="text-blue-900">
                        {teacher.Email || ''}
                      </h4>

                    </div>
                  </div>

                  {teacher.Email === 'urttsg@gmail.com' ? (
                    <h4>
                      <span className="font-bold text-brown-800">
                        Education :
                      </span>{' '}
                      Post graduate from Calcutta University
                    </h4>
                  ) : (
                    <h4>
                      <span className="font-bold text-brown-800">
                        Education :
                      </span>{' '}
                      Post graduate from Sister Nivedita university
                    </h4>
                  )}

                  {teacher.Email === 'urttsg@gmail.com' ? (
                    <h4>1 years of teaching experience</h4>
                  ) : (
                    <h4>2 years of teaching experience</h4>
                  )}

                </div>
              );
            })}

          </div>
        )}

        {/* No faculty */}
        {!loading && !error && facList.length === 0 && (
          <div className="flex justify-center items-center mt-10">
            <p>Select a subject to view faculty.</p>
          </div>
        )}

      </div>

      <Footer />
    </>
  );
}

export default Courses;