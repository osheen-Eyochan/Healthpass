import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PrescriptionPage = () => {
  const { tokenId } = useParams(); // from /prescription/:tokenId
  const [prescription, setPrescription] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Fetch prescription details
    axios
      .get(`http://127.0.0.1:8000/api/pharmacy/prescription/${tokenId}/`)
      .then((res) => {
        setPrescription(res.data);
        calculateTotal(res.data.medicines);
      })
      .catch((err) => console.error(err));
  }, [tokenId]);

  const calculateTotal = (medicines) => {
    const sum = medicines.reduce(
      (acc, m) => acc + m.price * m.quantity,
      0
    );
    setTotal(sum);
  };

  const handleQuantityChange = (id, value) => {
    const updated = prescription.medicines.map((m) =>
      m.id === id ? { ...m, quantity: Number(value) } : m
    );
    setPrescription({ ...prescription, medicines: updated });
    calculateTotal(updated);
  };

  if (!prescription) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Prescription Details</h2>
      <p><b>Patient:</b> {prescription.patient_name}</p>
      <p><b>Doctor:</b> {prescription.doctor_name}</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Medicine</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantity</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {prescription.medicines.map((m) => (
            <tr key={m.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{m.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>₹{m.price}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <input
                  type="number"
                  min="1"
                  value={m.quantity}
                  onChange={(e) => handleQuantityChange(m.id, e.target.value)}
                  style={{ width: "60px", textAlign: "center" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                ₹{m.price * m.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "20px" }}>Total: ₹{total}</h3>

      <button
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          backgroundColor: "#1e40af",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Confirm & Proceed
      </button>
    </div>
  );
};

export default PrescriptionPage;
