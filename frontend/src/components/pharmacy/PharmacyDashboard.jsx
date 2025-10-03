import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";
import "./PharmacyDashboard.css";

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleScanClick = () => {
    setShowScanner(true); // Show scanner box
  };

  const handleCloseScanner = () => {
    setShowScanner(false); // Close scanner box
    setErrorMsg("");
  };

  const handleScan = (data) => {
    if (data) {
      const tokenId = data.text;
      navigate(`/pharmacy/prescription/${tokenId}`);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setErrorMsg("Error accessing camera. Please allow camera permissions.");
  };

  return (
    <div className="pharmacy-dashboard-container">
      <h2>Welcome to Pharmacy Dashboard</h2>

      <button
        onClick={handleScanClick}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#1e40af",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Scan QR Code
      </button>

      {showScanner && (
        <div className="scanner-modal">
          <div className="scanner-box">
            <button className="close-btn" onClick={handleCloseScanner}>
              &times;
            </button>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}
            <QrScanner
              delay={500}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
