import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import "./PatientDashboard.css";

// -------------------------
// Time Slot Helpers
// -------------------------
const generateAllPossibleTimeSlots = () => {
  const slots = [];
  for (let h = 8; h < 20; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots.slice(0, 26);
};

const allTimeSlots = generateAllPossibleTimeSlots();

// -------------------------
// Razorpay & Fetch Helpers
// -------------------------
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
  if (contentType && contentType.includes("application/json"))
    return await res.json();
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
    token_number: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPastAppointments, setShowPastAppointments] = useState(false);

  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  const [selectedAmount] = useState(100); // Fixed ₹100

  // Redirect if not authenticated
  useEffect(() => {
    if (!token || !username) window.location.href = "/";
  }, [token, username]);

  // -------------------------
  // Fetch Doctors & Appointments
  // -------------------------
  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    try {
      const data = await safeFetchJSON(
        "http://127.0.0.1:8000/api/patient/doctors/",
        { headers: { Authorization: `Token ${token}` } }
      );
      setDoctors(data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setMessage("❌ Failed to load doctor list.");
    }
  }, [token]);

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const data = await safeFetchJSON(
        "http://127.0.0.1:8000/api/patient/appointments/",
        { headers: { Authorization: `Token ${token}` } }
      );
      console.log("Fetched appointments:", data);
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

  // -------------------------
  // Handle Form Changes
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "doctor_id" || name === "appointment_date"
        ? { appointment_time: "", token_number: "" }
        : {}),
    }));
  };

  // -------------------------
  // Get booked tokens for a doctor on a date
  // -------------------------
  const getBookedTokensForDate = useCallback(
    (date, doctorId) => {
      if (!date || !doctorId) return [];
      
      console.log('Filtering appointments for date:', date, 'doctor:', doctorId);
      console.log('All appointments:', appointments);
      
      const bookedTokens = appointments
        .filter((appt) => {
          const matchesDate = appt.appointment_date === date;
          const matchesDoctor = String(appt.doctor_id) === String(doctorId);
          console.log(`Appointment ${appt.id}: date match=${matchesDate}, doctor match=${matchesDoctor}, token=${appt.token_number}`);
          return matchesDate && matchesDoctor;
        })
        .map((appt) => {
          const tokenNum = parseInt(appt.token_number, 10);
          console.log(`Mapped token: ${appt.token_number} -> ${tokenNum}`);
          return tokenNum;
        })
        .filter((n) => !isNaN(n));
        
      console.log('Final booked tokens:', bookedTokens);
      return bookedTokens;
    },
    [appointments]
  );

  // -------------------------
  // Book Appointment & Payment
  // -------------------------
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!formData.doctor_id || !formData.appointment_date || !formData.token_number) {
      setMessage("❌ Please fill in all appointment details.");
      setLoading(false);
      return;
    }

    // Check if token already booked
    if (
      getBookedTokensForDate(formData.appointment_date, formData.doctor_id).includes(
        parseInt(formData.token_number, 10)
      )
    ) {
      setMessage("❌ This token is already booked. Please choose another.");
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

      const options = {
        key: "rzp_test_RAG8gAodjvayL3",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HealthPass",
        description: `Appointment Payment ₹${selectedAmount}`,
        order_id: orderData.id,
        handler: async (response) => {
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
                  token_number: formData.token_number,
                  payment_id: response.razorpay_payment_id,
                }),
              }
            );

            if (!appointmentData.id)
              throw new Error("Appointment booking failed.");

            setMessage(
              `✅ Appointment booked & paid! Payment ID: ${response.razorpay_payment_id}`
            );
            await fetchAppointments();
            setFormData({
              doctor_id: "",
              appointment_date: "",
              appointment_time: "",
              token_number: "",
            });
          } catch (err) {
            console.error("Booking Error:", err);
            setMessage(`❌ ${err.message}`);
          }
        },
        prefill: {
          name: username,
          email: "patient@example.com",
          contact: "9999999999",
        },
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
    pdf.text("HealthPass Appointment Ticket", pageWidth / 2, margin + qrSize + 20, {
      align: "center",
    });

    pdf.setFontSize(14);
    const startY = margin + qrSize + 40;
    const lineSpacing = 10;
    pdf.text(`Appointment ID: ${appt.id}`, margin, startY);
    pdf.text(`Appointment No. (Token): ${appt.token_number}`, margin, startY + lineSpacing);
    pdf.text(`Patient: ${username}`, margin, startY + 2 * lineSpacing);
    pdf.text(`Doctor: ${appt.doctor_name || appt.doctor?.name || "N/A"}`, margin, startY + 3 * lineSpacing);
    pdf.text(
      `Specialization: ${appt.doctor_specialization || appt.doctor?.specialization || "N/A"}`,
      margin,
      startY + 4 * lineSpacing
    );
    pdf.text(`Date: ${appt.appointment_date}`, margin, startY + 5 * lineSpacing);
    pdf.text(`Time: ${appt.appointment_time}`, margin, startY + 6 * lineSpacing);

    pdf.setFontSize(10);
    pdf.text("Thank you for choosing HealthPass!", pageWidth / 2, startY + 8 * lineSpacing, {
      align: "center",
    });

    pdf.save(`HealthPass_Appointment_${appt.id}.pdf`);
  };

  // -------------------------
  // Date limits & filtering
  // -------------------------
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const filteredAppointments = appointments
    .filter((appt) => {
      const apptDate = new Date(appt.appointment_date);
      apptDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return showPastAppointments ? apptDate < today : apptDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.appointment_date + "T" + a.appointment_time);
      const dateB = new Date(b.appointment_date + "T" + b.appointment_time);
      return showPastAppointments ? dateB - dateA : dateA - dateB;
    });

  const bookedTokensForSelectedDoctorDate = getBookedTokensForDate(
    formData.appointment_date,
    formData.doctor_id
  );

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div className="patient-dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {username}!</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
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
              <select
                id="doctor_id"
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
              >
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

            {/* Token Display Section */}
            {formData.doctor_id && formData.appointment_date ? (
              <div className="token-display-section">
                <h3>
                  Available Tokens for Dr.{" "}
                  {doctors.find((d) => String(d.id) === String(formData.doctor_id))?.name} on{" "}
                  {formData.appointment_date}
                </h3>

                {/* Color Legend */}
                <div className="token-legend">
                  <span>
                    <div className="legend-box legend-available"></div>
                    Available
                  </span>
                  <span>
                    <div className="legend-box legend-booked"></div>
                    Booked
                  </span>
                  <span>
                    <div className="legend-box legend-selected"></div>
                    Selected
                  </span>
                </div>

                {/* Token Grid */}
                <div className="token-grid">
                  {allTimeSlots.map((timeSlot, index) => {
                    const tokenNum = index + 1;

                    // Debug: Log the booked tokens and current token for troubleshooting
                    console.log('Booked tokens:', bookedTokensForSelectedDoctorDate);
                    console.log('Current token:', tokenNum);

                    // Ensure proper comparison by converting both to numbers
                    const bookedTokensAsNumbers = bookedTokensForSelectedDoctorDate.map(token => Number(token));
                    const isBooked = bookedTokensAsNumbers.includes(Number(tokenNum));
                    const isSelected = Number(formData.token_number) === Number(tokenNum);

                    console.log(`Token ${tokenNum}: isBooked=${isBooked}, isSelected=${isSelected}`);

                    const boxClass = isBooked
                      ? "booked"
                      : isSelected
                      ? "selected"
                      : "available";

                    return (
                      <div
                        key={index}
                        className={`token-box ${boxClass}`}
                        onClick={() => {
                          if (!isBooked) {
                            setFormData(prev => ({
                              ...prev,
                              token_number: String(tokenNum), // Ensure consistent string format
                              appointment_time: timeSlot,
                            }));
                          }
                        }}
                        title={
                          isBooked
                            ? `Token ${tokenNum}: ${timeSlot} (Booked)`
                            : `Token ${tokenNum}: ${timeSlot} (Available)`
                        }
                      >
                        <span className="token-number">{tokenNum}</span>
                        <span className="token-time">{timeSlot}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="select-doctor-date-message">
                Please select a doctor and date to see available tokens.
              </p>
            )}

            <p className="payment-info">
              Amount to Pay: <strong>₹{selectedAmount}</strong>
            </p>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Book Appointment & Pay"}
            </button>
          </form>
        </section>

        {/* Appointments List */}
        <section className="your-appointments-section">
          <div className="appointments-header">
            <h2>
              {showPastAppointments ? "Your Past Appointments" : "Your Upcoming Appointments"}
            </h2>
            <button
              onClick={() => setShowPastAppointments(!showPastAppointments)}
              className="btn-toggle-appointments"
            >
              {showPastAppointments ? "Show Upcoming" : "Show Past"}
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <p className="no-appointments">
              {showPastAppointments
                ? "No past appointments found."
                : "No upcoming appointments booked yet. Book one above!"}
            </p>
          ) : (
            <div className="appointment-list">
              {filteredAppointments.map((appt) => (
                <div key={appt.id} className="appointment-card">
                  <div className="appointment-details">
                    <h3>Dr. {appt.doctor_name || appt.doctor?.name || "N/A"}</h3>
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {appt.doctor_specialization || appt.doctor?.specialization || "N/A"}
                    </p>
                    <p>
                      <strong>Date:</strong> {appt.appointment_date}
                    </p>
                    <p>
                      <strong>Time:</strong> {appt.appointment_time}
                    </p>
                    <p>
                      <strong>Token:</strong> {appt.token_number}
                    </p>
                    <p>
                      <strong>Patient:</strong> {username}
                    </p>
                    <p className={`status-${appt.status?.toLowerCase() || "pending"}`}>
                      <strong>Status:</strong> {appt.status || "Pending"}
                    </p>
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
                        token: appt.token_number,
                      })}
                      size={128}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      className="qr-code-display"
                    />
                    <button
                      onClick={() => downloadQR(appt.id, appt)}
                      className="btn-secondary"
                    >
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