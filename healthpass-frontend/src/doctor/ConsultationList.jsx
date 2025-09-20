import React, { useEffect, useState } from "react";
import { getConsultations } from "../services/doctorService"; // ✅ correct path
import "./ConsultationList.css"; // make this file

const ConsultationList = () => {
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await getConsultations();
        setConsultations(data);
      } catch (error) {
        console.error("Error fetching consultations:", error);
      }
    };
    fetchConsultations();
  }, []);

  return (
    <div className="consultation-list">
      <h2>Consultations</h2>
      <ul>
        {consultations.map((c) => (
          <li key={c.id}>
            <strong>Consultation #{c.id}</strong> — Appointment: {c.appointment} — Notes: {c.notes}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultationList;
