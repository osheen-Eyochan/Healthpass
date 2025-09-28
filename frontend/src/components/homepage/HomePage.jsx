import React from "react";
import { FaUserInjured, FaUserMd, FaClipboard, FaPills } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const services = [
    { name: "Patient", icon: <FaUserInjured />, link: "/login" },
    { name: "Doctor", icon: <FaUserMd />, link: "/doctor/login" },
    { name: "Receptionist", icon: <FaClipboard />, link: "/receptionist/login" },
    { name: "Pharmacy", icon: <FaPills />, link: "/pharmacy/login" },
  ];

  return (
    <div className="homepage">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">HealthPass Hospital</div>
        <nav>
          <ul>
            <li onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</li>
            <li onClick={() => document.getElementById("about").scrollIntoView({ behavior: "smooth" })}>About</li>
            <li onClick={() => document.getElementById("contact").scrollIntoView({ behavior: "smooth" })}>Contact</li>
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Welcome to HealthPass Hospital</h1>
        <p>Excellence in 24/7 Healthcare Services</p>
      </section>

      {/* About */}
      <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          HealthPass Hospital provides top-notch healthcare with experienced professionals and state-of-the-art facilities.
          We are committed to patient care and wellness 24/7.
        </p>
      </section>

      {/* Services */}
      <section className="services">
        {services.map((service, idx) => (
          <div key={idx} className="service-card" onClick={() => navigate(service.link)}>
            <div className="icon">{service.icon}</div>
            <h3>{service.name}</h3>
          </div>
        ))}
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Email: info@healthpass.com | Phone: +91 1234567890</p>
        <p>Address: 123 Health Street, YourCity, YourState</p>
      </section>

      <footer className="footer">
        &copy; {new Date().getFullYear()} HealthPass Hospital. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
