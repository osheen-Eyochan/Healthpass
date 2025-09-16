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
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h2 style={headingStyle}>Patient Login</h2>
        {message && <p style={message.startsWith('❌') ? errorMessageStyle : successMessageStyle}>{message}</p>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="username" style={labelStyle}>Username</label>
            <input
              autoFocus
              name="username"
              id="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              name="password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={registerPromptStyle}>
          New user? <Link to="/register" style={linkStyle}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

// --- Styles (reusing and adapting from Registration for consistency) ---

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  // Using the same beautiful gradient for consistency
  backgroundImage: 'linear-gradient(to right bottom, #add8e6, #87ceeb, #6495ed, #4682b4, #3676a0)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  color: '#333',
};

const formWrapperStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  padding: '50px',
  borderRadius: '12px',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  textAlign: 'center',
  maxWidth: '450px', // Slightly narrower than registration for login
  width: '90%',
  animation: 'fadeIn 0.8s ease-out',

  // Remember to define @keyframes fadeIn in a global CSS file
};

const headingStyle = {
  marginBottom: '30px',
  color: '#333',
  fontSize: '2.2em',
  fontWeight: '600',
};

const messageBaseStyle = {
  padding: '10px 15px',
  borderRadius: '8px',
  marginBottom: '20px',
  fontWeight: 'bold',
  fontSize: '0.95em',
};

const successMessageStyle = {
  ...messageBaseStyle,
  backgroundColor: '#e6ffed',
  color: '#28a745',
  border: '1px solid #28a745',
};

const errorMessageStyle = {
  ...messageBaseStyle,
  backgroundColor: '#ffe6e6',
  color: '#dc3545',
  border: '1px solid #dc3545',
};

const formStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '15px',
  textAlign: 'left',
};

const inputGroupStyle = {
  marginBottom: '10px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: '500',
  color: '#555',
  fontSize: '0.9em',
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  border: '1px solid #ced4da',
  borderRadius: '8px',
  fontSize: '1em',
  lineHeight: '1.5',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
};

// Placeholder for focus style (needs a CSS file or styled-components for actual :focus)
inputStyle[':focus'] = {
  borderColor: '#80bdff',
  outline: '0',
  boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
};

const buttonStyle = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#007bff', // Keep primary blue for consistency
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1em',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '25px',
  transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.2)',
};

// Placeholder for button hover/active styles
buttonStyle[':hover'] = {
  backgroundColor: '#0056b3',
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 15px rgba(0, 123, 255, 0.3)',
};

buttonStyle[':active'] = {
  transform: 'translateY(0)',
  boxShadow: '0 2px 5px rgba(0, 123, 255, 0.2)',
};

const registerPromptStyle = {
  marginTop: '30px',
  fontSize: '0.95em',
  color: '#6c757d',
};

const linkStyle = {
  color: '#007bff',
  textDecoration: 'none',
  fontWeight: 'bold',
  transition: 'color 0.2s ease',
};

linkStyle[':hover'] = {
  color: '#0056b3',
  textDecoration: 'underline',
};