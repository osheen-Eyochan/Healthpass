import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function PatientRegister() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    phone: '',
    age: '',
    gender: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setMessage('❌ Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok && data.token) {
        setMessage('✅ Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/'), 1500); // Redirect to login route
      } else {
        setMessage('❌ Registration failed: ' + (data.error || JSON.stringify(data)));
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h2 style={headingStyle}>Patient Registration</h2>
        {message && <p style={message.startsWith('❌') ? errorMessageStyle : successMessageStyle}>{message}</p>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="username" style={labelStyle}>Username</label>
            <input autoFocus name="username" id="username" placeholder="Enter your username" value={formData.username} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input name="password" id="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="confirm_password" style={labelStyle}>Confirm Password</label>
            <input name="confirm_password" id="confirm_password" type="password" placeholder="Confirm your password" value={formData.confirm_password} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input name="email" id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="phone" style={labelStyle}>Phone</label>
            <input name="phone" id="phone" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="age" style={labelStyle}>Age</label>
            <input name="age" id="age" type="number" placeholder="Enter your age" value={formData.age} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="gender" style={labelStyle}>Gender</label>
            <select name="gender" id="gender" value={formData.gender} onChange={handleChange} required style={inputStyle}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={loginPromptStyle}>
          Already have an account? <Link to="/" style={linkStyle}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

// --- Styles ---

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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
  maxWidth: '800px', // Increased max-width for two-column layout
  width: '90%',
  animation: 'fadeIn 0.8s ease-out',
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
  gridTemplateColumns: '1fr 1fr', // Two columns for the main form fields
  gap: '20px 30px', // Increased gap for better spacing between columns and rows
  textAlign: 'left',
};

const inputGroupStyle = {
  marginBottom: '0', // Remove bottom margin as gap handles spacing
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

const buttonStyle = {
  gridColumn: '1 / -1', // Make the button span all columns
  width: '100%',
  padding: '15px',
  backgroundColor: '#007bff',
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

const loginPromptStyle = {
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