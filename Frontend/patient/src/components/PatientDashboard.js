import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import "./PatientDashboard.css";

// -------------------------
// Time Slots (08:00 - 19:30)
const allTimeSlots = [];
for (let h = 8; h < 20; h++) {
  allTimeSlots.push(`${h.toString().padStart(2, "0")}:00`);
  allTimeSlots.push(`${h.toString().padStart(2, "0")}:30`);
}

// -------------------------
// Razorpay & Fetch Helpers
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const safeFetchJSON = async (url, options) => {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) return await res.json();
  const text = await res.text();
  console.error("Expected JSON, got:", text);
  throw new Error("Server returned non-JSON response");
};

// -------------------------
// Main Component
export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ doctor_id: "", appointment_date: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPastAppointments, setShowPastAppointments] = useState(false);

  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  const selectedAmount = 100; // ₹100 fixed

  // Redirect if not authenticated
  useEffect(() => {
    if (!token || !username) window.location.href = "/";
  }, [token, username]);

  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const data = await safeFetchJSON("http://127.0.0.1:8000/api/patient/doctors/", {
        headers: { Authorization: `Token ${token}` },
      });
      setDoctors(data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to load doctors");
    }
  }, [token]);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const data = await safeFetchJSON("http://127.0.0.1:8000/api/patient/appointments/", {
        headers: { Authorization: `Token ${token}` },
      });
      setAppointments(data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to load appointments");
    }
  }, [token]);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, [fetchDoctors, fetchAppointments]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Booked tokens for selected doctor/date
  const bookedTokensForSelectedDoctorDate =
    formData.doctor_id && formData.appointment_date
      ? appointments
          .filter(
            (appt) =>
              appt.doctor?.id === parseInt(formData.doctor_id) &&
              appt.appointment_date === formData.appointment_date
          )
          .map((appt) => appt.token_number)
      : [];

  // Auto-assigned token (next available)
  const autoTokenNumber = (() => {
    if (!formData.doctor_id || !formData.appointment_date) return null;
    let token = 1;
    while (bookedTokensForSelectedDoctorDate.includes(token)) token++;
    if (token > allTimeSlots.length) return null;
    return token;
  })();

  // -------------------------
  // Book Appointment Handler
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!formData.doctor_id || !formData.appointment_date) {
      setMessage("❌ Please select doctor and date");
      setLoading(false);
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Razorpay SDK failed to load");

      const orderData = await safeFetchJSON(
        "http://127.0.0.1:8000/api/patient/create-razorpay-order/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
          body: JSON.stringify({ amount: selectedAmount * 100 }),
        }
      );

      const options = {
        key: "rzp_test_RAG8gAodjvayL3",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HealthPass",
        description: `Appointment Payment ₹${selectedAmount}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const booked = await safeFetchJSON(
              "http://127.0.0.1:8000/api/patient/book-appointment/",
              {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                body: JSON.stringify({
                  doctor_id: formData.doctor_id,
                  appointment_date: formData.appointment_date,
                  payment_id: response.razorpay_payment_id,
                }),
              }
            );

            setMessage(`✅ Appointment booked! Token: ${booked.token_number}`);
            fetchAppointments();
          } catch (err) {
            console.error(err);
            setMessage(`❌ Booking failed: ${err.message}`);
          }
        },
        prefill: { name: username, email: "patient@example.com", contact: "9999999999" },
        theme: { color: "#4CAF50" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => setMessage(`❌ Payment failed: ${res.error.description}`));
      rzp.open();
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  // -------------------------
  // Download QR PDF
  const downloadQR = (id, appt) => {
    const canvas = document.getElementById(`qr-${id}`);
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 60, 20, 80, 80);
    pdf.text("HealthPass Appointment Ticket", 105, 110, { align: "center" });
    pdf.text(`Appointment ID: ${appt.id}`, 20, 120);
    pdf.text(`Token: ${appt.token_number}`, 20, 130);
    pdf.text(`Patient: ${username}`, 20, 140);
    pdf.text(`Doctor: ${appt.doctor_name || "N/A"}`, 20, 150);
    pdf.text(`Specialization: ${appt.doctor_specialization || "N/A"}`, 20, 160);
    pdf.text(`Date: ${appt.appointment_date}`, 20, 170);
    pdf.text(`Time: ${appt.appointment_time}`, 20, 180);
    pdf.save(`HealthPass_Appointment_${appt.id}.pdf`);
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="patient-dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {username}!</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-content">
        {/* Appointment Booking */}
        <section className="appointment-booking-card">
          <h2>Book a New Appointment</h2>
          {message && <p className={`message ${message.startsWith("✅") ? "success" : "error"}`}>{message}</p>}

          <form onSubmit={handleBookAppointment} className="appointment-form">
            <div className="form-group">
              <label htmlFor="doctor_id">Select Doctor:</label>
              <select id="doctor_id" name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
                <option value="">-- Choose a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appointment_date">Appointment Date:</label>
              <input
                type="date"
                id="appointment_date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                min={minDate}
                required
              />
            </div>

            {/* Tokens Display */}
            {formData.doctor_id && formData.appointment_date ? (
              <div className="token-display-section">
                <h3>
                  Tokens for Dr. {doctors.find(d => d.id === parseInt(formData.doctor_id))?.name} on {formData.appointment_date}
                </h3>
                <div className="token-legend">
                  <span><div className="legend-box legend-available"></div> Available</span>
                  <span><div className="legend-box legend-booked"></div> Booked</span>
                  <span><div className="legend-box legend-selected"></div> Auto-Assigned</span>
                </div>

                <div className="token-grid">
                  {allTimeSlots.map((time, index) => {
                    const tokenNum = index + 1;
                    const isBooked = bookedTokensForSelectedDoctorDate.includes(tokenNum);
                    const isAuto = tokenNum === autoTokenNumber;
                    const boxClass = isBooked ? "booked" : isAuto ? "selected" : "available";
                    return (
                      <div key={index} className={`token-box ${boxClass}`}>
                        <span className="token-number">{tokenNum}</span>
                        
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p>Please select doctor and date to see available tokens</p>
            )}

            <p className="payment-info">Amount to Pay: <strong>₹{selectedAmount}</strong></p>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Book Appointment & Pay"}
            </button>
          </form>
        </section>

        {/* Appointments List */}
        <section className="your-appointments-section">
          <div className="appointments-header">
            <h2>{showPastAppointments ? "Past Appointments" : "Upcoming Appointments"}</h2>
            <button onClick={() => setShowPastAppointments(!showPastAppointments)} className="btn-toggle-appointments">
              {showPastAppointments ? "Show Upcoming" : "Show Past"}
            </button>
          </div>

          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <div className="appointment-list">
              {appointments.map(appt => (
                <div key={appt.id} className="appointment-card">
                  <div className="appointment-details">
                    <h3>Dr. {appt.doctor_name}</h3>
                    <p><strong>Specialization:</strong> {appt.doctor_specialization || "N/A"}</p>
                    <p><strong>Date:</strong> {appt.appointment_date}</p>
                    <p><strong>Time:</strong> {appt.appointment_time}</p>
                    <p><strong>Token:</strong> {appt.token_number}</p>
                    <p><strong>Patient:</strong> {username}</p>
                    <p className={`status-${appt.status?.toLowerCase() || "pending"}`}><strong>Status:</strong> {appt.status || "Pending"}</p>
                  </div>
                  <div className="appointment-actions">
                    <QRCodeCanvas
                      id={`qr-${appt.id}`}
                      value={JSON.stringify({
                        appointment_id: appt.id,
                        patient: username,
                        doctor: appt.doctor?.name,
                        specialization: appt.doctor?.specialization,
                        date: appt.appointment_date,
                        time: appt.appointment_time,
                        token: appt.token_number,
                      })}
                      size={128}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                    <button onClick={() => downloadQR(appt.id, appt)} className="btn-secondary">
                      Download Ticket (PDF)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
