import React, { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import axios from "axios";

const PharmacyScanner = () => {
  const [qrData, setQrData] = useState("");           // scanned QR string
  const [patientInfo, setPatientInfo] = useState(null); 
  const [error, setError] = useState("");
  const [noScanMessage, setNoScanMessage] = useState("");
  const [scanning, setScanning] = useState(false);

  // Handle QR scan result
  const handleScan = async (data) => {
    if (!data) return;

    setQrData(data);
    setError("");
    setNoScanMessage(""); 
    setScanning(false);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/pharmacy/verify-qr/",
        { qr_data: data }
      );

      const info = response.data.data ?? response.data;
      setPatientInfo({
        token_id: info.token_id ?? "",
        name: info.name ?? "",
      });
    } catch (err) {
      console.error("Axios error:", err);
      const info = err.response?.data?.data ?? err.response?.data ?? null;

      if (info) {
        setPatientInfo({
          token_id: info.token_id ?? "",
          name: info.name ?? "",
        });
        setError("");
      } else {
        setPatientInfo(null);
        setError("Failed to fetch data from backend");
      }
    }
  };

  // QR scanner warnings (silent)
  const handleError = (err) => {
    console.warn("QR Scanner warning:", err);
  };

  // Start scanning
  const handleStartScan = () => {
    setQrData("");
    setPatientInfo(null);
    setError("");
    setNoScanMessage("");
    setScanning(true);
  };

  // Auto-stop scanning after 10 seconds
  useEffect(() => {
    let timer;
    if (scanning) {
      timer = setTimeout(() => {
        setScanning(false);
        if (!qrData) {
          setNoScanMessage("No QR code detected. Please try again.");
        }
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [scanning, qrData]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Pharmacy QR Scanner</h2>

      {scanning ? (
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "20px auto",
            overflow: "hidden",
            borderRadius: "5px",
            border: "1px solid #1e40af",
          }}
        >
          <QrReader
            onResult={(result, error) => {
              if (result) handleScan(result?.text);
              if (error) handleError(error);
            }}
            constraints={{ facingMode: { ideal: "environment" } }}
            style={{
              width: "100%",
              height: "100%",
              transform: "scale(0.5)",
              transformOrigin: "top left",
            }}
          />
        </div>
      ) : (
        <button
          onClick={handleStartScan}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1e40af",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          {qrData ? "Scan Again" : "Start Scan"}
        </button>
      )}

      {qrData && (
        <p style={{ marginTop: "20px" }}>
          <strong>Scanned QR Data:</strong> {qrData}
        </p>
      )}

      {noScanMessage && <p style={{ color: "orange" }}>{noScanMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {patientInfo && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f0f0f0",
            borderRadius: "5px",
          }}
        >
          <h3>Patient Info:</h3>
          {patientInfo.token_id && <p><strong>Token ID:</strong> {patientInfo.token_id}</p>}
          {patientInfo.name && <p><strong>Name:</strong> {patientInfo.name}</p>}
        </div>
      )}
    </div>
  );
};

export default PharmacyScanner;
