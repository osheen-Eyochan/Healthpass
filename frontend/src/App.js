import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ================= Patient Components =================
import PatientLogin from "./components/PatientLogin";
import PatientRegister from "./components/PatientRegister";
import PatientDashboard from "./components/PatientDashboard";
import AppointmentsList from "./components/AppointmentsList";

// ================= Receptionist Components =================
import ReceptionistLogin from "./components/ReceptionistLogin";
import ReceptionistDashboard from "./components/Dashboard"; 
import AppointmentDetails from "./components/AppointmentDetails";

// ================= Doctor Components =================
import DoctorLogin from "./doctor/DoctorLogin";
import DoctorDashboard from "./doctor/DoctorDashboard";
import ConsultationList from "./doctor/ConsultationList";
import ConsultationCreate from "./doctor/ConsultationCreate";

// ================= General =================
import HomePage from "./components/HomePage";

// ================= Protected Route Wrapper =================
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken"); 
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* ========== Patient Routes ========== */}
        <Route path="/login" element={<PatientLogin />} />
        <Route path="/register" element={<PatientRegister />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <AppointmentsList />
            </PrivateRoute>
          }
        />

        {/* ========== Receptionist Routes ========== */}
        <Route path="/receptionist/login" element={<ReceptionistLogin />} />
        <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
        <Route path="/receptionist/appointment/:id" element={<AppointmentDetails />} />

        {/* ========== Doctor Routes ========== */}
        <Route
          path="/doctor/login"
          element={<DoctorLogin onLoginSuccess={(doctor) => console.log("Logged in:", doctor)} />}
        />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/consultations" element={<ConsultationList />} />
        <Route path="/doctor/consultations/new" element={<ConsultationCreate />} />
        <Route
          path="/doctor/consultations/create/:patientId/:patientName"
          element={<ConsultationCreate />}
        />

        {/* Redirect unknown routes to homepage */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
