// src/doctor/ConsultationCreate.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "./ConsultationCreate.css";

function ConsultationCreate() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const appointment = state?.appointment;

  // Get patientId from appointment state OR URL query param
  const searchParams = new URLSearchParams(window.location.search);
  const patientId = appointment?.patient_id || searchParams.get("patientId");
  const patientName = appointment?.patient_name || "";

  // State variables
  const [patientInfo, setPatientInfo] = useState({
    id: patientId || "-",
    name: patientName || "Unknown",
    age: "-",
    token: "-",
    history: [],
  });
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    { symptom: "", medicine: "", dosage: "", duration: "" },
  ]);
  const [medicineMaster, setMedicineMaster] = useState([]);
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch patient info and medicine list
  useEffect(() => {
    if (!patientId) {
      console.warn("Patient ID missing, showing placeholder info.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [patientRes, medicineRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/doctor/patient/${patientId}/`),
          axios.get("http://127.0.0.1:8000/api/doctor/medicines/"),
        ]);
        setPatientInfo(patientRes.data || patientInfo);
        setHistory(patientRes.data?.history || []);
        setMedicineMaster(medicineRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        setError("Failed to fetch patient or medicine data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  // Prescription handlers
  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { symptom: "", medicine: "", dosage: "", duration: "" },
    ]);
  };

  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // Save consultation
  const handleSave = async () => {
    if (!patientInfo?.id || patientInfo.id === "-") {
      alert("Cannot save consultation. Patient info missing.");
      return;
    }

    const doctorInfo = JSON.parse(localStorage.getItem("doctorInfo"));
    if (!doctorInfo?.id) {
      alert("Doctor info missing. Please log in again.");
      navigate("/doctor/login");
      return;
    }

    if (followUp && !followUpDate) {
      alert("Please select a follow-up date.");
      return;
    }

    const consultationPayload = {
      patient_id: patientInfo.id,
      doctor: doctorInfo.id,
      patient_name: patientInfo.name,
      token: patientInfo.token || null,
      notes,
      follow_up: followUp,
      follow_up_date: followUp ? followUpDate : null,
    };

    try {
      // Step 1: Create consultation
      const res = await axios.post(
        "http://127.0.0.1:8000/api/doctor/consultations/",
        consultationPayload
      );

      const consultationId = res.data.id;

      // Step 2: Post prescriptions (skip empty)
      for (const pres of prescriptions) {
        if (!pres.medicine || !pres.symptom) continue;
        await axios.post(
          `http://127.0.0.1:8000/api/doctor/consultations/${consultationId}/prescriptions/`,
          {
            ...pres,
            duration: pres.duration || 1, // default duration 1
          }
        );
      }

      // Step 3: Generate QR code
      const qrPayload = `consultation_id:${consultationId}|patient_id:${patientInfo.id}|token:${patientInfo.token || "-"}`;
      setQrData(qrPayload);

      alert("Consultation saved successfully!");
    } catch (err) {
      console.error("Error saving consultation:", err.response?.data || err.message || err);
      alert("Error saving consultation. Check console for details.");
    }
  };

  if (loading) return <p>Loading patient information...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="consultation-container">
      {!patientId ? (
        <p style={{ color: "orange" }}>
          No patient selected. Start consultation from the dashboard.
        </p>
      ) : (
        <>
          {/* Patient Info */}
          <header className="patient-header">
            <h2>Consultation for {patientInfo.name}</h2>
            <p>
              Age: {patientInfo.age} | Token: {patientInfo.token || "No Token"}
            </p>
          </header>

          {/* Patient History */}
          <section className="history">
            <h4>Previous Consultations</h4>
            {history.length > 0 ? (
              <ul>
                {history.map((c) => (
                  <li key={c.id}>
                    <strong>{c.created_at}:</strong> {c.notes || "-"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No previous consultations.</p>
            )}
          </section>

          {/* Symptoms / Notes */}
          <section className="notes-section">
            <h3>Symptoms / Notes</h3>
            <textarea
              placeholder="Enter symptoms / notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>

          {/* Prescriptions */}
          <section className="prescriptions-section">
            <h3>Prescriptions</h3>
            <table>
              <thead>
                <tr>
                  <th>Symptom</th>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Duration (days)</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((pres, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        value={pres.symptom}
                        onChange={(e) =>
                          handlePrescriptionChange(idx, "symptom", e.target.value)
                        }
                        placeholder="Symptom"
                      />
                    </td>
                    <td>
                      <select
                        value={pres.medicine}
                        onChange={(e) =>
                          handlePrescriptionChange(idx, "medicine", e.target.value)
                        }
                      >
                        <option value="">Select Medicine</option>
                        {medicineMaster.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={pres.dosage}
                        onChange={(e) =>
                          handlePrescriptionChange(idx, "dosage", e.target.value)
                        }
                      >
                        <option value="">Select Dosage</option>
                        <option value="1 tablet">1 tablet</option>
                        <option value="2 tablets">2 tablets</option>
                        <option value="5 ml">5 ml</option>
                        <option value="10 ml">10 ml</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={pres.duration}
                        onChange={(e) =>
                          handlePrescriptionChange(idx, "duration", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button type="button" onClick={() => removePrescriptionRow(idx)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addPrescriptionRow}>
              Add Medicine
            </button>
          </section>

          {/* Follow-up */}
          <section className="follow-up-section">
            <label>
              Follow-up required:
              <input
                type="checkbox"
                checked={followUp}
                onChange={(e) => setFollowUp(e.target.checked)}
              />
            </label>
            {followUp && (
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            )}
          </section>

          {/* Save Consultation */}
          <button className="save-btn" onClick={handleSave}>
            Save Consultation
          </button>

          {/* QR Code */}
          {qrData && (
            <section className="qr-code-section">
              <h4>QR Code for Pharmacy</h4>
              <QRCodeCanvas value={qrData} size={200} />
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default ConsultationCreate;
