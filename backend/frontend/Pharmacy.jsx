import React, { useState } from "react";

export default function Pharmacy() {
  const [tokenId, setTokenId] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState("");

  // Mock fetch for now
  const handleFetch = () => {
    if (tokenId === "ABC123") {
      setTokenData({
        patient: "John Doe",
        medicines: "Paracetamol: 1-0-1\nVitamin C: 1-1-1",
        payment_verified: true,
        dispensed: false,
      });
      setError("");
    } else {
      setError("Token not found");
      setTokenData(null);
    }
  };

  const handleDispense = () => {
    if (tokenData) {
      setTokenData({ ...tokenData, dispensed: true });
      alert("Medicine marked as dispensed (mock)");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pharmacy Module</h2>
      <input
        type="text"
        placeholder="Enter Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <button onClick={handleFetch}>Fetch Details</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {tokenData && (
        <div style={{ marginTop: "20px", border: "1px solid gray", padding: "10px" }}>
          <p><strong>Patient:</strong> {tokenData.patient}</p>
          <p><strong>Medicines:</strong></p>
          <pre>{tokenData.medicines}</pre>
          <p><strong>Payment Verified:</strong> {tokenData.payment_verified ? "Yes" : "No"}</p>
          <p><strong>Dispensed:</strong> {tokenData.dispensed ? "Yes" : "No"}</p>

          {!tokenData.dispensed && (
            <button onClick={handleDispense}>Mark as Dispensed</button>
          )}
        </div>
      )}
    </div>
  );
}
