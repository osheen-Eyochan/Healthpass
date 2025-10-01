// src/receptionist/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistHeader from "./ReceptionistHeader";
import QrModal from "./QrModal";
import "./ReceptionistDashboard.css";

// Quick Stats Card
const QuickStatCard = ({ title, value, color }) => (
  <div className={`quick-stat-card ${color}`}>
    <h3>{value}</h3>
    <p>{title}</p>
  </div>
);

// Appointment Card
const AppointmentCard = ({ appointment }) => {
  const statusColors = {
    checked_in: "status-green",
    scheduled: "status-yellow",
    cancelled: "status-red",
  };

  return (
    <div className="appointment-card">
      <div className="appointment-info">
        <p><strong>ID:</strong> {appointment.id}</p>
        <p><strong>Patient:</strong> {appointment.patient_name}</p>
        <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
        <p><strong>Specialization:</strong> {appointment.specialization}</p>
        <p><strong>Date:</strong> {appointment.date}</p>
        <p><strong>Time:</strong> {appointment.time}</p>
      </div>
      <div className="appointment-status">
        <span className={`status-badge ${statusColors[appointment.status] || ""}`}>
          {appointment.status?.toUpperCase() || "UNKNOWN"}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const receptionist = JSON.parse(localStorage.getItem("receptionist") || "{}");
  const name = receptionist.full_name || receptionist.username;

  const [stats, setStats] = useState({ totalAppointments: 0, checkedIn: 0, pendingArrivals: 0 });
  const [appointments, setAppointments] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!receptionist || !receptionist.username) {
      navigate("/receptionist/login");
    }
  }, [navigate, receptionist]);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/receptionist/dashboard-stats/");
      const data = await res.json();
      setStats({
        totalAppointments: data.totalAppointments || 0,
        checkedIn: data.checkedIn || 0,
        pendingArrivals: data.pendingArrivals || 0,
      });
    } catch {
      setError("Failed to load stats");
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/receptionist/appointments/");
    const data = await res.json();

    // Since data is already an array, set it directly
    if (Array.isArray(data)) {
      setAppointments(data);
    } else {
      setAppointments([]);
    }
  } catch {
    setError("Failed to load appointments");
  }
 };

  // Load stats & appointments on mount
  useEffect(() => {
    Promise.all([fetchStats(), fetchAppointments()]).finally(() => setLoading(false));
  }, []);

  // Update appointments after QR check-in
  const handleAppointmentFetched = (appointment) => {
  setScanning(false);
  setAppointments((prev) => {
    const updated = prev.filter((a) => a.id !== appointment.id);
    return [appointment, ...updated];
  });

  // Refresh stats after check-in
  fetchStats();
};

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <ReceptionistHeader receptionistName={name} />
      <h2 className="dashboard-title">Receptionist Dashboard</h2>

      {/* Quick Stats */}
      <div className="stats-container">
        <QuickStatCard title="Total Appointments" value={stats.totalAppointments} color="blue" />
        <QuickStatCard title="Patients Checked-In" value={stats.checkedIn} color="green" />
        <QuickStatCard title="Pending Arrivals" value={stats.pendingArrivals} color="yellow" />
      </div>

      {/* Scan Button */}
      {!scanning && (
        <div className="scan-btn-container">
          <button className="scan-btn" onClick={() => setScanning(true)}>
            Scan Patient QR Code
          </button>
        </div>
      )}

      {/* QR Modal */}
      {scanning && (
        <QrModal
          isOpen={scanning}
          onCheckInSuccess={handleAppointmentFetched}
          onClose={() => setScanning(false)}
        />
      )}

      {/* Appointment Cards */}
      <div className="appointments-container">
        <h3 className="appointments-title">Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments available.</p>
        ) : (
          appointments.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
