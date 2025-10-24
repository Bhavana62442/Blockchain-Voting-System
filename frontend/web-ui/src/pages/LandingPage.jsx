import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/LandingPage.css";
import "../index.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="logo">🗳️ Blockchain Voting</div>
        <nav>
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/about")}>About</button>
          <button onClick={() => navigate("/voter-login")}>Voter Login</button>
          <button onClick={() => navigate("/admin-login")}>Admin Login</button>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="content">
        <section className="hero">
          <h1>Secure & Transparent Voting</h1>
          <p>Empowering democracy with blockchain technology.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/voter-login")}>Vote Now</button>
            <button onClick={() => navigate("/admin-login")}>Admin Panel</button>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="features">
          <div className="card">
            <h3>Blockchain Security</h3>
            <p>Every vote is immutable, transparent, and verifiable.</p>
          </div>
          <div className="card">
            <h3>Smart Contracts</h3>
            <p>Automated vote counting and election rules enforcement.</p>
          </div>
          <div className="card">
            <h3>Voter Authentication</h3>
            <p>Secure login through DigiLocker ensures verified citizens only.</p>
          </div>
        </section>

        {/* About Section */}
        <section className="about">
          <h2>About the System</h2>
          <p>
            This blockchain voting system prototype leverages Hyperledger Fabric,
            Smart Contracts, and Chameleon Hashing to provide a secure, transparent,
            and tamper-proof voting experience. DigiLocker authentication ensures
            only verified voters can participate.
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer>© 2025 Blockchain Voting Prototype</footer>
    </div>
  );
};

export default LandingPage;
