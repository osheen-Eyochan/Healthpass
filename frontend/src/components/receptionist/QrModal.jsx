// src/receptionist/QrModal.jsx
import React, { useState, useRef } from "react";
import QrScanner from "./QrScanner";
import axios from "axios";
import "./QrModal.css";

const QrModal = ({ isOpen, onClose, onCheckInSuccess }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const scannerRef = useRef(null);

  if (!isOpen) return null;

  // -----------------------------
  // Handle QR scan
  // -----------------------------
  const handleScan = async (appointmentId) => {
    if (!appointmentId) {
      alert("Invalid QR code.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/receptionist/scan/${appointmentId}/`
      );

      console.log("Scanned appointment:", res.data);

      setAppointment(res.data);

      // Stop scanner safely
      try {
        scannerRef.current?.stopScanner?.();
      } catch (err) {
        console.warn("Failed to stop scanner:", err);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to fetch appointment.");
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Confirm & Check-In
  // -----------------------------
  const handleConfirm = async () => {
    if (!appointment) {
      alert("No appointment selected");
      return;
    }

    // Use either `id` or `appointment_id` from serializer
    const appointmentId = appointment.id || appointment.appointment_id;
    if (!appointmentId) {
      alert("Invalid appointment ID");
      return;
    }

    console.log("Attempting check-in for appointment ID:", appointmentId);

    setCheckingIn(true);
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/receptionist/appointment/${appointmentId}/checkin/`
      );

      if (res.data.success) {
        setAppointment(res.data.appointment);
        alert("Patient checked in successfully!");
        onCheckInSuccess?.(res.data.appointment);
      } else {
        alert(res.data.message || "Check-in failed.");
      }
    } catch (err) {
      console.error(err);

      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to check in.";

      alert(errorMsg);
    } finally {
      setCheckingIn(false);
    }
  };


  // -----------------------------
  // Close modal
  // -----------------------------
  const handleClose = () => {
    try {
      scannerRef.current?.stopScanner?.();
    } catch {}
    setAppointment(null);
    onClose();
  };

  // -----------------------------
  // Render modal
  // -----------------------------
  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal-content">
        {/* QR Scanner */}
        <div className="qr-scanner-container">
          {!appointment && (
            <>
              <h3>Scan QR Code</h3>
              <QrScanner ref={scannerRef} onScan={handleScan} />
              <p className="qr-instructions">
                Point your camera at the patient QR code
              </p>
            </>
          )}
        </div>

        {/* Appointment Details */}
        <div className="qr-appointment-details">
          {loading && <p>Loading...</p>}

          {appointment ? (
            <>
              <h3>Appointment Details</h3>
              <p><b>ID:</b> {appointment.id}</p>
              <p><b>Patient:</b> {appointment.patient_name || "N/A"}</p>
              <p><b>Age:</b> {appointment.age || "N/A"}</p>
              <p><b>Gender:</b> {appointment.gender || "N/A"}</p>
              <p><b>Doctor:</b> {appointment.doctor_name || "N/A"}</p>
              <p><b>Specialization:</b> {appointment.specialization || "N/A"}</p>
              <p><b>Date:</b> {appointment.date || "N/A"}</p>
              <p><b>Time:</b> {appointment.time || "N/A"}</p>
              <p><b>Status:</b> {appointment.status || "N/A"}</p>
              <p><b>Checked-In:</b> {appointment.checked_in ? "Yes" : "No"}</p>

              {!appointment.checked_in && (
                <button
                  className="qr-confirm-btn qr-modal-button"
                  onClick={handleConfirm}
                  disabled={checkingIn}
                >
                  {checkingIn ? "Checking In..." : "Confirm Check-In"}
                </button>
              )}

              <button
                className="qr-close-btn qr-modal-button"
                onClick={handleClose}
              >
                Close
              </button>
            </>
          ) : !loading ? (
            <p>Scan a QR code to fetch appointment details.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default QrModal;
