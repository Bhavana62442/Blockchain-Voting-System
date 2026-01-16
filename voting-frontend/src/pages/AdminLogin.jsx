import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Backend auth will be connected later
    navigate("/admin");
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        {/* HEADER */}
        <div className="admin-login-header">
          <img src="/images/eci-logo.png" alt="ECI" />
          <h1>Election Commission of India</h1>
          <p>Administrative Access Portal</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="admin-login-form">

          <h2>Administrator Login</h2>

          <p className="admin-login-info">
            Sign in using your authorized administrator credentials.
          </p>

          <label>Administrator ID</label>
          <input
            type="text"
            placeholder="Enter Administrator ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            Sign In
          </button>
        </form>

        {/* FOOTER WARNING */}
        <p className="admin-login-warning">
          Unauthorized access is prohibited and may be subject to legal action
          under applicable laws.
        </p>
      </div>
    </div>
  );
}
