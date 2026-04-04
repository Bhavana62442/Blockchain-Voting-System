import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ConsentPage() {

  const navigate = useNavigate();

  const [aadhaar, setAadhaar] = useState(true);
  const [voterId, setVoterId] = useState(true);
  const [dl,      setDl]      = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleAllow = async () => {
    setError("");
    setLoading(true);

    try {
      const phone = localStorage.getItem("authPhone");
      if (!phone) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      // ── BLIND SIGNATURE ─────────────────────────────────────
      const blindingFactor = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const encoder        = new TextEncoder();
      const dataBuffer     = encoder.encode(phone + Date.now().toString() + blindingFactor);
      const hashBuffer     = await crypto.subtle.digest("SHA-256", dataBuffer);
      const blindedHash    = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0")).join("");

      // ── GET TOKEN FROM MSP (port 8080) ──────────────────────
      const mspRes = await fetch("http://localhost:8080/issue-token", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone, blinded: blindedHash })
      });

      if (!mspRes.ok) {
        const errText = await mspRes.text();
        throw new Error("MSP error: " + errText);
      }

      const { token, signature } = await mspRes.json();

      // ── REGISTER ON BLOCKCHAIN (port 3001) ──────────────────
      try {
        const regRes = await fetch("http://localhost:3001/api/voter/register", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            voterHashID: token,          // ← fixed
            randomness:  signature,      // ← fixed
            mspID:       "KarnatakaMSP" // ← fixed
          })
        });
        const regData = await regRes.json();
        if (!regRes.ok && !regData.error?.includes("already registered")) {
          console.warn("Blockchain register warning:", JSON.stringify(regData));
        } else {
          console.log("✅ Voter registered on blockchain");
        }
      } catch (regErr) {
        console.warn("Blockchain API not running — skipping register:", regErr.message);
      }

      // ── STORE FOR VOTE PAGE ─────────────────────────────────
      localStorage.setItem("votingToken",    token);
      localStorage.setItem("signature",      signature);
      localStorage.setItem("blindingFactor", blindingFactor);

      navigate("/vote");

    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="digi-page">

      {/* HEADER */}
      <header className="digi-header">
        <img src="/images/digilocker-logo.png" alt="DigiLocker" />
        <div>
          <h1>DigiLocker</h1>
          <span>Document Wallet to Empower Citizens</span>
        </div>
      </header>

      {/* CONSENT BOX */}
      <div style={{
        maxWidth: "700px",
        margin: "40px auto",
        background: "#ffffff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
      }}>

        <p style={{ marginBottom: "20px", fontSize: "15px" }}>
          Please provide your consent to share the following with
          <strong> Secure Voting Portal</strong>:
        </p>

        {/* ISSUED DOCUMENTS */}
        <div style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <h3 style={{ marginBottom: "12px" }}>Issued Documents</h3>
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input type="checkbox" checked={aadhaar} onChange={() => setAadhaar(!aadhaar)} />{" "}
            Aadhaar Verification (XXXX 3325)
          </label>
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input type="checkbox" checked={voterId} onChange={() => setVoterId(!voterId)} />{" "}
            Voter ID Authentication (XXXX 6789)
          </label>
          <label style={{ display: "block" }}>
            <input type="checkbox" checked={dl} onChange={() => setDl(!dl)} />{" "}
            Driving License (can be accessed)
          </label>
        </div>

        {/* PROFILE */}
        <div style={{ marginTop: "25px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <h3>Profile Information</h3>
          <p style={{ marginTop: "6px", color: "#555" }}>Name, Date of Birth, Gender</p>
        </div>

        {/* VALIDITY */}
        <div style={{ marginTop: "25px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <h3>Consent Validity</h3>
          <p style={{ color: "#555" }}>Valid for 30 days from today</p>
        </div>

        {/* PURPOSE */}
        <div style={{ marginTop: "25px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <h3>Purpose</h3>
          <p style={{ color: "#555" }}>Identity verification for Secure Electronic Voting System</p>
        </div>

        <p style={{ marginTop: "30px", fontSize: "14px", color: "#555" }}>
          By clicking <strong>Allow</strong>, you consent to share the selected
          information with the voting portal for identity verification.
        </p>

        {error && (
          <p style={{ color: "red", fontSize: "13px", marginTop: "10px" }}>{error}</p>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "25px",
          gap: "12px"
        }}>
          <button
            style={{
              padding: "12px 28px", border: "1px solid #4a64f0", borderRadius: "8px",
              background: "#ffffff", color: "#4a64f0", fontWeight: "600",
              cursor: "pointer", fontSize: "15px", flex: "0 0 auto"
            }}
            onClick={() => navigate("/")}
          >
            Deny
          </button>

          <button
            style={{
              padding: "12px 28px", border: "none", borderRadius: "8px",
              background: loading ? "#a0a0a0" : "#4a64f0", color: "#ffffff",
              fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px", flex: "0 0 auto"
            }}
            onClick={handleAllow}
            disabled={loading}
          >
            {loading ? "Processing..." : "Allow"}
          </button>
        </div>

      </div>

    </div>
  );
}