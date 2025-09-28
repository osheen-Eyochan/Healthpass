import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReceptionistHeader from "./ReceptionistHeader";
import QrModal from "./QrModal";

// Quick Stats Card
const QuickStatCard = ({ title, value, color }) => (
  <div
    style={{
      backgroundColor: color,
      color: "white",
      padding: "25px 20px",
      borderRadius: "12px",
      minWidth: "180px",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      transition: "transform 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <h3 style={{ fontSize: "28px", margin: "0" }}>{value}</h3>
    <p style={{ marginTop: "10px", fontWeight: "bold" }}>{title}</p>
  </div>
);

// Appointment Card
const AppointmentCard = ({ appointment }) => (
  <div
    style={{
      borderRadius: "12px",
      padding: "20px",
      margin: "15px auto",
      maxWidth: "850px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      backgroundColor: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transition: "transform 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <div style={{ flex: "1 1 60%" }}>
      <p><strong>ID:</strong> {appointment.id}</p>
      <p><strong>Patient:</strong> {appointment.patient_name}</p>
      <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
      <p><strong>Specialization:</strong> {appointment.specialization}</p>
      <p><strong>Date:</strong> {appointment.date}</p>
      <p><strong>Time:</strong> {appointment.time}</p>
    </div>
    <div style={{ flex: "1 1 30%", textAlign: "right" }}>
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "8px",
          backgroundColor: appointment.status === "checked_in" ? "#10b981" : "#f59e0b",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {appointment.status.toUpperCase()}
      </span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const receptionist = JSON.parse(localStorage.getItem("receptionist") || "{}");
  const name = receptionist.full_name || receptionist.username;

  const [stats, setStats] = useState({ totalAppointments: 0, checkedIn: 0, pendingArrivals: 0 });
  const [appointments, setAppointments] = useState([]);
  const [scanning, setScanning] = useState(false);

  // ✅ Redirect to login if not logged in
  useEffect(() => {
    if (!receptionist || !receptionist.username) {
      navigate("/receptionist/login");
    }
  }, [navigate]);

  // Fetch dashboard stats
  const fetchStats = () => {
    fetch("http://127.0.0.1:8000/api/receptionist/dashboard-stats/")
      .then((res) => res.json())
      .then((data) =>
        setStats({
          totalAppointments: data.totalAppointments || 0,
          checkedIn: data.checkedIn || 0,
          pendingArrivals: data.pendingArrivals || 0,
        })
      )
      .catch(console.error);
  };

  // Fetch all appointments
  const fetchAppointments = () => {
    fetch("http://127.0.0.1:8000/api/receptionist/appointments/")
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchStats();
    fetchAppointments();
  }, []);

  // Called when QR code is scanned and appointment is fetched
  const handleAppointmentFetched = (appointment) => {
    setScanning(false);
    setAppointments((prev) => {
      const updated = prev.filter((a) => a.id !== appointment.id);
      return [appointment, ...updated];
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px", padding: "0 20px" }}>
      {/* ✅ Header already has logout */}
      <ReceptionistHeader receptionistName={name} />

      <h2 style={{ marginTop: "20px", fontSize: "28px" }}>Receptionist Dashboard</h2>

      {/* Quick Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: "25px", flexWrap: "wrap", marginTop: "25px" }}>
        <QuickStatCard title="Total Appointments Today" value={stats.totalAppointments} color="#3b82f6" />
        <QuickStatCard title="Patients Checked-In" value={stats.checkedIn} color="#10b981" />
        <QuickStatCard title="Pending Arrivals" value={stats.pendingArrivals} color="#f59e0b" />
      </div>

      {/* Scan Button */}
      {!scanning && (
        <div style={{ marginTop: "40px" }}>
          <button
            onClick={() => setScanning(true)}
            style={{
              padding: "15px 35px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
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
      {appointments.map((appt) => (
        <AppointmentCard key={appt.id} appointment={appt} />
      ))}
    </div>
  );
};

export default Dashboard;