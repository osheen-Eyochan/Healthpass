import React, { useEffect, useState } from "react";
import axios from "axios";

// Axios instance with token
const API = axios.create({
  baseURL: "http://localhost:8000/api/patient/",
  headers: {
    Authorization: `Token ${localStorage.getItem("token")}`,
  },
});

// TokenSelection component
const TokenSelection = ({ doctorId, onBooked }) => {
  const [date, setDate] = useState("");
  const [tokens, setTokens] = useState([]);
  const [message, setMessage] = useState("");

  const fetchTokens = async () => {
    if (!date) return setMessage("Select a date first!");
    try {
      const res = await API.get(`doctor/${doctorId}/tokens/?date=${date}`);
      setTokens(res.data.tokens);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error fetching tokens");
    }
  };

  const bookToken = async (tokenNum) => {
    try {
      const res = await API.post("book-appointment/", {
        doctor: doctorId,
        date,
        token: tokenNum,
      });
      setMessage(`Token ${tokenNum} booked successfully!`);
      onBooked(res.data); // Update parent
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error booking token");
    }
  };

  return (
    <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
      <h3>Book Appointment Tokens</h3>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={fetchTokens} style={{ marginLeft: "10px" }}>Show Tokens</button>

      {tokens.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <h4>Available Tokens:</h4>
          {tokens.map((t) => (
            <button
              key={t.number}
              disabled={!t.available}
              onClick={() => bookToken(t.number)}
              style={{
                margin: "5px",
                padding: "5px 10px",
                backgroundColor: t.available ? "green" : "red",
                color: "white",
                border: "none",
                cursor: t.available ? "pointer" : "not-allowed",
              }}
            >
              {t.number}
            </button>
          ))}
        </div>
      )}
      <p>{message}</p>
    </div>
  );
};

// AppointmentList component
const AppointmentList = ({ appointments }) => {
  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Your Appointments</h3>
      {appointments.length === 0 && <p>No appointments booked yet.</p>}
      {appointments.length > 0 && (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Token</th>
              <th>Status</th>
              <th>QR Code</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>{appt.doctor.name}</td>
                <td>{appt.appointment_date}</td>
                <td>{appt.token}</td>
                <td>{appt.status}</td>
                <td>
                  <a
                    href={`http://localhost:8000/api/patient/appointments/${appt.id}/qrcode/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View QR
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Main DoctorList component
const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // Fetch doctors
  useEffect(() => {
    API.get("doctors/")
      .then((response) => {
        setDoctors(response.data);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });
  }, []);

  // Fetch patient appointments
  const fetchAppointments = () => {
    API.get("appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments:", err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Doctors</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Available Days</th>
            <th>Available Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.available_days}</td>
                <td>{doctor.available_time}</td>
                <td>
                  <button onClick={() => setSelectedDoctor(doctor.id)}>
                    Book Token
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No doctors available</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedDoctor && (
        <TokenSelection
          doctorId={selectedDoctor}
          onBooked={() => {
            fetchAppointments(); // Refresh appointments after booking
          }}
        />
      )}

      <AppointmentList appointments={appointments} />
    </div>
  );
};

export default DoctorList;