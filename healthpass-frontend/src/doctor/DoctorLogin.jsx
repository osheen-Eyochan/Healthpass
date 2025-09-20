// src/doctor/DoctorLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorLogin.css"; // optional CSS

function DoctorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/doctor/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Store doctor info in localStorage
        localStorage.setItem("doctor_id", data.doctor_id);
        localStorage.setItem("doctor_name", data.full_name);
        localStorage.setItem("doctor_email", data.email);

        // Redirect to dashboard
        navigate("/doctor/dashboard");
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to login. Please try again later.");
    }
  };

  return (
    <div className="doctor-login-container">
      <h2>Doctor Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
}

export default DoctorLogin;
