import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import '../App.css'; // Ensure this points to your main CSS file

function HomePage() {
  const navigate = useNavigate();

  const handlePatientLogin = () => {
    navigate('/patient-login');
  };

  const handlePatientRegister = () => {
    navigate('/patient-register');
  };

  const handleProfessionalLogin = (role) => {
    // This is where you'd navigate to specific professional login pages.
    // For now, we'll alert and log to console.
    console.log(`Attempting to log in as ${role}...`);
    alert(`Redirecting to ${role} Login! (Route not implemented yet)`);
    // Example: navigate(`/${role.toLowerCase()}-login`); // You'd define these routes in App.js
  };

  return (
    <div className="container">
      <header>
        <div className="logo">
          {/* Replace with your actual professional logo URL or local path */}
          <img src="https://via.placeholder.com/150x150?text=HealthPass+Pro+Logo" alt="HealthPass Logo" />
        </div>
        <h1>HealthPass - Your Integrated Healthcare Hub</h1>
        <p>A seamless experience for patients and healthcare professionals, empowering better health outcomes.</p>
      </header>

      <main>
        <section className="role-section patient-section">
          <h2>Are you a Patient?</h2>
          <p className="description">Securely manage your health records, book appointments, and access prescriptions with ease.</p>
          <div className="buttons">
            <button className="btn primary" onClick={handlePatientLogin}>Patient Login</button>
            <button className="btn secondary" onClick={handlePatientRegister}>Patient Register</button>
          </div>
        </section>

        <hr /> {/* Professional divider */}

        <section className="role-section professional-section">
          <h2>Are you a Healthcare Professional or Administrator?</h2>
          <p className="instruction">Please select your role to access your dedicated portal:</p>
          <div className="buttons grid-buttons">
            <button className="btn professional" onClick={() => handleProfessionalLogin('Receptionist')}>Receptionist Login</button>
            <button className="btn professional" onClick={() => handleProfessionalLogin('Doctor')}>Doctor Login</button>
            <button className="btn professional" onClick={() => handleProfessionalLogin('Pharmacist')}>Pharmacist Login</button>
            <button className="btn professional" onClick={() => handleProfessionalLogin('Administrator')}>Administrator Login</button>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-links">
          {/* Using Link component for internal navigation to avoid a11y warning */}
          <Link to="/forgot-password">Forgot Password?</Link>
          <span className="separator">|</span>
          <Link to="/help">Need Help?</Link>
          <span className="separator">|</span>
          <Link to="/contact">Contact Support</Link>
        </div>
        <p>&copy; 2023 HealthPass. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;