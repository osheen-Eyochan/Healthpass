// src/doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();
  const doctorInfo = JSON.parse(localStorage.getItem("doctorInfo"));
  const doctorId = doctorInfo?.id;
  const doctorName = doctorInfo?.name || "Doctor";

  const [stats, setStats] = useState({
    total_appointments: 0,
    patients_checked_in: 0,
    completed_consultations: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) {
      navigate("/doctor/login", { replace: true });
      return;
    }

    const fetchDashboard = async () => {
      try {
        // Fetch dashboard stats
        const { data: dashboardData } = await axios.get(
          `http://127.0.0.1:8000/api/doctor/${doctorId}/dashboard/`
        );
        setStats(dashboardData);

        // Fetch upcoming appointments
        const { data: apptData } = await axios.get(
          `http://127.0.0.1:8000/api/doctor/${doctorId}/appointments/`
        );

        // Extract appointments array safely
        const appointmentsArray = Array.isArray(apptData)
          ? apptData
          : apptData.appointments || [];

        // Normalize data for frontend
        const cleanedAppointments = appointmentsArray.map((a) => ({
          ...a,
          patient_id:
            a.patient_id || (a.patient && typeof a.patient === "object" ? a.patient.id : null),
          patient_name:
            a.patient_name || (a.patient && typeof a.patient === "object" ? a.patient.name : "Unknown"),
        }));

        setAppointments(cleanedAppointments);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard or appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [doctorId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorInfo");
    navigate("/doctor/login", { replace: true });
  };

  const startConsultation = (appointment) => {
    if (!appointment?.patient_id) {
      alert("Patient ID missing! Cannot start consultation.");
      console.log("Missing patient ID:", appointment);
      return;
    }
    navigate("/doctor/consultation", { state: { appointment } });
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="doctor-dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {doctorName}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p>{stats.total_appointments}</p>
        </div>
        <div className="stat-card">
          <h3>Patients Checked In</h3>
          <p>{stats.patients_checked_in}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Consultations</h3>
          <p>{stats.completed_consultations}</p>
        </div>
      </div>

      <div className="appointments-section">
        <h3>Upcoming Appointments</h3>
        {appointments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Token</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td>{appt.patient_name}</td>
                  <td>{appt.status}</td>
                  <td>{appt.token || "-"}</td>
                  <td>
                    {appt.status === "checked_in" ? (
                      <button onClick={() => startConsultation(appt)}>
                        Start Consultation
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
