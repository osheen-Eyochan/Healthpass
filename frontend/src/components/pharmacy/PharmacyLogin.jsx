import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PharmacyLogin.css";

const PharmacyLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Example check (replace with backend API call)
    if (email === "pharmacy@example.com" && password === "password") {
      navigate("/pharmacy/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="pharmacy-login-container">
      <div className="pharmacy-login-card">
        <h2>Pharmacy Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default PharmacyLogin;
