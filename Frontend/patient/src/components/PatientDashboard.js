import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import "./PatientDashboard.css";

// -------------------------
// Time Slot Helpers
// -------------------------
const generateTimeSlots = () => {
  const slots = [];
  const addSlots = (startHour, endHour) => {
    for (let h = startHour; h < endHour; h++) {
      ["00", "30"].forEach((m) =>
        slots.push(`${h.toString().padStart(2, "0")}:${m}`)
      );
    }
  };
  addSlots(8, 12);  // Morning: 08:00-12:00
  addSlots(15, 19); // Afternoon: 15:00-19:00
  return slots;
};

const allTimeSlots = generateTimeSlots();
const morningSlots = allTimeSlots.filter(time => Number(time.split(":")[0]) >= 8 && Number(time.split(":")[0]) < 12);
const afternoonSlots = allTimeSlots.filter(time => Number(time.split(":")[0]) >= 15 && Number(time.split(":")[0]) < 19);

// -------------------------
// Razorpay & Fetch Helpers
// -------------------------
const loadRazorpayScript = () => new Promise((resolve) => {
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
// -------------------------
export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPastAppointments, setShowPastAppointments] = useState(false);

  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  const [selectedAmount] = useState(100); // Fixed ₹100

  // -------------------------
  // Redirect if not authenticated
  // -------------------------
  useEffect(() => {
    if (!token || !username) window.location.href = "/";
  }, [token, username]);

  // -------------------------
  // Fetch Doctors & Appointments
  // -------------------------
  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    try {
      const data = await safeFetchJSON("http://127.0.0.1:8000/api/patient/doctors/", {
        headers: { Authorization: `Token ${token}` },
      });
      setDoctors(data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setMessage("❌ Failed to load doctor list.");
    }
  }, [token]);

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const data = await safeFetchJSON("http://127.0.0.1:8000/api/patient/appointments/", {
        headers: { Authorization: `Token ${token}` },
      });
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setMessage("❌ Failed to load appointments.");
    }
  }, [token]);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, [fetchDoctors, fetchAppointments]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getBookedTimesForDate = useCallback((date) => {
    if (!date) return [];
    return appointments.filter(appt => appt.appointment_date === date).map(appt => appt.appointment_time);
  }, [appointments]);

  // -------------------------
  // Book Appointment & Payment
  // -------------------------
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      setMessage("❌ Please fill in all appointment details.");
      setLoading(false);
      return;
    }

    // Validate time slot
    const [hours] = formData.appointment_time.split(":").map(Number);
    if (!((hours >= 8 && hours < 12) || (hours >= 15 && hours < 19))) {
      setMessage("❌ Please select a valid appointment time (08:00–12:00 or 15:00–19:00).");
      setLoading(false);
      return;
    }

    // Convert time to HH:MM:SS for Django
    const [h, m] = formData.appointment_time.split(":");
    const appointmentTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;

    // Check if slot is already booked
    if (getBookedTimesForDate(formData.appointment_date).includes(formData.appointment_time)) {
      setMessage("❌ This time slot is already booked. Please choose another.");
      setLoading(false);
      return;
    }

    try {
      // Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage("❌ Razorpay SDK failed to load. Please try again.");
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderData = await safeFetchJSON(
        "http://127.0.0.1:8000/api/patient/create-razorpay-order/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ amount: selectedAmount * 100 }),
        }
      );

      if (!orderData.id) throw new Error("Payment order creation failed.");

      // Razorpay Checkout options
      const options = {
        key: "rzp_test_RAG8gAodjvayL3",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HealthPass",
        description: `Appointment Payment ₹${selectedAmount}`,
        order_id: orderData.id,
        handler: async (response) => {
          // After successful payment, book the appointment with payment_id
          try {
            const appointmentData = await safeFetchJSON(
              "http://127.0.0.1:8000/api/patient/book-appointment/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                  doctor_id: formData.doctor_id,
                  appointment_date: formData.appointment_date,
                  appointment_time: appointmentTime, // ✅ corrected
                  payment_id: response.razorpay_payment_id,
                }),
              }
            );

            if (!appointmentData.id) throw new Error("Appointment booking failed.");

            setMessage(`✅ Appointment booked & paid! Payment ID: ${response.razorpay_payment_id}`);
            await fetchAppointments();
            setFormData({ doctor_id: "", appointment_date: "", appointment_time: "" });
          } catch (err) {
            console.error("Booking Error:", err);
            setMessage(`❌ ${err.message}`);
          }
        },
        prefill: { name: username, email: "patient@example.com", contact: "9999999999" },
        theme: { color: "#4CAF50" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setMessage(`❌ Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error("Payment Flow Error:", err);
      setMessage(`❌ ${err.message || "Something went wrong."}`);
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
  // QR Code PDF Download
  // -------------------------
  const downloadQR = (id, appt) => {
    const canvas = document.getElementById(`qr-${id}`);
    if (!canvas) return;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const qrSize = 80;
    const qrX = (pageWidth - qrSize) / 2;

    pdf.addImage(imgData, "PNG", qrX, margin, qrSize, qrSize);
    pdf.setFontSize(22);
    pdf.setTextColor(40, 40, 40);
    pdf.text("HealthPass Appointment Ticket", pageWidth / 2, margin + qrSize + 20, { align: "center" });

    pdf.setFontSize(14);
    pdf.setTextColor(70, 70, 70);
    const startY = margin + qrSize + 40;
    const lineSpacing = 10;
    pdf.text(`Appointment ID: ${appt.id}`, margin, startY);
    pdf.text(`Patient: ${username}`, margin, startY + lineSpacing);
    pdf.text(`Doctor: ${appt.doctor_name || appt.doctor?.name || "N/A"}`, margin, startY + 2 * lineSpacing);
    pdf.text(`Specialization: ${appt.doctor_specialization || appt.doctor?.specialization || "N/A"}`, margin, startY + 3 * lineSpacing);
    pdf.text(`Date: ${appt.appointment_date}`, margin, startY + 4 * lineSpacing);
    pdf.text(`Time: ${appt.appointment_time}`, margin, startY + 5 * lineSpacing);

    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Thank you for choosing HealthPass!", pageWidth / 2, startY + 7 * lineSpacing, { align: "center" });

    pdf.save(`HealthPass_Appointment_${appt.id}.pdf`);
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const filteredAppointments = appointments
    .filter(appt => {
      const apptDate = new Date(appt.appointment_date);
      apptDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return showPastAppointments ? apptDate < today : apptDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
      const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
      return showPastAppointments ? dateB - dateA : dateA - dateB;
    });

  // -------------------------
  // JSX
  // -------------------------
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
          {message && (
            <p className={`message ${message.startsWith("✅") ? "success" : "error"}`}>
              {message}
            </p>
          )}
          <form onSubmit={handleBookAppointment} className="appointment-form">
            <div className="form-group">
              <label htmlFor="doctor_id">Select Doctor:</label>
              <select id="doctor_id" name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
                <option value="">-- Choose a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>Dr. {doc.name} ({doc.specialization})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appointment_date">Appointment Date:</label>
              <input type="date" id="appointment_date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} min={minDate} required />
            </div>

            <div className="form-group">
              <label htmlFor="appointment_time">Appointment Time:</label>
              <select id="appointment_time" name="appointment_time" value={formData.appointment_time} onChange={handleChange} required disabled={!formData.appointment_date}>
                <option value="">-- Select Time --</option>
                {formData.appointment_date && (
                  <>
                    <optgroup label="Morning (08:00–12:00)">
                      {morningSlots.map((time) => {
                        const isBooked = getBookedTimesForDate(formData.appointment_date).includes(time);
                        return <option key={time} value={time} disabled={isBooked}>{time} {isBooked ? "(Booked)" : ""}</option>;
                      })}
                    </optgroup>
                    <optgroup label="Afternoon (15:00–19:00)">
                      {afternoonSlots.map((time) => {
                        const isBooked = getBookedTimesForDate(formData.appointment_date).includes(time);
                        return <option key={time} value={time} disabled={isBooked}>{time} {isBooked ? "(Booked)" : ""}</option>;
                      })}
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            <p className="payment-info">Amount to Pay: <strong>₹{selectedAmount}</strong></p>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Processing..." : "Book Appointment & Pay"}</button>
          </form>
        </section>

        {/* Appointments List */}
        <section className="your-appointments-section">
          <div className="appointments-header">
            <h2>{showPastAppointments ? "Your Past Appointments" : "Your Upcoming Appointments"}</h2>
            <button onClick={() => setShowPastAppointments(!showPastAppointments)} className="btn-toggle-appointments">
              {showPastAppointments ? "Show Upcoming" : "Show Past"}
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <p className="no-appointments">
              {showPastAppointments ? "No past appointments found." : "No upcoming appointments booked yet. Book one above!"}
            </p>
          ) : (
            <div className="appointment-list">
              {filteredAppointments.map((appt) => (
                <div key={appt.id} className="appointment-card">
                  <div className="appointment-details">
                    <h3>{appt.doctor_name || appt.doctor?.name || "N/A"}</h3>
                    
                    <p><strong>Date:</strong> {appt.appointment_date}</p>
                    <p><strong>Time:</strong> {appt.appointment_time}</p>
                    <p><strong>Patient:</strong> {username}</p>
                    <p className={`status-${appt.status?.toLowerCase() || 'pending'}`}><strong>Status:</strong> {appt.status || 'Pending'}</p>
                  </div>
                  <div className="appointment-actions">
                    <QRCodeCanvas
                      id={`qr-${appt.id}`}
                      value={JSON.stringify({
                        appointment_id: appt.id,
                        patient: username,
                        doctor: appt.doctor_name || appt.doctor?.name,
                        specialization: appt.doctor?.specialization,
                        date: appt.appointment_date,
                        time: appt.appointment_time,
                      })}
                      size={128}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      className="qr-code-display"
                    />
                    <button onClick={() => downloadQR(appt.id, appt)} className="btn-secondary">Download Ticket (PDF)</button>
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
