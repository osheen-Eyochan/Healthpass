import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">HealthPass</div>
      <ul className="nav-links">
        <li>
          <Link to="/receptionist/login">Receptionist Login</Link>
        </li>
        <li>
          <Link to="/doctor/login">Doctor Login</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;