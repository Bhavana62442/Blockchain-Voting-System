import React, { useState } from "react";
import "./css/VoterLogin.css";

const VoterLogin = () => {
  const [agreed, setAgreed] = useState(false);
  const [authStep, setAuthStep] = useState(0); // 0 = not started, 1 = retrieving, 2 = confirmed, 3 = granted
  const [voterID, setVoterID] = useState("");

  const handleDigiLockerLogin = () => {
    setAuthStep(1); // start retrieving
    setTimeout(() => {
      const retrievedID = "VOTER123456"; // mock voter ID
      setVoterID(retrievedID);
      setAuthStep(2); // confirmed
      setTimeout(() => {
        setAuthStep(3); // access granted
        setTimeout(() => {
          alert("Redirecting to Voting Dashboard...");
           window.location.href = "/voting-dashboard"; // Uncomment for real redirect
        }, 1500);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="voter-login-page">
      <header className="header">
        <h1>Blockchain Voting System</h1>
        <p>Secure Voting Using DigiLocker Authentication</p>
      </header>

      <div className="login-main">
        <div className="login-container">
          <h2>Voter Login</h2>

          {authStep === 0 && (
            <>
              <div className="terms-box">
                <h3>Terms & Conditions</h3>
                <p>
                  By using DigiLocker authentication, you agree that your voter credentials will be
                  verified via the official DigiLocker system. Only eligible voters may participate.
                  All votes are confidential and secured on the blockchain.
                </p>
                <p>
                  Unauthorized access or misuse of this platform is strictly prohibited.
                  Attempting to vote multiple times or using fraudulent credentials may
                  result in disqualification and legal action.
                </p>
                <p>
                  By agreeing to these terms, you acknowledge that your identity will be verified
                  against official government records through DigiLocker. Any discrepancies may
                  result in denial of access.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of your DigiLocker
                  credentials. Do not share your login details with anyone. The system cannot
                  be held liable for unauthorized access resulting from compromised accounts.
                </p>
                <p>
                  All data collected during the authentication and voting process will be stored
                  securely and used solely for election purposes. No personal information will
                  be shared with third parties without your explicit consent.
                </p>
                <p>
                  In case of any issues during authentication, you must contact the official
                  support channels. The voting system administrators reserve the right to
                  update or modify these terms at any time.
                </p>
                <p>
                  Not registered on DigiLocker?{" "}
                  <a
                    href="https://digilocker.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Register here
                  </a>
                </p>
              </div>

              <div className="agree-box">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                />
                <label htmlFor="agree">
                  I have read and agree to the Terms & Conditions
                </label>
              </div>

              <button
                className="digilocker-btn"
                disabled={!agreed}
                onClick={handleDigiLockerLogin}
              >
                Authenticate with DigiLocker
              </button>
            </>
          )}

          {authStep > 0 && (
            <div className="auth-flow">
              <h3>DigiLocker Authentication</h3>
              {authStep >= 1 && <p>Retrieving your Voter ID...</p>}
              {authStep >= 2 && <p>Voter ID retrieved: {voterID}</p>}
              {authStep >= 2 && <p>Identity Confirmed</p>}
              {authStep >= 3 && (
                <p style={{ color: "#007700", fontWeight: "bold" }}>
                  Access Granted! Redirecting...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        © 2025 Blockchain Voting Prototype. All Rights Reserved.
      </footer>
    </div>
  );
};

export default VoterLogin;
