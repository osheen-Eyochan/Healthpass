import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";
import "./PharmacyDashboard.css";

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const handleScan = (data) => {
    if (data) {
      const consultationId = data.text; // use this variable
      if (consultationId) {
        navigate(`/pharmacy/prescription/${consultationId}`);
      }
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
    setErrorMsg("Error accessing camera. Please allow camera permissions.");
  };

  return (
    <div className="pharmacy-dashboard-container">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Welcome to Pharmacy Dashboard
      </h2>

      {errorMsg && (
        <p style={{ color: "red", textAlign: "center" }}>{errorMsg}</p>
      )}

      <div
        className="qr-scanner-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <QrScanner
          delay={500}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "300px", height: "300px" }}
        />
      </div>
    </div>
  );
};

export default PharmacyDashboard;
