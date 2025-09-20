import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PharmacyLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "pharmacy" && password === "1234") {
      localStorage.setItem("isAuthenticated", "true"); // save login state
      navigate("/pharmacy-qr"); // redirect to QR scanner page
    } else {
      alert("Invalid username or password");
    }
  };

  const handleForgotPassword = () => {
    alert(
      "Password Reset Instructions:\n\n" +
      "Default Credentials:\n" +
      "Username: pharmacy\n" +
      "Password: 1234\n\n" +
      "For password reset, please contact your system administrator."
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #00b894 0%, #00cec9 50%, #0984e3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 25px 45px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Login Header */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "32px",
            color: "white",
            letterSpacing: "2px",
          }}
        >
          LOGIN
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div style={{ marginBottom: "24px" }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "16px",
                border: "none",
                outline: "none",
                fontSize: "16px",
                color: "#4a5568",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 1)";
                e.target.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.5)";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "24px" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "16px",
                border: "none",
                outline: "none",
                fontSize: "16px",
                color: "#4a5568",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 1)";
                e.target.style.boxShadow = "0 0 0 2px rgba(255, 255, 255, 0.5)";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#2d3748",
              color: "white",
              borderRadius: "16px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginBottom: "24px",
              letterSpacing: "1px",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#1a202c";
              e.target.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#2d3748";
              e.target.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "scale(1.02)";
            }}
          >
            SIGN IN
          </button>
        </form>

        {/* Forgot Password Link */}
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px" }}>
            Forgot Password? 
          </span>
          <button
            type="button" // ✅ Important: prevents form submission
            onClick={handleForgotPassword}
            style={{
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: "4px",
              transition: "color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.8)")}
            onMouseOut={(e) => (e.target.style.color = "white")}
          >
            Click Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default PharmacyLogin;
