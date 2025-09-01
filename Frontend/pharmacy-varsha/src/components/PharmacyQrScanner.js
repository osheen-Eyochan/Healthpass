import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import axios from "axios";

const PharmacyQrScanner = () => {
  const [qrData, setQrData] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [showMedicines, setShowMedicines] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState([]);
  const [total, setTotal] = useState(0);

  const handleScan = (data) => {
    if (data) {
      setQrData(data.text);
      setScanning(false);
      setError("");
      setShowMedicines(false);
      setSelected([]);
      setTotal(0);
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
      .catch((err) => setError("Failed to fetch medicines."));
  };

  const toggleSelect = (medicine) => {
    const exists = selected.find((m) => m.id === medicine.id);
    if (exists) {
      setSelected(selected.filter((m) => m.id !== medicine.id));
    } else {
      setSelected([...selected, { ...medicine, days: 1 }]); // default 1 day
    }
  };

  const updateDays = (id, days) => {
    const value = Math.max(parseInt(days) || 1, 1); // min 1
    setSelected(selected.map((m) => (m.id === id ? { ...m, days: value } : m)));
  };

  const calculateTotal = () => {
    let sum = 0;
    selected.forEach((m) => (sum += m.rate * m.days));
    setTotal(sum);
  };

  const cancelSelection = () => {
    setSelected([]);
    setTotal(0);
  };

  // Split QR string into lines for vertical display
  let prescriptionLines = [];
  if (qrData) {
    const parts = qrData.split(/(?=Name:|Doctor:|Token ID:|Medicines:)/);
    prescriptionLines = parts.map((line) => line.trim()).filter((line) => line);
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-bold mb-4">Pharmacy QR Scanner</h2>

      {/* Camera and Scan Again / Start Scan buttons */}
      <div className="flex flex-col items-center mb-4">
        {scanning && (
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "300px" }}
          />
        )}

        {/* Scan Again button shows if a QR has already been scanned */}
        {qrData && !scanning && (
          <button
            onClick={() => {
              setScanning(true);       // reopen camera
              setQrData("");           // clear previous QR
              setShowMedicines(false); // hide medicines if any
              setSelected([]);         // clear selected medicines
              setTotal(0);             // reset total
              setError("");            // clear errors
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Scan Again
          </button>
        )}

        {/* Start Scan button before any QR is scanned */}
        {!qrData && !scanning && (
          <button
            onClick={() => setScanning(true)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Start Scan
          </button>
        )}
      </div>

      {qrData && (
        <div className="mt-4 w-full max-w-md bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Prescription Details</h3>

          {/* Prescription displayed vertically */}
          <div className="flex flex-col gap-2 mt-2">
            {prescriptionLines.map((line, index) => (
              <div
                key={index}
                className="bg-white p-2 rounded shadow-sm"
              >
                {line}
              </div>
            ))}
          </div>

          {!showMedicines ? (
            <button
              onClick={fetchAllMedicines}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Show Medicines
            </button>
          ) : (
            <>
              <table className="mt-2 w-full border">
                <thead>
                  <tr>
                    <th className="border px-2">Name</th>
                    <th className="border px-2">Rate</th>
                    <th className="border px-2">Days</th>
                    <th className="border px-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med) => {
                    const sel = selected.find((m) => m.id === med.id);
                    return (
                      <tr key={med.id}>
                        <td className="border px-2">{med.name}</td>
                        <td className="border px-2">₹{med.rate}</td>
                        <td className="border px-2">
                          {sel ? (
                            <input
                              type="number"
                              min="1"
                              value={sel.days}
                              onChange={(e) =>
                                updateDays(med.id, e.target.value)
                              }
                              className="w-16 border rounded px-1"
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="border px-2">
                          <button onClick={() => toggleSelect(med)}>
                            {sel ? "Remove" : "Add"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={calculateTotal}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Total
                </button>

                <button
                  onClick={cancelSelection}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>

              <h3 className="mt-2">Total: ₹{total.toFixed(2)}</h3>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default PharmacyQrScanner;
