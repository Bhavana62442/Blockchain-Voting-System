import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/vote");
  };

  return (
    <div className="login-centered-page">

      {/* TOP BAR */}
      <div className="gov-topbar">
        Government of India | Election Commission of India
      </div>

      {/* HEADER */}
      <header className="gov-header">
        <div className="gov-header-left">
          <img src="/images/eci-logo.png" alt="ECI Logo" />
          <div>
            <h1>Election Commission of India</h1>
            <span>Voter Authentication Portal</span>
          </div>
        </div>
      </header>

      {/* LOGIN CARD */}
      <main className="login-center-wrapper">
        <div className="login-card-gov">

          <img
            src="/images/eci-logo.png"
            alt="ECI Logo"
            className="login-logo"
          />

          <h2>Voter Login</h2>
          <p className="login-subtext">
            Authenticate your identity to continue to the voting process.
          </p>

          <form onSubmit={handleLogin} className="login-form">

            <label>Authentication Method</label>
            <select required>
              <option value="">Select Login Method</option>
              <option>DigiLocker</option>
              <option>Aadhaar (OTP Based)</option>
              <option>Voter ID</option>
            </select>

            <label>Registered Mobile / ID Number</label>
            <input
              type="text"
              placeholder="Enter Aadhaar / Voter ID / Mobile Number"
              required
            />

            <button type="submit" className="primary-btn login-submit">
              Verify & Continue
            </button>

          </form>

          <p className="login-disclaimer">
            This authentication process is simulated for academic
            and research purposes only.
          </p>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="gov-footer">
        © 2026 Election Commission of India  
        <br />
        Academic & Research Prototype
      </footer>

    </div>
  );
}
