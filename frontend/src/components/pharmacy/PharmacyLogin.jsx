import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PharmacyLogin.css";

const PharmacyLogin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Use full backend URL
      const response = await axios.post(
        "http://127.0.0.1:8000/api/pharmacy/login/",
        {
          username: user,
          password: password,
        }
      );

      if (response.data.success) {
        // Save token and user info
        localStorage.setItem("pharmacyToken",response.data.token);
        localStorage.setItem("pharmacyUser", JSON.stringify(response.data.user));

        // Redirect to dashboard
        navigate("/pharmacy/dashboard");
      } else {
        alert(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharmacy-login-container">
      <div className="pharmacy-login-card">
        <h2>Pharmacy Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
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
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PharmacyLogin;