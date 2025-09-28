import React from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div>
      <Navbar />
      <div className="home-container">
        <h1>Welcome to HealthPass</h1>
        <p>Select your portal to continue:</p>
        <div className="portal-buttons">
          <Link to="/receptionist/login" className="btn receptionist-btn">
            Receptionist Portal
          </Link>
          <Link to="/doctor/login" className="btn doctor-btn">
            Doctor Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;