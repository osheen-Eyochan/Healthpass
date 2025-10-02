import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MedicineTable({ patientName, doctorName, tokenId }) {
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState([]);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  // Fetch medicines from backend
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/pharmacy/medicines/")
      .then((res) => setMedicines(res.data))
      .catch((err) => console.error(err));
  }, []);

  const addMedicine = (med) => {
    if (!selected.find((m) => m.id === med.id)) {
      setSelected([...selected, { ...med, days: 1, quantity: 1, rate: Number(med.rate) }]);
    }
  };

  const removeMedicine = (id) => {
    setSelected(selected.filter((m) => m.id !== id));
  };

  const updateField = (id, field, value) => {
    setSelected(
      selected.map((m) =>
        m.id === id ? { ...m, [field]: parseInt(value) || 1 } : m
      )
    );
  };

  const calculateTotal = () => {
    let sum = 0;
    selected.forEach((m) => (sum += m.rate * m.days * m.quantity));
    setTotal(sum);
  };

  const handlePrint = () => {
    navigate("/receipt", {
      state: {
        selected,
        total,
        tokenId,
        patientName,
        doctorName,
      },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Medicines</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rate (₹)</th>
            <th>Days</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => {
            const selectedMed = selected.find((m) => m.id === med.id);
            return (
              <tr key={med.id}>
                <td>{med.name}</td>
                <td>{med.rate}</td>
                <td>
                  {selectedMed ? (
                    <input
                      type="number"
                      min="1"
                      value={selectedMed.days}
                      onChange={(e) => updateField(med.id, "days", e.target.value)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {selectedMed ? (
                    <input
                      type="number"
                      min="1"
                      value={selectedMed.quantity}
                      onChange={(e) => updateField(med.id, "quantity", e.target.value)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {!selectedMed ? (
                    <button onClick={() => addMedicine(med)}>Add</button>
                  ) : (
                    <button onClick={() => removeMedicine(med.id)}>Remove</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={calculateTotal}
        style={{
          marginTop: "15px",
          padding: "8px 15px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        disabled={selected.length === 0}
      >
        Total
      </button>

      {total > 0 && (
        <>
          <h3 style={{ marginTop: "15px" }}>Total: ₹{total.toFixed(2)}</h3>
          <button
            onClick={handlePrint}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Print Receipt
          </button>
        </>
      )}
    </div>
  );
}

export default MedicineTable;
