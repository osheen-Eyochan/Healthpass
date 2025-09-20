// src/doctor/ConsultationCreate.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select/creatable"; // react-select with creatable option
import "./ConsultationCreate.css";

function ConsultationCreate() {
  const { patientId, patientName } = useParams();
  const navigate = useNavigate();

  const [patientInfo, setPatientInfo] = useState({
    name: patientName,
    age: "",
    token: "",
    allergies: [],
    conditions: [],
  });

  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [medicineMaster, setMedicineMaster] = useState([]);
  const [followUp, setFollowUp] = useState(false);
  const [followUpDays, setFollowUpDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch patient details
  useEffect(() => {
    async function fetchPatientDetails() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/patient/${patientId}/`);
        if (!res.ok) throw new Error("Failed to fetch patient info");
        const data = await res.json();
        setPatientInfo({
          name: data.full_name,
          age: data.age,
          token: data.token,
          allergies: data.allergies || [],
          conditions: data.conditions || [],
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchPatientDetails();
  }, [patientId]);

  // Fetch medicine master
  useEffect(() => {
    async function fetchMedicineMaster() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/doctor/medicines/`);
        if (!res.ok) throw new Error("Failed to fetch medicines");
        const data = await res.json();
        setMedicineMaster(data.medicines || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMedicineMaster();
  }, []);

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeMedicineRow = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };

  const handleSaveConsultation = async () => {
    const payload = {
      patient_id: patientId,
      symptoms,
      notes,
      medicines,
      follow_up_required: followUp,
      follow_up_days: followUp ? followUpDays : null,
    };

    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/consultations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save consultation");
      await res.json();
      navigate("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save consultation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultation-container">
      <h2>Consultation for {patientInfo.name}</h2>

      <div className="patient-details">
        <p><strong>Age:</strong> {patientInfo.age || "N/A"}</p>
        <p><strong>Token:</strong> {patientInfo.token || "N/A"}</p>
        <p><strong>Allergies:</strong> {patientInfo.allergies.join(", ") || "None"}</p>
        <p><strong>Chronic Conditions:</strong> {patientInfo.conditions.join(", ") || "None"}</p>
      </div>

      <div className="consultation-section">
        <label>Symptoms:</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={3}
          placeholder="Enter symptoms here..."
        />
      </div>

      <div className="consultation-section">
        <label>Diagnosis / Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Enter diagnosis / notes..."
        />
      </div>

      <div className="consultation-section">
        <label>Medicines:</label>
        {medicines.map((med, index) => (
          <div key={index} className="medicine-row">
            <Select
              options={medicineMaster.map(m => ({ value: m.name, label: m.name }))}
              value={med.name ? { value: med.name, label: med.name } : null}
              onChange={(selected) =>
                handleMedicineChange(index, "name", selected ? selected.value : "")
              }
              onCreateOption={(inputValue) =>
                handleMedicineChange(index, "name", inputValue)
              }
              isClearable
              isSearchable
              placeholder="Select or type medicine"
            />

            <input
              type="text"
              placeholder="Dosage"
              value={med.dosage}
              onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
            />
            <input
              type="text"
              placeholder="Frequency"
              value={med.frequency}
              onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
            />
            <input
              type="text"
              placeholder="Duration"
              value={med.duration}
              onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
            />
            <button type="button" onClick={() => removeMedicineRow(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addMedicineRow}>Add Medicine</button>
      </div>

      <div className="consultation-section">
        <label>
          <input
            type="checkbox"
            checked={followUp}
            onChange={(e) => setFollowUp(e.target.checked)}
          /> Follow-up Required
        </label>
        {followUp && (
          <input
            type="number"
            placeholder="Follow-up in X days"
            value={followUpDays}
            onChange={(e) => setFollowUpDays(e.target.value)}
          />
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <button className="save-btn" onClick={handleSaveConsultation} disabled={loading}>
        {loading ? "Saving..." : "Save Consultation"}
      </button>
    </div>
  );
}

export default ConsultationCreate;
