import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacyLogin from "./pages/PharmacyLogin";
import PharmacyQrScanner from "./components/PharmacyQrScanner";
import MedicineTable from "./components/MedicineTable";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home route → Login page */}
        <Route path="/" element={<PharmacyLogin />} />

        {/* QR Scanner route (public, for testing) */}
        <Route path="/pharmacy-qr-scanner" element={<PharmacyQrScanner />} />

        {/* Medicines route */}
        <Route path="/medicines" element={<MedicineTable />} />

        {/* Explicit login route (same as home) */}
        <Route path="/pharmacy-login" element={<PharmacyLogin />} />

        {/* Protected route */}
        <Route
          path="/pharmacy-qr"
          element={
            <RequireAuth>
              <PharmacyQrScanner />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
