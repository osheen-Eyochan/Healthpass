import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ================= Patient Components =================
import PatientLogin from "./components/patient/PatientLogin";
import PatientRegister from "./components/patient/PatientRegister";
import PatientDashboard from "./components/patient/PatientDashboard";
import AppointmentsList from "./components/patient/AppointmentsList";
import AppointmentDetails from "./components/patient/AppointmentDetails";

// ================= Receptionist Components =================
import ReceptionistLogin from "./components/receptionist/ReceptionistLogin";
import ReceptionistDashboard from "./components/receptionist/Dashboard";

// ================= Doctor Components =================
import DoctorLogin from "./doctor/DoctorLogin";
import DoctorDashboard from "./doctor/DoctorDashboard";
import ConsultationList from "./doctor/ConsultationList";
import ConsultationCreate from "./doctor/ConsultationCreate";

// ================= Pharmacy Components =================
import PharmacyLogin from "./components/pharmacy/PharmacyLogin";
import PharmacyDashboard from "./components/pharmacy/PharmacyDashboard";
import PharmacyQrScanner from "./components/pharmacy/PharmacyQrScanner";
// Corrected import: match the file name
import PharmacyPrescriptionPage from './components/pharmacy/PharmacyPrescriptionPage';



// ================= General Components =================
import HomePage from "./components/homepage/HomePage";

// ================= Protected Route Wrapper =================
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Adjust token key if needed
  return token ? children : <Navigate to="/pharmacy/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ========== Home Page ========== */}
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
        <Route
          path="/appointment/:id"
          element={
            <PrivateRoute>
              <AppointmentDetails />
            </PrivateRoute>
          }
        />

        {/* ========== Receptionist Routes ========== */}
        <Route path="/receptionist/login" element={<ReceptionistLogin />} />
        <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />

        {/* ========== Doctor Routes ========== */}
        <Route
          path="/doctor/login"
          element={<DoctorLogin onLoginSuccess={(doctor) => console.log("Logged in:", doctor)} />}
        />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/consultations" element={<ConsultationList />} />
        <Route path="/doctor/consultation" element={<ConsultationCreate />} />

        {/* ========== Pharmacy Routes ========== */}
        <Route path="/pharmacy/login" element={<PharmacyLogin />} />
        <Route
          path="/pharmacy/dashboard"
          element={
            <PrivateRoute>
              <PharmacyDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/pharmacy/qr-scan"
          element={
            <PrivateRoute>
              <PharmacyQrScanner />
            </PrivateRoute>
          }
        />
        <Route
          path="/pharmacy/prescription/:consultationId"
          element={
            <PrivateRoute>
              <PharmacyPrescriptionPage />
            </PrivateRoute>
          }
        />

        {/* ========== Redirect unknown routes ========== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
