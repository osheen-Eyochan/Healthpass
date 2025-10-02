import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./pharmacyQrScanner.css";

const PharmacyQrScanner = () => {
  const [qrData, setQrData] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [showMedicines, setShowMedicines] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState([]);
  const [total, setTotal] = useState(0);

  const [patientDetails, setPatientDetails] = useState({
    tokenId: "",
    name: "",
    doctor: "",
  });

  const navigate = useNavigate();

  const handleScan = (data) => {
    if (data) {
      setQrData(data.text);
      setScanning(false);
      setError("");
      setShowMedicines(false);
      setSelected([]);
      setTotal(0);

      const tokenMatch = data.text.match(/Token ID:\s*(\d+)/);
      const nameMatch = data.text.match(/Name:\s*(.*)/);
      const doctorMatch = data.text.match(/Doctor:\s*(.*)/);

      setPatientDetails({
        tokenId: tokenMatch ? tokenMatch[1] : "",
        name: nameMatch ? nameMatch[1].trim() : "",
        doctor: doctorMatch ? doctorMatch[1].trim() : "",
      });
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError("Camera access error.");
  };

  const fetchAllMedicines = () => {
    axios
      .get("http://127.0.0.1:8000/api/pharmacy/medicines/")
      .then((res) => {
        setMedicines(res.data);
        setShowMedicines(true);
      })
      .catch(() => setError("Failed to fetch medicines."));
  };

  const toggleSelect = (medicine) => {
    const exists = selected.find((m) => m.id === medicine.id);
    if (exists) {
      setSelected(selected.filter((m) => m.id !== medicine.id));
    } else {
      setSelected([...selected, { ...medicine, days: 1, frequency: "1" }]);
    }
  };

  const updateDays = (id, days) => {
    const value = Math.max(parseInt(days) || 1, 1);
    const updated = selected.map((m) => (m.id === id ? { ...m, days: value } : m));
    setSelected(updated);
  };

  const updateFrequency = (id, freqText) => {
    const updated = selected.map((m) =>
      m.id === id ? { ...m, frequency: freqText } : m
    );
    setSelected(updated);
  };

  const calculateTotal = () => {
    if (selected.length === 0) {
      alert("Please select at least one medicine!");
      return;
    }
    let sum = 0;
    selected.forEach((m) => {
      let freq = 1;
      if (m.frequency) {
        const match = m.frequency.match(/\d+/);
        freq = match ? parseInt(match[0]) : 1;
      }
      sum += m.rate * m.days * freq;
    });
    setTotal(sum);
  };

  const cancelSelection = () => {
    setSelected([]);
    setTotal(0);
  };

  const handleReceipt = () => {
    if (selected.length === 0) {
      alert("No medicines selected!");
      return;
    }
    navigate("/receipt", {
      state: {
        tokenId: patientDetails.tokenId,
        name: patientDetails.name,
        doctor: patientDetails.doctor,
        medicines: selected,
        total: total,
      },
    });
  };

  let prescriptionLines = [];
  if (qrData) {
    const parts = qrData.split(/(?=Name:|Doctor:|Token ID:|Medicines:)/);
    prescriptionLines = parts.map((line) => line.trim()).filter((line) => line);
  }

  return (
    <div className="scanner-container">
      <h2 className="scanner-title">Pharmacy QR Scanner</h2>

      <div className="scanner-box">
        {scanning && (
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "300px" }}
          />
        )}

        {!qrData && !scanning && (
          <button onClick={() => setScanning(true)} className="btn primary">
            Start Scan
          </button>
        )}

        {qrData && !scanning && (
          <button
            onClick={() => {
              setScanning(true);
              setQrData("");
              setShowMedicines(false);
              setSelected([]);
              setTotal(0);
              setError("");
            }}
            className="btn primary"
          >
            Scan Again
          </button>
        )}
      </div>

      {qrData && (
        <div className="prescription-card">
          <h3 className="section-title">Prescription Details</h3>
          <div className="prescription-list">
            {prescriptionLines.map((line, index) => (
              <div key={index} className="prescription-line">
                {line}
              </div>
            ))}
          </div>

          {!showMedicines ? (
            <button onClick={fetchAllMedicines} className="btn success">
              Show Medicines
            </button>
          ) : (
            <>
              <table className="medicine-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Rate</th>
                    <th>Days</th>
                    <th>Frequency</th>
                    <th>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med) => {
                    const sel = selected.find((m) => m.id === med.id);
                    return (
                      <tr key={med.id}>
                        <td>{med.name}</td>
                        <td>₹{med.rate}</td>
                        <td>
                          {sel ? (
                            <input
                              type="number"
                              min="1"
                              value={sel.days}
                              onChange={(e) => updateDays(med.id, e.target.value)}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {sel ? (
                            <input
                              type="text"
                              value={sel.frequency || ""}
                              onChange={(e) => updateFrequency(med.id, e.target.value)}
                              placeholder="e.g., 2x/day"
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <button onClick={() => toggleSelect(med)} className="btn small">
                            {sel ? "Remove" : "Add"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="action-buttons">
                <button onClick={calculateTotal} className="btn primary">
                  Total
                </button>
                <button onClick={cancelSelection} className="btn danger">
                  Cancel
                </button>
              </div>

              {total > 0 && selected.length > 0 && (
                <div className="total-section">
                  <h3 className="total-display">Total: ₹{total.toFixed(2)}</h3>
                  <button onClick={handleReceipt} className="btn success">
                    Receipt
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default PharmacyQrScanner;
