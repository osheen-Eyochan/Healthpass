import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const [doctorInfo, setDoctorInfo] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const doctorId = localStorage.getItem("doctor_id");
    if (!doctorId) {
      setError("Doctor ID not found. Please login again.");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        // 1️⃣ Fetch doctor stats
        const statsResp = await fetch(
          `http://127.0.0.1:8000/api/doctor/${doctorId}/dashboard/`
        );
        if (!statsResp.ok) throw new Error(`Server error: ${statsResp.status}`);
        const statsData = await statsResp.json();

        if (statsData.success) {
          setStats({
            total_appointments: statsData.total_appointments,
            patients_checked_in: statsData.patients_checked_in,
            completed_consultations: statsData.completed_consultations,
          });
        } else {
          setError("Failed to load dashboard stats.");
        }

        // 2️⃣ Fetch upcoming/checked-in appointments
        const apptResp = await fetch(
          `http://127.0.0.1:8000/api/doctor/${doctorId}/appointments/`
        );
        if (!apptResp.ok) throw new Error(`Server error: ${apptResp.status}`);
        const apptData = await apptResp.json();

        if (apptData.success) {
          // Map appointments with date/time
          const appts = apptData.appointments.map((appt) => ({
            id: appt.id,
            patient_name: appt.patient_name,
            date: appt.date,
            time: appt.time,
            status: appt.status,
          }));
          setAppointments(appts);
        } else {
          setError("Failed to load appointments.");
        }

        // 3️⃣ Optionally set doctorInfo from localStorage
        setDoctorInfo({
          full_name: localStorage.getItem("doctor_name"),
          email: localStorage.getItem("doctor_email"),
        });

      } catch (err) {
        console.error(err);
        setError("Error fetching dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("doctor_id");
    localStorage.removeItem("doctor_name");
    localStorage.removeItem("doctor_email");
    navigate("/doctor/login");
  };

  const startConsultation = (patientId, patientName) => {
    navigate(`/doctor/consultations/create/${patientId}/${patientName}`);
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {doctorInfo.full_name || "Doctor"}</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-stats">
        <h3>Stats</h3>
        <div className="stats-cards">
          <div className="stat-card">
            <h4>Total Appointments</h4>
            <p>{stats.total_appointments || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Patients Checked-In</h4>
            <p>{stats.patients_checked_in || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Completed Consultations</h4>
            <p>{stats.completed_consultations || 0}</p>
          </div>
        </div>
      </section>

      <section className="upcoming-patients">
        <h3>Checked-In Patients</h3>
        {appointments.length === 0 ? (
          <p>No patients checked in yet.</p>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.patient_name}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td>
                    <span className={`status ${appt.status.replace(" ", "-")}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="consult-btn"
                      onClick={() =>
                        startConsultation(appt.id, appt.patient_name)
                      }
                    >
                      Start Consultation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default DoctorDashboard;
