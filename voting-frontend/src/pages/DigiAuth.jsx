import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DigiAuth() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();

    if (mobile.length === 10 && aadhaar.length === 4) {
      setVerified(true);
      setTimeout(() => navigate("/otp-verify"), 800);
    }
  };

  return (
    <div className="digi-page">

      {/* TOP BAR */}
      <div className="digi-topbar">
        Secure Digital Identity Gateway
      </div>

      {/* HEADER */}
      <header className="digi-header">
        <img src="/images/digilocker-logo.png" alt="Identity Gateway" />
        <div>
          <h1>Digital Identity Verification</h1>
          <span>Secure authentication required to access the voting portal</span>
        </div>
      </header>

      {/* CARD */}
      <div className="digi-card">
        <h2>Verify Your Identity</h2>
        <p className="digi-sub">
          Enter your mobile number and Aadhaar verification to continue.
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
          By continuing, you consent to identity verification for accessing the voting service.
        </p>

      </div>

      {/* FOOTER */}
      <footer className="digi-footer">
        Secure Voting System – Academic Research Prototype
      </footer>

    </div>
  );
}