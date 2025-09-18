import React, { useState, useEffect } from "react";
import API from "../api/api"; // Axios instance with token

export default function TokenSelection({ doctorId, onBooked }) {
  const [date, setDate] = useState("");
  const [tokens, setTokens] = useState([]);
  const [message, setMessage] = useState("");

  const fetchTokens = async () => {
    if (!date) return setMessage("Select a date first!");
    try {
      const res = await API.get(`patient/doctor/${doctorId}/tokens/?date=${date}`);
      setTokens(res.data.tokens);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error fetching tokens");
    }
  };

  const bookToken = async (tokenNum) => {
    try {
      const res = await API.post("patient/book-appointment/", {
        doctor: doctorId,
        date,
        token: tokenNum
      });
      setMessage(`Token ${tokenNum} booked successfully!`);
      onBooked(res.data); // Update appointments in parent component
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error booking token");
    }
  };

  return (
    <div>
      <h3>Book Appointment Token</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={fetchTokens}>Show Tokens</button>

      {tokens.length > 0 && (
        <div>
          <h4>Available Tokens:</h4>
          {tokens.map((t) => (
            <button
              key={t.number}
              disabled={!t.available}
              onClick={() => bookToken(t.number)}
            >
              {t.number}
            </button>
          ))}
        </div>
      )}
      <p>{message}</p>
    </div>
  );
}
