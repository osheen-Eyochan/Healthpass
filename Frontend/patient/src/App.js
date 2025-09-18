import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientLogin from './components/PatientLogin';
import AppointmentsList from './components/AppointmentsList';
import PatientRegister from './components/PatientRegister';
import PatientDashboard from './components/PatientDashboard';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken"); // Use the token stored on login
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PatientLogin />} />
        <Route path="/register" element={<PatientRegister />} />

        {/* Protected Routes */}
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

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
