import React, { useState } from "react";

export default function Pharmacy() {
  const [tokenId, setTokenId] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!tokenId.trim()) {
      setError("Please enter a token ID");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/pharmacy/token/${tokenId}/`);

      if (!response.ok) throw new Error("Token not found");

      const data = await response.json();

      setTokenData({
        patient: data.citizen_name,
        medicines: data.medicines || "No medicines listed",
        payment_verified: data.payment_verified || false,
        dispensed: data.dispensed,
      });

      setError("");
    } catch (err) {
      setError(err.message);
      setTokenData(null);
    }
  };

  const handleDispense = () => {
    if (tokenData) {
      setTokenData({ ...tokenData, dispensed: true });
      alert("Medicine marked as dispensed (frontend only — backend update not yet implemented)");
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