import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DigiAuth() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();

    // FRONTEND ONLY – assume backend verification success
    if (mobile.length === 10 && aadhaar.length === 4) {
      setVerified(true);
      setTimeout(() => navigate("/vote"), 800);
    }
  };

  return (
    <div className="digi-page">

      {/* TOP GOV BAR */}
      <div className="digi-topbar">
        Government of India
      </div>

      {/* HEADER */}
      <header className="digi-header">
        <img src="/images/eci-logo.png" alt="ECI" />
        <div>
          <h1>DigiLocker</h1>
          <span>Document Wallet to Empower Citizens</span>
        </div>
      </header>

      {/* CARD */}
      <div className="digi-card">
        <h2>Login or Create Account</h2>
        <p className="digi-sub">
          Enter your mobile number and Aadhaar verification
        </p>

        <form onSubmit={handleVerify}>

          <label>Mobile Number</label>
          <div className="digi-input-row">
            <span>+91</span>
            <input
              type="text"
              maxLength="10"
              placeholder="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <label>Last 4 digits of Aadhaar</label>
          <input
            type="password"
            maxLength="4"
            placeholder="XXXX"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
            required
          />

          <button className="digi-btn">
            {verified ? "Verified ✓ Redirecting..." : "Continue"}
          </button>
        </form>

        <p className="digi-terms">
          By continuing, I agree to the Terms of Service
        </p>

        <p className="digi-alt">
          Facing trouble? <span>Try using Voter ID</span>
        </p>
      </div>

      {/* FOOTER */}
      <footer className="digi-footer">
        © Government of India · Digital India Initiative
      </footer>

    </div>
  );
}
