import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      setMessage('Passwords do not match!');
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
        setTimeout(() => navigate('/'), 1500); // ✅ redirect to login route
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
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <h2>Patient Registration</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
        <input autoFocus name="username" placeholder="Username" value={formData.username} onChange={handleChange} required /><br /><br />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required /><br /><br />
        <input name="confirm_password" type="password" placeholder="Confirm Password" value={formData.confirm_password} onChange={handleChange} required /><br /><br />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required /><br /><br />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required /><br /><br />
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required /><br /><br />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select><br /><br />
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
}
