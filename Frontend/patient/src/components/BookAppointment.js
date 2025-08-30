import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch doctors + appointments
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login"); // Redirect if not logged in
      return;
    }

    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/patient/doctors/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        setMessage(err.message);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/patient/appointments/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setMessage(err.message);
      }
    };

    fetchDoctors();
    fetchAppointments();
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Book appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/patient/book-appointment/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Appointment booked successfully!");
        setFormData({
          doctor_id: "",
          appointment_date: "",
          appointment_time: "",
        });
        // refresh appointments
        const refresh = await fetch(
          "http://127.0.0.1:8000/api/patient/appointments/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          }
        );
        setAppointments(await refresh.json());
      } else {
        setMessage(data.error || "Booking failed");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Patient Dashboard</h2>
      <button onClick={handleLogout} style={{ float: "right" }}>
        Logout
      </button>
      <hr />

      {/* Book Appointment */}
      <h3>Book an Appointment</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Doctor:</label>
        <br />
        <select
          name="doctor_id"
          value={formData.doctor_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a doctor</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} - {doc.specialization}
            </option>
          ))}
        </select>
        <br />
        <br />

        <label>Date:</label>
        <br />
        <input
          type="date"
          name="appointment_date"
          value={formData.appointment_date}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label>Time:</label>
        <br />
        <input
          type="time"
          name="appointment_time"
          value={formData.appointment_time}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <button type="submit">Book Appointment</button>
      </form>

      <hr />

      {/* Appointment List */}
      <h3>Your Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments booked yet.</p>
      ) : (
        appointments.map((app) => (
          <div
            key={app.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <p>
              <strong>Dr. {app.doctor.name}</strong> (
              {app.doctor.specialization})
            </p>
            <p>
              Date: {app.appointment_date} | Time: {app.appointment_time}
            </p>
            <p>Status: {app.payment_status}</p>
            {/* ✅ QR Code */}
            {app.qr_code_url && (
              <img
                src={app.qr_code_url}
                alt="Appointment QR Code"
                width="120"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
