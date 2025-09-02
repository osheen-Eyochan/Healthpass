import React, { useState } from 'react';
import axios from 'axios';

const BookAppointment = () => {
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // assuming token is saved on login

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/patient/appointments/book/',
        {
          doctor,
          appointment_date: date,
          appointment_time: time,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      setMessage('Booking failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Book Appointment</h2>
      <form onSubmit={handleSubmit}>
        <label>Doctor ID:</label>
        <input type="number" value={doctor} onChange={(e) => setDoctor(e.target.value)} required />
        
        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <label>Time:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

        <button type="submit">Book</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BookAppointment;
