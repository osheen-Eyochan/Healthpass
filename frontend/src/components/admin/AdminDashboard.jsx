import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // doctor, patient, appointment, medicine
  const [modalData, setModalData] = useState({}); // data for add/edit
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [docRes, patRes, apptRes, medRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/admin/doctors/"),
        axios.get("http://127.0.0.1:8000/api/admin/patients/"),
        axios.get("http://127.0.0.1:8000/api/admin/appointments/"),
        axios.get("http://127.0.0.1:8000/api/admin/medicines/"),
      ]);
      setDoctors(docRes.data);
      setPatients(patRes.data);
      setAppointments(apptRes.data);
      setMedicines(medRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete handler
  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/${type}/${id}/`);
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
      setError("Failed to delete item");
    }
  };

  // Open modal
  const openModal = (type, data = {}, edit = false, id = null) => {
    setModalType(type);
    setModalData(data);
    setIsEdit(edit);
    setEditId(id);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalData({});
    setIsEdit(false);
    setEditId(null);
  };

  // Save handler (Add/Edit)
  const handleSave = async () => {
    try {
      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:8000/api/admin/${modalType}/${editId}/`,
          modalData
        );
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/admin/${modalType}/`,
          modalData
        );
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to save data");
    }
  };

  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Generic table renderer
  const renderTable = (type, data, columns) => (
    <section className="admin-section">
      <h3>
        {type.charAt(0).toUpperCase() + type.slice(1)}
        <button
          style={{ marginLeft: "10px" }}
          onClick={() => openModal(type)}
        >
          Add
        </button>
      </h3>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.key}>{item[col.key]}</td>
              ))}
              <td>
                <button
                  onClick={() =>
                    openModal(type, item, true, item.id)
                  }
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(type, item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <div className="admin-dashboard">
      <h2>HealthPass Admin Dashboard</h2>

      {renderTable("doctors", doctors, [
        { key: "full_name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "specialization", label: "Specialization" },
      ])}

      {renderTable("patients", patients, [
        { key: "name", label: "Name" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "email", label: "Email" },
      ])}

      {renderTable("appointments", appointments, [
        { key: "patient_name", label: "Patient" },
        { key: "doctor_name", label: "Doctor" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "status", label: "Status" },
      ])}

      {renderTable("medicines", medicines, [
        { key: "name", label: "Name" },
        { key: "default_dosage", label: "Dosage" },
        { key: "default_frequency", label: "Frequency" },
        { key: "default_duration", label: "Duration" },
      ])}

      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{isEdit ? "Edit" : "Add"} {modalType}</h3>
            {Object.keys(modalData).length === 0 && !isEdit &&
              // Add empty fields if creating new
              modalType === "doctors" && setModalData({ full_name: "", email: "", specialization: "" })
            }
            {Object.keys(modalData).length === 0 && !isEdit &&
              modalType === "patients" && setModalData({ name: "", age: "", gender: "", email: "" })
            }
            {Object.keys(modalData).length === 0 && !isEdit &&
              modalType === "appointments" && setModalData({ patient_name: "", doctor_name: "", date: "", time: "", status: "" })
            }
            {Object.keys(modalData).length === 0 && !isEdit &&
              modalType === "medicines" && setModalData({ name: "", default_dosage: "", default_frequency: "", default_duration: "" })
            }

            {Object.keys(modalData).map((key) => (
              <input
                key={key}
                placeholder={key}
                value={modalData[key]}
                onChange={(e) =>
                  setModalData({ ...modalData, [key]: e.target.value })
                }
              />
            ))}
            <div style={{ marginTop: "10px" }}>
              <button onClick={handleSave}>Save</button>
              <button onClick={closeModal} style={{ marginLeft: "5px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
