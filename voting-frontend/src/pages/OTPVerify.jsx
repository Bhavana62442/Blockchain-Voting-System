import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OTPVerify() {

  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    setVerifying(true);

    setTimeout(() => {
      navigate("/consent");
    }, 900);
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
          <h1>OTP Verification</h1>
          <span>Confirm your mobile authentication</span>
        </div>
      </header>

      {/* CARD */}
      <div className="digi-card">

        <h2>Enter One Time Password</h2>

        <p className="digi-sub">
          An OTP has been sent to your registered mobile number.
        </p>

        {/* OTP INFO */}
        <div
          style={{
            background: "#f3f4f6",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          OTP sent to mobile ending in <strong>****5243</strong><br/>
          Valid for <strong>10 minutes</strong>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Enter OTP</label>

          <input
            type="text"
            maxLength="6"
            placeholder="Enter 6 digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            required
          />

          <button className="digi-btn">
            {verifying ? "Verifying..." : "Continue"}
          </button>

        </form>

        <p className="digi-terms">
          Wait a few seconds for the OTP. Do not refresh or close this page.
        </p>

        <button
          style={{
            marginTop: "10px",
            background: "transparent",
            border: "none",
            color: "#4a64f0",
            cursor: "pointer"
          }}
          onClick={() => navigate("/auth")}
        >
          ← Back to Identity Verification
        </button>

      </div>

      {/* FOOTER */}
      <footer className="digi-footer">
        Secure Voting System – Academic Research Prototype
      </footer>

    </div>
  );
}