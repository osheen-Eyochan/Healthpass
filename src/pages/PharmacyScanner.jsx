import React, { useState } from "react";
import QrScanner from "react-qr-scanner";

const PharmacyScanner = () => {
  const [qrData, setQrData] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const handleScan = (data) => {
    if (data) {
      setQrData(data.text); // QR result comes as 'text'
      console.log("✅ QR Code Data:", data.text);
      setScanning(false); // Stop camera after successful scan
      setError("");
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
    setError("Camera access error. Please check permissions.");
  };

  // Try parsing QR data as JSON
  let parsedData = null;
  try {
    parsedData = JSON.parse(qrData);
  } catch (e) {
    parsedData = null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-bold mb-4">Pharmacy QR Scanner</h2>

      {scanning ? (
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "300px" }}
        />
      ) : (
        <button
          onClick={() => {
            setQrData("");
            setScanning(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        >
          Start Scan
        </button>
      )}

      <div className="mt-4 text-center">
        {qrData ? (
          parsedData ? (
            <div className="text-left bg-gray-100 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg">Prescription Details</h3>
              <p><b>Name:</b> {parsedData.name}</p>
              <p><b>Doctor:</b> {parsedData.doctor}</p>
              <p><b>Token ID:</b> {parsedData.token_id}</p>

              <h4 className="mt-2 font-semibold">Medicines:</h4>
              <ul className="list-disc ml-6">
                {parsedData.medicines?.map((m, i) => (
                  <li key={i}>
                    {m.name} - {m.qty} × ₹{m.price} = ₹{m.qty * m.price}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-bold">
                Total: ₹
                {parsedData.medicines?.reduce((sum, m) => sum + m.qty * m.price, 0)}
              </p>
            </div>
          ) : (
            <p className="text-green-600 font-semibold">✅ Scanned: {qrData}</p>
          )
        ) : (
          <p className="text-gray-500">Scan a QR code to see result...</p>
        )}

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default PharmacyScanner;
