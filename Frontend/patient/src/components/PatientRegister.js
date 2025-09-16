import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation

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
  // A softer, more inviting gradient
  backgroundImage: 'linear-gradient(to right bottom, #add8e6, #87ceeb, #6495ed, #4682b4, #3676a0)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", // Professional font
  color: '#333',
};

const formWrapperStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)', // Nearly opaque white for crispness
  padding: '50px', // More padding
  borderRadius: '12px', // Slightly more rounded
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)', // Deeper shadow for elevation
  textAlign: 'center',
  maxWidth: '500px', // Wider form to accommodate more inputs cleanly
  width: '90%',
  animation: 'fadeIn 0.8s ease-out', // Simple fade-in animation

  // You'd typically define keyframes in a CSS file or using a library
  // For inline, this is a placeholder. Add to a global CSS file:
  // @keyframes fadeIn {
  //   from { opacity: 0; transform: translateY(-20px); }
  //   to { opacity: 1; transform: translateY(0); }
  // }
};

const headingStyle = {
  marginBottom: '30px',
  color: '#333',
  fontSize: '2.2em', // Larger heading
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
  display: 'grid', // Use CSS Grid for a clean two-column-like layout (or single column on small screens)
  gridTemplateColumns: '1fr', // Single column by default
  gap: '15px', // Space between inputs
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
  padding: '14px', // More padding
  border: '1px solid #ced4da', // Lighter, more subtle border
  borderRadius: '8px', // More rounded
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
  padding: '15px', // Even more padding
  backgroundColor: '#007bff', // Primary blue color
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1em',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '25px', // More space above the button
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

linkStyle[':hover'] = {
  color: '#0056b3',
  textDecoration: 'underline',
};