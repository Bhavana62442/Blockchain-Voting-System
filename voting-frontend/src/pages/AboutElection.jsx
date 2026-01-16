export default function AboutElection() {
  return (
    <div className="gov-page">

      {/* TOP BAR */}
      <div className="gov-topbar">
        Government of India | Election Commission of India
      </div>

      {/* HEADER */}
      <header className="gov-header">
        <div className="gov-header-left">
          <img src="/images/eci-logo.png" alt="Election Commission of India" />
          <div>
            <h1>Election Commission of India</h1>
            <span>General Assembly Election – 2026</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="gov-section">

        <h2 className="gov-section-title">About the Election</h2>

        <p className="gov-text">
          The General Assembly Election – 2026 is conducted under the
          constitutional mandate of the Election Commission of India to ensure
          free, fair, and transparent elections across the country.
        </p>

        <p className="gov-text">
          This platform is an academic prototype that demonstrates the use of
          blockchain technology in electronic voting systems to enhance trust,
          integrity, and public auditability while preserving voter anonymity.
        </p>

        <h3>Objectives of the Election</h3>
        <ul className="gov-list">
          <li>Ensure one person, one vote</li>
          <li>Prevent vote manipulation and tampering</li>
          <li>Provide transparency through a public ledger</li>
          <li>Maintain strict voter privacy</li>
        </ul>

        <h3>About This Voting System</h3>
        <p className="gov-text">
          Votes cast through this system are recorded on a distributed
          blockchain ledger. Each vote is cryptographically secured and can be
          publicly verified without exposing any personal voter information.
        </p>

        <h3>Disclaimer</h3>
        <p className="gov-text">
          This system is developed strictly for academic and research purposes
          and does not represent an official deployment by the Election
          Commission of India.
        </p>

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
