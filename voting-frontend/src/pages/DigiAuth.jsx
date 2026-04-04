import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DigiAuth() {
  const navigate = useNavigate();
  const [mobile,  setMobile]  = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (mobile.length !== 10 || aadhaar.length !== 4) {
      setError("Enter valid 10-digit mobile and 4-digit Aadhaar.");
      return;
    }

    try {
      setLoading(true);

      // auth-backend (port 3000) checks MongoDB DigiLocker simulation
      const res  = await fetch("http://localhost:3000/auth/start", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone: mobile, aadhaarLast4: aadhaar })
      });
      const data = await res.json();

      if (data.error) {
        setError("Details not found. Please check your mobile and Aadhaar.");
        setLoading(false);
        return;
      }

      localStorage.setItem("phone",     mobile);
      localStorage.setItem("authPhone", mobile);
      navigate("/otp-verify");

    } catch {
      setError("Cannot connect to auth server. Is it running on port 3000?");
      setLoading(false);
    }
  };

  return (
    <div className="digi-page">
      <div className="digi-topbar">Secure Digital Identity Gateway</div>
      <header className="digi-header">
        <img src="/images/digilocker-logo.png" alt="DigiLocker" />
        <div>
          <h1>Digital Identity Verification</h1>
          <span>Secure authentication required to access the voting portal</span>
        </div>
      </header>

      <div className="digi-card">
        <h2>Verify Your Identity</h2>
        <p className="digi-sub">Enter your mobile number and Aadhaar to continue.</p>

        <form onSubmit={handleVerify}>
          <label>Mobile Number</label>
          <div className="digi-input-row">
            <span>+91</span>
            <input
              type="text" maxLength="10" placeholder="Mobile number"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <label>Last 4 digits of Aadhaar</label>
          <input
            type="password" maxLength="4" placeholder="XXXX"
            value={aadhaar}
            onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))}
            required
          />

          {error && <p style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>{error}</p>}

          <button className="digi-btn" disabled={loading}>
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        <p className="digi-terms">
          By continuing, you consent to identity verification for accessing the voting service.
        </p>
      </div>
      <footer className="digi-footer">Secure Voting System – Academic Research Prototype</footer>
    </div>
  );
}
