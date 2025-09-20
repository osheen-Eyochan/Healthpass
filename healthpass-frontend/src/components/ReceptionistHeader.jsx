import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReceptionistHeader.css"; // ✅ make sure your CSS file is imported

const ReceptionistHeader = ({ receptionistName, currentTime }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("receptionist"); // clear session
    navigate("/receptionist/login");         // redirect to login
  };

  return (
    <header className="hp-header">
      {/* Left side: portal + greeting */}
      <div className="hp-header-left">
        <span className="hp-portal">HealthPass Receptionist Portal</span>
        <span className="hp-greeting">Welcome, {receptionistName}</span>
      </div>

      {/* Right side: clock + logout */}
      <div className="hp-header-right">
        <span className="hp-clock">{currentTime}</span>
        <button onClick={handleLogout} className="hp-logout">
          Logout
        </button>
      </div>
    </header>
  );
};

export default ReceptionistHeader;
