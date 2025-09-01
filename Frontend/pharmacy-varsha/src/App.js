import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacyQrScanner from "./components/PharmacyQrScanner";
import MedicineTable from "./components/MedicineTable";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route
          path="/"
          element={
            <div style={{ padding: "20px" }}>
              <h1>Welcome to HealthPass Frontend</h1>
              <PharmacyQrScanner />
            </div>
          }
        />

        {/* QR Scanner route */}
        <Route
          path="/pharmacy-qr-scanner"
          element={<PharmacyQrScanner />}
        />

        {/* Medicines route (newly added) */}
        <Route
          path="/medicines"
          element={<MedicineTable />}
        />
      </Routes>
    </Router>
  );
}

export default App;
