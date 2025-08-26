import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacyScanner from "./pages/PharmacyScanner"; // Import the QR scanner component

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page */}
        <Route
          path="/"
          element={
            <div className="App" style={{ padding: "20px" }}>
              <h1>Welcome to HealthPass Frontend</h1>
              <p>
                Go to <a href="/pharmacy-scanner">Pharmacy QR Scanner</a>
              </p>
            </div>
          }
        />
        {/* Pharmacy Scanner page */}
        <Route path="/pharmacy-scanner" element={<PharmacyScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
