import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacyLogin from "./pages/PharmacyLogin";
import PharmacyQrScanner from "./components/PharmacyQrScanner";
import MedicineTable from "./components/MedicineTable";
import RequireAuth from "./components/RequireAuth";
import ReceiptPage from "./components/ReceiptPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home route → Login page */}
        <Route path="/" element={<PharmacyLogin />} />

        {/* Medicines route */}
        <Route path="/medicines" element={<MedicineTable />} />

        {/* Receipt page */}
        <Route path="/receipt" element={<ReceiptPage />} /> 

        {/* QR Scanner route (public, for testing) */}
        <Route path="/pharmacy-qr-scanner" element={<PharmacyQrScanner />} />

       <Route path="*" element={<MedicineTable />} />
        {/* Protected QR Scanner route */}
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
