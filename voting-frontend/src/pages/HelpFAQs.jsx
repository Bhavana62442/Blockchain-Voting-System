export default function HelpFAQs() {
  return (
    <div className="gov-page">
      <div className="gov-topbar">
        Government of India | Election Commission of India
      </div>

      <header className="gov-header">
        <div className="gov-header-left">
          <img src="/images/eci-logo.png" alt="ECI Logo" />
          <div>
            <h1>Election Commission of India</h1>
            <span>Help & Frequently Asked Questions</span>
          </div>
        </div>
      </header>

      <main className="gov-content">
        <h2>Help & FAQs</h2>

        <h3>Is my vote secure?</h3>
        <p>
          Yes. Votes are recorded on a blockchain-based ledger using
          cryptographic hashing techniques to ensure integrity and
          tamper resistance.
        </p>

        <h3>Can I change my vote after submission?</h3>
        <p>
          A limited grace period is provided immediately after voting.
          Once the grace period expires, the vote is finalized.
        </p>

        <h3>Is my identity visible to anyone?</h3>
        <p>
          No. Voter identities are masked and are not exposed to
          administrators, audit teams, or the public.
        </p>

        <h3>When will election results be published?</h3>
        <p>
          Results are published only after verification and official
          declaration by the election administrator.
        </p>

        <h3>Who can access audit information?</h3>
        <p>
          Authorized audit teams can view hashed vote records to verify
          integrity without accessing voter identities.
        </p>

        <h3>Whom should I contact for issues?</h3>
        <p>
          This is an academic prototype. For any technical issues,
          please contact the system administrator or project team.
        </p>
      </main>

      <footer className="gov-footer">
        © 2026 Election Commission of India
      </footer>
    </div>
  );
}
