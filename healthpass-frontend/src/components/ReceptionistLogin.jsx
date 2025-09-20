import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReceptionistLogin.css"; // ✅ Import CSS

const ReceptionistLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/receptionist/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Store receptionist in the same key used by Dashboard
        localStorage.setItem("receptionist", JSON.stringify(data));

        // ✅ Redirect to the same path used in App.js
        navigate("/receptionist/dashboard");
      } else {
        setMessage("Login failed. Please check your username and password.");
      }
    } catch (error) {
      setMessage("Error connecting to backend");
      console.error(error);
    }
  };

  return (
    <div className="receptionist-login-container">
      <div className="receptionist-login-card">
        <h2>Receptionist Login</h2>
        <form onSubmit={handleLogin} className="receptionist-login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p className="receptionist-error">{message}</p>}
      </div>
    </div>
  );
};

export default ReceptionistLogin;
