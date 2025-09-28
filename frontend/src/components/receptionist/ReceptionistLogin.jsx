// src/receptionist/ReceptionistLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReceptionistLogin.css"; // your CSS

const ReceptionistLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // required field
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage("Username and password are required");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/receptionist/login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store receptionist info in localStorage
        localStorage.setItem("receptionist", JSON.stringify(data));

        // Navigate to dashboard
        navigate("/receptionist/dashboard");
      } else {
        setMessage(
          "Login failed. Please check your username and password."
        );
      }
    } catch (error) {
      setMessage("Error connecting to backend");
      console.error(error);
    }
  };

  return (
    <div className="receptionist-login-container">
      <div className="receptionist-login-card">
        <h2>Receptionist Login</h2>
        <form
          onSubmit={handleLogin}
          className="receptionist-login-form"
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (simple passwords allowed)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p className="receptionist-error">{message}</p>}
      </div>
    </div>
  );
};

export default ReceptionistLogin;
