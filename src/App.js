import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pharmacy from "./pages/Pharmacy"; // Import your Pharmacy page

function App() {
  return (
    <Router>
      <Routes>
        {/* Pharmacy page route */}
        <Route path="/pharmacy" element={<Pharmacy />} />
      </Routes>
    </Router>
  );
}

export default App;
