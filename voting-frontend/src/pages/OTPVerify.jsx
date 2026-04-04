import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OTPVerify() {

  const navigate = useNavigate();
  const [otp,       setOtp]       = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error,     setError]     = useState("");

  // Get the real phone number from DigiAuth page
  const phone = localStorage.getItem("phone") || "";
  // Show last 4 digits only e.g. ****5243
  const maskedPhone = phone.length >= 4
    ? "****" + phone.slice(-4)
    : "****";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setVerifying(true);

      // Verify OTP with auth-backend (port 3000)
      const res  = await fetch("http://localhost:3000/auth/verify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone, otp })
      });
      const data = await res.json();

      if (!data.allowed) {
        const msg =
          data.error === "OTP_EXPIRED"  ? "OTP has expired. Go back and try again." :
          data.error === "INVALID_OTP"  ? "Incorrect OTP. Please try again." :
          data.reason === "NO_VOTER_ID" ? "No Voter ID found in DigiLocker." :
          "Verification failed. Please try again.";
        setError(msg);
        setVerifying(false);
        return;
      }

      localStorage.setItem("authPhone", phone);
      navigate("/consent");

    } catch {
      setError("Cannot connect to auth server. Is it running on port 3000?");
      setVerifying(false);
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

        {/* OTP INFO — shows real masked phone number */}
        <div
          style={{
            background: "#f3f4f6",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          OTP sent to mobile ending in <strong>{maskedPhone}</strong><br />
          Valid for <strong>2 minutes</strong>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Enter OTP</label>

          <input
            type="text"
            maxLength="6"
            placeholder="Enter 6 digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
          />

          {error && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>
              {error}
            </p>
          )}

          <button className="digi-btn" disabled={verifying}>
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
