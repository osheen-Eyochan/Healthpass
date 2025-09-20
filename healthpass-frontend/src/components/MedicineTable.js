import React, { useEffect, useState } from "react";
import axios from "axios";

function MedicineTable() {
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/pharmacy/medicines/") // Django endpoint
      .then((res) => {
        setMedicines(res.data);
      })
      .catch((err) => {
        console.error("Error fetching medicines:", err);
      });
  }, []);

  const toggleSelect = (medicine) => {
    if (selected.find((m) => m.id === medicine.id)) {
      setSelected(selected.filter((m) => m.id !== medicine.id));
    } else {
      setSelected([...selected, { ...medicine, quantity: 1 }]);
    }
  };

  const calculateTotal = () => {
    let sum = 0;
    selected.forEach((m) => {
      sum += m.rate * m.quantity;
    });
    setTotal(sum);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Medicines</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
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
          {medicines.map((med) => (
            <tr key={med.id}>
              <td>{med.name}</td>
              <td>{med.rate}</td>
              <td>
                <button onClick={() => toggleSelect(med)}>
                  {selected.find((m) => m.id === med.id) ? "Remove" : "Add"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={calculateTotal} style={{ marginTop: "15px" }}>
        Calculate Total
      </button>

      <h3>Total: ₹{total.toFixed(2)}</h3>
    </div>
  );
}

export default MedicineTable;
