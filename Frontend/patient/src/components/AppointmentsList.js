import React, { useEffect, useState } from "react";

function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in first");
      return;
    }

    fetch("http://127.0.0.1:8000/api/patient/appointments/", {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch appointments");
        }
        return res.json();
      })
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div>
      <h2>My Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments booked yet.</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li key={appt.id}>
              <strong>{appt.doctor.name}</strong> ({appt.doctor.specialization})
              <br />
              Date: {appt.appointment_date} | Time: {appt.appointment_time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AppointmentsList;
