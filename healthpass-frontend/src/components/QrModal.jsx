import React, { useState, useRef } from "react";
import QrScanner from "./Qrscanner";
import axios from "axios";

const QrModal = ({ isOpen, onClose, onCheckInSuccess }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const scannerRef = useRef(null);

  if (!isOpen) return null;

  // Handle QR scan
  const handleScan = async (appointmentId) => {
    if (!appointmentId) {
      alert("Invalid QR code.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/receptionist/appointment/${appointmentId}/`
      );

      if (res.data.success) {
        setAppointment(res.data.appointment);

        // Stop scanner safely after scan
        setTimeout(() => {
          scannerRef.current?.stopScanner().catch(() => {});
        }, 100);
      } else {
        alert(res.data.message || "Appointment not found");
        setAppointment(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch appointment.");
      setAppointment(null);
    } finally {
      setLoading(false);
    }
    
  };

  // Confirm & Check-In
  const handleConfirm = async () => {
    if (!appointment) return;
    setCheckingIn(true);

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/receptionist/appointment/${appointment.id}/checkin/`
      );

      if (res.data.success) {
        setAppointment({
          ...res.data.appointment,
          checked_in: res.data.appointment.checked_in,
          status: res.data.appointment.status,
        });

        alert("Patient checked in successfully!");
        onCheckInSuccess?.();
      } else {
        alert(res.data.message || "Check-in failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to check in.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Close modal
  const handleClose = async () => {
    await scannerRef.current?.stopScanner().catch(() => {});
    setAppointment(null);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          width: "80%",
          maxWidth: "800px",
          display: "flex",
          gap: "20px",
        }}
      >
        {/* Left: QR Scanner */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            minHeight: "400px", // fixed height
            borderRight: "1px solid #ddd",
            paddingRight: "15px",
            overflow: "hidden",
          }}
        >
          <div style={{ display: appointment ? "none" : "block" }}>
            <h3>Scan QR Code</h3>
            <QrScanner ref={scannerRef} onScan={handleScan} />
          </div>
        </div>

        {/* Right: Appointment Details */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          {loading && <p>Loading...</p>}
          {appointment ? (
            <>
              <h3>Appointment Details</h3>
              <p><b>ID:</b> {appointment.id}</p>
              <p><b>Patient:</b> {appointment.patient_name}</p>
              <p><b>Age:</b> {appointment.age}</p>
              <p><b>Gender:</b> {appointment.gender}</p>
              <p><b>Doctor:</b> {appointment.doctor_name}</p>
              <p><b>Specialization:</b> {appointment.specialization}</p>
              <p><b>Date:</b> {appointment.date}</p>
              <p><b>Time:</b> {appointment.time}</p>
              <p><b>Status:</b> {appointment.status}</p>
              <p><b>Checked-In:</b> {appointment.checked_in ? "Yes" : "No"}</p>

              {!appointment.checked_in && (
                <button
                  onClick={handleConfirm}
                  disabled={checkingIn}
                  style={{
                    marginTop: "15px",
                    padding: "8px 16px",
                    background: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: checkingIn ? "not-allowed" : "pointer",
                  }}
                >
                  {checkingIn ? "Checking In..." : "Confirm Check-In"}
                </button>
              )}

              <button
                onClick={handleClose}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </>
          ) : (
            <p>Scan a QR code to fetch appointment details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrModal;
