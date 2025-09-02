import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientLogin from './components/PatientLogin';
import AppointmentsList from './components/AppointmentsList';
import PatientRegister from './components/PatientRegister';
import PatientDashboard from "./components/PatientDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PatientLogin />} />
        <Route path="/appointments" element={<AppointmentsList />} />
        <Route path="/register" element={<PatientRegister />} />
        {/* ✅ Correct route name */}
        <Route path="/dashboard" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
