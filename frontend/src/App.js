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
import PharmacyPrescriptionPage from "./components/pharmacy/PharmacyPrescriptionPage";

// ================= Admin Components =================
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";

// ================= General Components =================
import HomePage from "./components/homepage/HomePage";

// ================= Private Route Wrappers =================
const PrivateRoute = ({ children, tokenKey }) => {
  const token = localStorage.getItem(tokenKey);
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= Home Page ================= */}
        <Route path="/" element={<HomePage />} />

        {/* ================= Patient Routes ================= */}
        <Route path="/login" element={<PatientLogin />} />
        <Route path="/register" element={<PatientRegister />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute tokenKey="token">
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute tokenKey="token">
              <AppointmentsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointment/:id"
          element={
            <PrivateRoute tokenKey="token">
              <AppointmentDetails />
            </PrivateRoute>
          }
        />

        {/* ================= Receptionist Routes ================= */}
        <Route path="/receptionist/login" element={<ReceptionistLogin />} />
        <Route
          path="/receptionist/dashboard"
          element={
            <PrivateRoute tokenKey="receptionistToken">
              <ReceptionistDashboard />
            </PrivateRoute>
          }
        />

        {/* ================= Doctor Routes ================= */}
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route
          path="/doctor/dashboard"
          element={
            <PrivateRoute tokenKey="doctorToken">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/consultations"
          element={
            <PrivateRoute tokenKey="doctorToken">
              <ConsultationList />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/consultation"
          element={
            <PrivateRoute tokenKey="doctorToken">
              <ConsultationCreate />
            </PrivateRoute>
          }
        />

        {/* ================= Pharmacy Routes ================= */}
        <Route path="/pharmacy/login" element={<PharmacyLogin />} />
        <Route
          path="/pharmacy/dashboard"
          element={
            <PrivateRoute tokenKey="pharmacyToken">
              <PharmacyDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/pharmacy/qr-scan"
          element={
            <PrivateRoute tokenKey="pharmacyToken">
              <PharmacyQrScanner />
            </PrivateRoute>
          }
        />
        <Route
          path="/pharmacy/prescription/:consultationId"
          element={
            <PrivateRoute tokenKey="pharmacyToken">
              <PharmacyPrescriptionPage />
            </PrivateRoute>
          }
        />

        {/* ================= Admin Routes ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute tokenKey="adminToken">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

        {/* ================= Redirect unknown routes ================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
