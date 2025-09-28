// AppointmentsTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AppointmentsTable.css";

const STATUS_LABEL = {
  scheduled: "Scheduled",
  checked_in: "Checked-In",
  in_consultation: "In Consultation",
  completed: "Completed",
};

function StatusBadge({ status }) {
  return <span className={`status ${status || ""}`}>{STATUS_LABEL[status] || status}</span>;
}

export default function AppointmentsTable({ onOpenDetails, refreshKey = 0 }) {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/receptionist/appointments/");
      let data = res.data;
      // handle different API shapes
      if (data.appointments) data = data.appointments;
      if (data.results) data = data.results;
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch appointments", e);
      setError("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch on mount and when refreshKey changes
  useEffect(() => {
    fetchAppointments();
  }, [refreshKey]);

  // filter + search
  useEffect(() => {
    let result = [...appointments];
    if (activeTab !== "all") {
      result = result.filter((a) => a.status === activeTab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          (a.patient_name && a.patient_name.toLowerCase().includes(q)) ||
          (a.id && String(a.id).includes(q)) ||
          (a.token && String(a.token).includes(q))
      );
    }
    setFiltered(result);
  }, [appointments, activeTab, search]);

  return (
    <div className="appt-container">
      <div className="tabs">
        {["all", "scheduled", "checked_in", "in_consultation", "completed"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All" : tab.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by patient name, token or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="info">Loading appointments...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No appointments found
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.patient_name}</td>
                    <td>{a.doctor_name}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      <button className="details-btn" onClick={() => onOpenDetails && onOpenDetails(a.id)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}