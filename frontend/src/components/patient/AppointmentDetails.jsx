import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import "./AppointmentDetails.css";

const AppointmentDetails = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [scanError, setScanError] = useState("");
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);

  const fetchAppointment = async (id) => {
    if (!id) return;
    setLoading(true);
    setScanError("");

    try {
      const res = await axios.get(
        `http://localhost:8000/api/receptionist/appointment/${id}/`
      );
      if (res.data.success) {
        setAppointment(res.data.appointment);
      } else {
        setAppointment(null);
        setScanError(res.data.message || "Appointment not found");
      }
    } catch (err) {
      setAppointment(null);
      setScanError("Error fetching appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!appointment?.id) return;
    setCheckingIn(true);
    try {
      const res = await axios.post(
        `http://localhost:8000/api/receptionist/appointment/${appointment.id}/checkin/`
      );
      if (res.data.success) {
        setAppointment(res.data.appointment);
        alert("Patient checked in successfully!");
        startScanner(); // restart camera after check-in
      } else {
        alert(res.data.message || "Check-in failed");
      }
    } catch (err) {
      alert("Error during check-in");
    } finally {
      setCheckingIn(false);
    }
  };

  const startScanner = () => {
    // Stop previous scanner if running
    if (html5QrCodeRef.current && isScanningRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          isScanningRef.current = false;
        })
        .catch(() => {
          isScanningRef.current = false;
        });
    }

    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // Stop scanner immediately
          if (isScanningRef.current) {
            await html5QrCode.stop();
            isScanningRef.current = false;
          }

          // Parse scanned ID
          let scannedId = decodedText;
          try {
            const parsed = JSON.parse(decodedText);
            scannedId = parsed.appointment_id || decodedText;
          } catch (e) {}

          // Fetch appointment details
          fetchAppointment(scannedId);
        },
        (errorMessage) => {
          console.warn("QR scan error:", errorMessage);
          setScanError(errorMessage);
        }
      )
      .then(() => {
        isScanningRef.current = true;
      })
      .catch((err) => setScanError("Cannot access camera"));
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        isScanningRef.current = false;
      }
    };
  }, []);

  return (
    <div className="appointment-container">
      <h2 className="center-text">Receptionist: Patient Appointment</h2>
      <div id="qr-reader" className="qr-scanner-container" />
      {scanError && <p className="center-text error-text">{scanError}</p>}
      {loading && <p className="center-text">Loading appointment details...</p>}

      {appointment && (
        <div className="appointment-card">
          <div className="details-grid">
            <span className="label">ID:</span>
            <span className="value">{appointment.id}</span>
            <span className="label">Patient:</span>
            <span className="value">{appointment.patient_name}</span>
            <span className="label">Age:</span>
            <span className="value">{appointment.age}</span>
            <span className="label">Gender:</span>
            <span className="value">{appointment.gender}</span>
            <span className="label">Doctor:</span>
            <span className="value">{appointment.doctor_name}</span>
            <span className="label">Specialization:</span>
            <span className="value">{appointment.specialization}</span>
            <span className="label">Date:</span>
            <span className="value">{appointment.date}</span>
            <span className="label">Time:</span>
            <span className="value">{appointment.time}</span>
            <span className="label">Status:</span>
            <span
              className={
                appointment.status === "checked_in"
                  ? "status-checked-in"
                  : "status-pending"
              }
            >
              {appointment.status}
            </span>
            <span className="label">Payment:</span>
            <span className="value">{appointment.payment_status}</span>
            <span className="label">Checked-In:</span>
            <span className={appointment.checked_in ? "checked-yes" : "checked-no"}>
              {appointment.checked_in ? "Yes" : "No"}
            </span>
          </div>

          {!appointment.checked_in && appointment.status !== "checked_in" && (
            <button
              className="checkin-button"
              onClick={handleCheckIn}
              disabled={checkingIn}
            >
              {checkingIn ? "Checking In..." : "Confirm Check-In"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;