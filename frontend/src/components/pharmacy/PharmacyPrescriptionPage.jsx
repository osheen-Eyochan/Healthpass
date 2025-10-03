import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./PharmacyPrescriptionPage.css";

const PharmacyPrescriptionPage = () => {
  const { consultationId } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  const token = localStorage.getItem("pharmacyToken");

  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/pharmacy/prescription/${consultationId}/`
        );

        if (!res.data.success) {
          setError(res.data.message || "No prescription found");
          return;
        }

        setConsultation(res.data.consultation);
        setPrescriptions(res.data.prescriptions);

        // Calculate total amount
        const total = res.data.prescriptions.reduce(
          (sum, p) => sum + parseFloat(p.price || 0) * (p.duration || 1),
          0
        );
        setTotalAmount(total);

      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        setError("Failed to fetch prescription details");
      }
    };

    fetchPrescription();
  }, [consultationId]);

  if (error) return <p className="error">{error}</p>;
  if (!consultation) return <p>Loading...</p>;

  return (
    <div className="prescription-container">
      <h2>Prescription for {consultation.patient_name}</h2>

      <div className="patient-info-box">
        <p><strong>Doctor ID:</strong> {consultation.doctor_id}</p>
        <p><strong>Notes:</strong> {consultation.notes || "No notes"}</p>
        <p><strong>Date:</strong> {new Date(consultation.created_at).toLocaleString()}</p>
      </div>

      <table className="prescription-table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration (days)</th>
            <th>Price/unit</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((p) => {
            const amount = parseFloat(p.price || 0) * (p.duration || 1);
            return (
              <tr key={p.id}>
                <td>{p.custom_medicine || p.medicine_name}</td>
                <td>{p.dosage}</td>
                <td>{p.frequency}</td>
                <td>{p.duration}</td>
                <td>₹{parseFloat(p.price).toFixed(2)}</td>
                <td>₹{amount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" style={{ textAlign: "right", fontWeight: "bold" }}>Total Amount:</td>
            <td style={{ fontWeight: "bold" }}>₹{totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PharmacyPrescriptionPage;
