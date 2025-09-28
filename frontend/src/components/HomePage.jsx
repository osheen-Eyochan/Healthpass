import React from "react";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="homepage">
      <div className="login-box">
        <h2>Login</h2>
        <form>
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;
