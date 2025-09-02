import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function PatientLogin() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/patient/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // ✅ Store token and username in localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", formData.username);
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage("❌ " + (data.error || "Invalid credentials"));
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Patient Login</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
        <input
          autoFocus
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "20px" }}>
        New user? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
