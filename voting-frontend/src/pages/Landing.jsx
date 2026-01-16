import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";

const banners = [
  "/images/parliament1.jpg",
  "/images/parliament2.jpg",
  "/images/election.jpg",
];

const candidates = [
  {
    name: "Arjun Rao",
    party: "Progress Party",
    img: "/images/male.png",
  },
  {
    name: "Meera Iyer",
    party: "National Front",
    img: "/images/female.png",
  },
  {
    name: "Ravi Singh",
    party: "People’s Alliance",
    img: "/images/male.png",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [resultsPublished, setResultsPublished] = useState(false);

  /* banner rotation */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* election status (temporary – backend ready) */
  useEffect(() => {
    const status = localStorage.getItem("resultsPublished");
    setResultsPublished(status === "true");
  }, []);

  return (
    <div className="gov-root">

      {/* SIDE MENU */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* TOP BAR */}
      <div className="gov-topbar">
        Government of India | Election Commission of India
      </div>

      {/* HEADER */}
      <header className="gov-header">
        <div className="gov-header-left">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
          <img src="/images/eci-logo.png" alt="ECI Logo" />
          <div>
            <h1>Election Commission of India</h1>
            <span>General Assembly Election – 2026</span>
          </div>
        </div>

        <nav className="gov-header-nav">
          <a href="/">Home</a>
          <a href="/login">Voter Login</a>
          <a href="/results">Results</a>
        </nav>
      </header>

      {/* HERO / BANNER */}
      <section className="gov-banner">
        {banners.map((img, index) => (
          <div
            key={index}
            className={`gov-banner-slide ${index === currentBanner ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="gov-banner-overlay">
          <div className="gov-banner-grid">
            <h2>Official Electronic Voting Portal</h2>
            <p>
              Secure, transparent and blockchain-based electronic voting
              system for the General Assembly Election, 2026.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate(resultsPublished ? "/results" : "/login")
              }
            >
              {resultsPublished ? "View Results" : "Cast Your Vote"}
            </button>
          </div>
        </div>
      </section>

      {/* VOTING FLOW */}
      <section className="gov-info-section">
        <h3 className="gov-section-title">Voting Process</h3>

        <div className="gov-info-grid">
          <div className="gov-info-card">
            <h4>Step 1</h4>
            <p>Authenticate using Voter ID, Aadhaar, or DigiLocker.</p>
          </div>

          <div className="gov-info-card">
            <h4>Step 2</h4>
            <p>Select one candidate and submit your vote.</p>
          </div>

          <div className="gov-info-card">
            <h4>Step 3</h4>
            <p>Vote is securely recorded on the blockchain.</p>
          </div>
        </div>
      </section>

      {/* CANDIDATE PREVIEW */}
      <section className="gov-section">
        <h3>Contestants – South District</h3>

        <div className="candidate-cards">
          {candidates.map((c, i) => (
            <div className="candidate-card-official" key={i}>
              <div className="candidate-photo-circle">
                <img src={c.img} alt={c.name} />
              </div>

              <div className="candidate-info">
                <h4>{c.name}</h4>
                <p className="party">{c.party}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT / WHY VOTING */}
      <section className="gov-section">
        <h3>About the Voting System</h3>
        <p>
          This electronic voting system is an academic prototype inspired
          by the Election Commission of India. It demonstrates how
          blockchain technology can be used to ensure transparency,
          integrity, and auditability of votes while preserving voter
          anonymity.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="gov-footer">
        © 2026 Election Commission of India  
        <br />
        Academic & Research Prototype
      </footer>

    </div>
  );
}
