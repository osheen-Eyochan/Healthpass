import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";

// Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Generate valid time slots (every 30 min)
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

const timeSlots = generateTimeSlots();
const morningSlots = timeSlots.filter(time => {
  const [hours] = time.split(":").map(Number);
  return hours >= 8 && hours < 12;
});
const afternoonSlots = timeSlots.filter(time => {
  const [hours] = time.split(":").map(Number);
  return hours >= 15 && hours < 19;
});

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  const [selectedAmount] = useState(100); // Fixed ₹100

  // Fetch doctors dynamically
  const fetchDoctors = useCallback(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/patient/doctors/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then(setDoctors)
      .catch(console.error);
  }, [token]);

  // Fetch appointments dynamically
  const fetchAppointments = useCallback(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/patient/appointments/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then(setAppointments)
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token || !username) window.location.href = "/";
    fetchDoctors();
    fetchAppointments();
  }, [token, username, fetchDoctors, fetchAppointments]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValidTime = (time) => {
    if (!time) return false;
    const [hours] = time.split(":").map(Number);
    return (hours >= 8 && hours < 12) || (hours >= 15 && hours < 19);
  };

  // Get already booked times for the selected date
  const getBookedTimesForDate = (date) => {
    if (!date) return [];
    return appointments
      .filter(appt => appt.appointment_date === date)
      .map(appt => appt.appointment_time);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isValidTime(formData.appointment_time)) {
      setMessage(
        "❌ Please select a valid appointment time (08:00–12:00 or 15:00–19:00)."
      );
      return;
    }

    try {
      const appointmentRes = await fetch(
        "http://127.0.0.1:8000/api/patient/book-appointment/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const appointmentData = await appointmentRes.json();
      if (!appointmentData.id) {
        setMessage("❌ Error booking appointment");
        return;
      }

      setMessage(
        `✅ Appointment booked! Initiating payment ₹${selectedAmount}...`
      );

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load.");
        return;
      }

      const orderRes = await fetch(
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
      const orderData = await orderRes.json();
      if (!orderData.id) {
        setMessage("❌ Payment order creation failed");
        return;
      }

      const options = {
        key: "rzp_test_RAG8gAodjvayL3",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HealthPass",
        description: `Appointment Payment ₹${selectedAmount}`,
        order_id: orderData.id,
        handler: (response) => {
          setMessage(
            `✅ Payment successful! Payment ID: ${response.razorpay_payment_id}`
          );
          fetchAppointments();
        },
        prefill: {
          name: username,
          email: "patient@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setMessage(`❌ Payment failed: ${response.error.description}`);
      });

      rzp.open();
      setFormData({ doctor_id: "", appointment_date: "", appointment_time: "" });
    } catch (err) {
      console.error(err);
      setMessage("❌ Error: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

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
    pdf.setFontSize(18);
    pdf.text("Appointment Ticket", pageWidth / 2, margin + qrSize + 15, {
      align: "center",
    });

    pdf.setFontSize(12);
    const startY = margin + qrSize + 30;
    pdf.text(`Appointment ID: ${appt.id}`, margin, startY);
    pdf.text(`Patient: ${username}`, margin, startY + 8);
    pdf.text(
      `Doctor: ${appt.doctor_name || appt.doctor?.name}`,
      margin,
      startY + 16
    );
    pdf.text(
      `Specialization: ${appt.doctor?.specialization || "N/A"}`,
      margin,
      startY + 24
    );
    pdf.text(`Date: ${appt.appointment_date}`, margin, startY + 32);
    pdf.text(`Time: ${appt.appointment_time}`, margin, startY + 40);

    pdf.setFontSize(10);
    pdf.text("Thank you for using HealthPass!", pageWidth / 2, startY + 60, {
      align: "center",
    });

    pdf.save(`appointment_${appt.id}.pdf`);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h2>Patient Dashboard</h2>
      <button
        onClick={handleLogout}
        style={{ float: "right", marginRight: "20px" }}
      >
        Logout
      </button>

      <h3>Book an Appointment</h3>
      {message && <p>{message}</p>}
      <form
        onSubmit={handleBookAppointment}
        style={{ display: "inline-block", textAlign: "left" }}
      >
        <select
          name="doctor_id"
          value={formData.doctor_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>
        <br /><br />
        <input
          type="date"
          name="appointment_date"
          value={formData.appointment_date}
          onChange={handleChange}
          min={minDate}
          required
        />
        <br /><br />
        <select
          name="appointment_time"
          value={formData.appointment_time}
          onChange={handleChange}
          required
        >
          <option value="">Select Time</option>

          <optgroup label="Morning (08:00–12:00)">
            {morningSlots.map((time) => (
              <option
                key={time}
                value={time}
                disabled={getBookedTimesForDate(formData.appointment_date).includes(time)}
              >
                {time} {getBookedTimesForDate(formData.appointment_date).includes(time) ? "(Booked)" : ""}
              </option>
            ))}
          </optgroup>

          <optgroup label="Afternoon (15:00–19:00)">
            {afternoonSlots.map((time) => (
              <option
                key={time}
                value={time}
                disabled={getBookedTimesForDate(formData.appointment_date).includes(time)}
              >
                {time} {getBookedTimesForDate(formData.appointment_date).includes(time) ? "(Booked)" : ""}
              </option>
            ))}
          </optgroup>
        </select>
        <br /><br />
        <p>Payment Amount: ₹{selectedAmount}</p>
        <button type="submit">Book Appointment & Pay</button>
      </form>

      <hr style={{ margin: "40px 0" }} />

      <h3>Your Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments booked yet.</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li
              key={appt.id}
              style={{ marginBottom: "30px", listStyle: "none" }}
            >
              <div>
                <strong>Dr. {appt.doctor_name || appt.doctor?.name}</strong>{" "}
                <br />
                Specialization: {appt.doctor?.specialization || "N/A"} <br />
                Date: {appt.appointment_date} <br />
                Time: {appt.appointment_time} <br />
                Patient: {username}
              </div>
              <div style={{ marginTop: "10px" }}>
                <QRCodeCanvas
                  id={`qr-${appt.id}`}
                  value={`Appointment ID: ${appt.id}
Patient: ${username}
Doctor: ${appt.doctor_name || appt.doctor?.name}
Specialization: ${appt.doctor?.specialization || "N/A"}
Date: ${appt.appointment_date}
Time: ${appt.appointment_time}`}
                  size={250}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <button
                onClick={() => downloadQR(appt.id, appt)}
                style={{ marginTop: "10px", padding: "5px 10px" }}
              >
                Download QR as PDF
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
