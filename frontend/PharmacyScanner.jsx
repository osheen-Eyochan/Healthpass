// src/pages/PharmacyScanner.jsx
import React, { useState } from "react";
import { QrReader } from "react-qr-reader"; // named import
import axios from "axios";

const PharmacyScanner = () => {
  const [qrData, setQrData] = useState(""); 
  const [patientInfo, setPatientInfo] = useState(null);
  const [message, setMessage] = useState("");

  // When QR code is scanned
  const handleScan = async (data) => {
    if (data) {
      setQrData(data);
      setMessage("Verifying QR code...");
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/pharmacy/verify/", // full backend URL
          { qr_code: data }
        );

        if (response.data.success) {
          setPatientInfo(response.data.patient);
          setMessage("QR code verified successfully!");
        } else {
          setPatientInfo(null);
          setMessage(response.data.message || "Invalid QR code.");
        }
      } catch (error) {
        console.error(error);
        setMessage("Error connecting to backend.");
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setMessage("QR Scanner error.");
  };

  // Mark token as completed
  const handleCompleteToken = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/pharmacy/update-token/", // full backend URL
        { qr_code: qrData }
      );

      if (response.data.success) {
        setMessage("Token marked as completed!");
        setPatientInfo(null);
        setQrData("");
      } else {
        setMessage(response.data.message || "Failed to update token.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error connecting to backend.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Pharmacy QR Scanner</h2>
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <QrReader
          onResult={(result, error) => {
            if (!!result) handleScan(result?.text);
            if (!!error) handleError(error);
          }}
          constraints={{ facingMode: "user" }} // use "user" for laptop/front camera
          style={{ width: "100%" }}
        />
      </div>

      <p>{message}</p>

      {patientInfo && (
        <div style={{ marginTop: "20px" }}>
          <h3>Patient Info:</h3>
          <p><strong>Name:</strong> {patientInfo.name}</p>
          <p><strong>Token:</strong> {patientInfo.token}</p>
          <p><strong>Medicine:</strong> {patientInfo.medicine}</p>
          <button onClick={handleCompleteToken}>Mark as Completed</button>
        </div>
      )}
    </div>
  );
};

export default PharmacyScanner;
