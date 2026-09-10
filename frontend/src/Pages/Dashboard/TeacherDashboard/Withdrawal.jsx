import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

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

function Withdrawal({ onClose, TA }) {
  const { ID } = useParams();

  const [amount, setAmount] = useState('');
  const [accName, setAccName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [ifc, setIfc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdrawl = async () => {
    const withdrawAmount = Number(amount);
    const balance = Number(TA);

    // Validate account details
    if (!accName.trim() || !accNumber.trim() || !ifc.trim()) {
      alert('All fields are required');
      return;
    }

    // Validate amount
    if (!amount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Enter a valid Amount');
      return;
    }

    // Validate balance
    if (withdrawAmount > balance) {
      alert('Insufficient Amount');
      return;
    }

    if (!ID) {
      alert('Teacher ID is missing');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/payment/teacher/${ID}/withdraw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: withdrawAmount,
          }),
        }
      );

      const user = await parseResponse(response);

      console.log('Withdrawal response:', user);

      alert(user?.message || 'Withdrawal successful');

      onClose();
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(error.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-blue-600 w-80 h-96 rounded-md">
        
        {/* Close button */}
        <div
          className="absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2"
          onClick={onClose}
        >
          ✖️
        </div>

        <div className="flex flex-col items-center justify-center mt-10 font-semibold">
          
          <h1 className="text-2xl mb-10">
            Remuneration
          </h1>

          {/* Amount */}
          <input
            type="number"
            min="1"
            placeholder="Amount"
            className="p-2 mb-3 rounded-md w-56 border-0 outline-0 text-gray-800"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Account Holder Name */}
          <input
            type="text"
            placeholder="Ac Holder Name"
            className="p-2 mb-3 rounded-md w-56 border-0 outline-0 text-gray-800"
            value={accName}
            onChange={(e) => setAccName(e.target.value)}
          />

          {/* Account Number */}
          <input
            type="text"
            placeholder="Account Number"
            className="p-2 mb-3 rounded-md w-56 border-0 outline-0 text-gray-800"
            value={accNumber}
            onChange={(e) => setAccNumber(e.target.value)}
          />

          {/* IFSC */}
          <input
            type="text"
            placeholder="IFSC Code"
            className="p-2 mb-5 rounded-md w-56 border-0 outline-0 text-gray-800"
            value={ifc}
            onChange={(e) => setIfc(e.target.value)}
          />

          {/* Withdrawal button */}
          <button
            onClick={handleWithdrawl}
            disabled={loading}
            className={`bg-green-700 py-2 px-5 rounded-md cursor-pointer text-white ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Withdrawal;