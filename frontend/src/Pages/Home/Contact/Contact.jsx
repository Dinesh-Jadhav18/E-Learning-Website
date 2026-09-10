import React, { useState } from 'react';

import "../Landing/Landing.css";

import Mail from "../../Images/Meet-the-team.svg";

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

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handlemsg = async (e) => {
    e.preventDefault();

    // Validate empty fields
    if (!name.trim() || !email.trim() || !msg.trim()) {
      alert("All fields are required!");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Enter a valid email!");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/contact-us`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: msg.trim(),
          }),
        }
      );

      const result = await parseResponse(response);

      console.log('Contact response:', result);

      alert(result.message || 'Message sent successfully!');

      // Clear form
      setName('');
      setEmail('');
      setMsg('');

    } catch (error) {
      console.error('Contact form error:', error);
      alert(error.message || 'Unable to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="contact">
        <h4>Contact Us</h4>

        <hr className="underLine" />

        <div className="content">
          <img
            src={Mail}
            width={700}
            alt="Contact us"
          />

          <form className="form-submit" onSubmit={handlemsg}>
            <h4>Send Message</h4>

            <input
              type="text"
              placeholder="Name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <textarea
              placeholder="Message"
              className="textArea"
              name="message"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-[19rem] bg-light-blue-800 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send A Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Contact;