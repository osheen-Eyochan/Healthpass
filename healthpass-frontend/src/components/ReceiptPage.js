import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenId, name, doctor, medicines, total } = location.state || {};

  if (!medicines || medicines.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>No medicines selected!</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Receipt</h2>
      <p><strong>Token ID:</strong> {tokenId}</p>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Doctor:</strong> {doctor}</p>

      <h3>Medicines</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rate</th>
            <th>Days</th>
            <th>Frequency</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med, i) => (
            <tr key={i}>
              <td>{med.name}</td>
              <td>₹{med.rate}</td>
              <td>{med.days}</td>
              <td>{med.frequency || "-"}</td>
              <td>₹{(med.rate * med.days).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "20px" }}>Grand Total: ₹{total.toFixed(2)}</h3>
      <button style={{ marginTop: "10px" }} onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default ReceiptPage;
