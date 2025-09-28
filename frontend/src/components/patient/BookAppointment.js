import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css"; // Import the CSS file

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
    <div className="patient-dashboard-container"> {/* Added a class for styling */}
      <div className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <hr />

      {/* Book Appointment */}
      <section className="booking-section">
        <h3>Book an Appointment</h3>
        {message && <p className={`message ${message.includes("failed") || message.includes("Error") ? "error" : "success"}`}>{message}</p>}
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="doctor_id">Doctor:</label>
            <select
              id="doctor_id"
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
          </div>

          <div className="form-group">
            <label htmlFor="appointment_date">Date:</label>
            <input
              type="date"
              id="appointment_date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="appointment_time">Time:</label>
            <input
              type="time"
              id="appointment_time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="book-appointment-button">
            Book Appointment
          </button>
        </form>
      </section>

      <hr />

      {/* Appointment List */}
      <section className="appointments-list-section">
        <h3>Your Appointments</h3>
        {appointments.length === 0 ? (
          <p className="no-appointments-message">No appointments booked yet.</p>
        ) : (
          <div className="appointments-grid">
            {appointments.map((app) => (
              <div key={app.id} className="appointment-card">
                <p className="doctor-info">
                  <strong>Dr. {app.doctor.name}</strong> (
                  {app.doctor.specialization})
                </p>
                <p className="appointment-details">
                  Date: {app.appointment_date} | Time: {app.appointment_time}
                </p>
                <p className={`appointment-status status-${app.payment_status.toLowerCase()}`}>
                  Status: {app.payment_status}
                </p>
                {app.qr_code_url && (
                  <div className="qr-code-container">
                    <img
                      src={app.qr_code_url}
                      alt="Appointment QR Code"
                      className="qr-code-image"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}