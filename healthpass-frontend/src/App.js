import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Receptionist components
import ReceptionistLogin from "./components/ReceptionistLogin";
import Dashboard from "./components/Dashboard";
import AppointmentDetails from "./components/AppointmentDetails";

// Doctor components
import DoctorLogin from "./doctor/DoctorLogin";
import DoctorDashboard from "./doctor/DoctorDashboard";
import ConsultationList from "./doctor/ConsultationList";
import ConsultationCreate from "./doctor/ConsultationCreate";

// General
import Home from "./Home"; // ✅ new home page with navbar

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page with navbar */}
        <Route path="/" element={<Home />} />

        {/* Doctor routes */}
        <Route
          path="/doctor/login"
          element={<DoctorLogin onLoginSuccess={(doctor) => console.log("Logged in:", doctor)} />}
        />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/consultations" element={<ConsultationList />} />
        
        {/* Consultation create routes */}
        <Route path="/doctor/consultations/new" element={<ConsultationCreate />} /> 
        <Route
          path="/doctor/consultations/create/:patientId/:patientName"
          element={<ConsultationCreate />}
        />

        {/* Receptionist routes */}
        <Route path="/receptionist/login" element={<ReceptionistLogin />} />
        <Route path="/receptionist/dashboard" element={<Dashboard />} />
        <Route path="/receptionist/appointment/:id" element={<AppointmentDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
