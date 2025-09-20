import React from "react";
import { Navigate } from "react-router-dom";

function RequireAuth({ children }) {
  const isAuth = localStorage.getItem("isAuthenticated");

  if (!isAuth) {
    // 🔹 If not logged in, go back to login page
    return <Navigate to="/pharmacy-login" />;
  }

  // 🔹 If logged in, show the protected page
  return children;
}

export default RequireAuth;
