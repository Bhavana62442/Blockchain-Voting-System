import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {

  const navigate  = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Officer — can access dashboard, ledger, redactions
    if (username === "officer" && password === "officer123") {
      localStorage.setItem("adminRole", "officer");
      navigate("/admin");
      return; // ← this was missing — caused error to always show
    }

    // Senior officer — can access everything including senior redactions
    if (username === "senior" && password === "senior123") {
      localStorage.setItem("adminRole", "senior");
      navigate("/admin");
      return; // ← this was missing
    }

    // Neither matched
    setError("Invalid credentials. Access denied.");
  };

  return (
    <div className="admin-login-page">

      <button className="back-home" onClick={() => navigate("/")}>
        ← Home
      </button>

      <div className="admin-login-card">

        <h1>Election Administration Portal</h1>

        <p className="admin-subtitle">
          Authorized election personnel only
        </p>

        <form onSubmit={handleLogin}>

          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button className="admin-login-btn">Login</button>

        </form>

        <div style={{ marginTop: "20px", fontSize: "12px", color: "#999", textAlign: "center" }}>
          <p>Officer access: dashboard, ledger, redactions</p>
          <p>Senior access: all pages + results control</p>
        </div>

      </div>

    </div>
  );
}
