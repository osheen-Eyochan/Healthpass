// src/doctor/DoctorLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DoctorLogin.css";

function DoctorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/doctor/login/",
        { username, password }
      );

      if (response.data.success) {
        // Save doctor info & token to localStorage
        localStorage.setItem(
          "doctorInfo",
          JSON.stringify({
            id: response.data.doctor_id,
            name: response.data.full_name,
          })
        );
        localStorage.setItem("doctorToken", response.data.token);

        // Navigate to dashboard
        navigate("/doctor/dashboard", { replace: true });
      } else {
        setError(response.data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login Axios error:", err.toJSON ? err.toJSON() : err);
      setError("Error connecting to backend");
    }
  };

  return (
    <div className="doctor-login-container">
      <div className="doctor-login-card">
        <h2 className="doctor-login-heading">Doctor Login</h2>

        <form className="doctor-login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        {error && <div className="doctor-error">{error}</div>}
      </div>
    </div>
  );
}

export default DoctorLogin;
