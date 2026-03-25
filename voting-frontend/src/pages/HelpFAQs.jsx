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

        <div className="faq-container">

          <details className="faq-item">
            <summary>Is my vote secure?</summary>
            <p>
              Yes. Votes are recorded on a blockchain-based ledger using
              cryptographic hashing techniques to ensure integrity and
              tamper resistance.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I change my vote after submission?</summary>
            <p>
              A limited grace period is provided immediately after voting.
              Once the grace period expires, the vote is finalized.
            </p>
          </details>

          <details className="faq-item">
            <summary>Is my identity visible to anyone?</summary>
            <p>
              No. Voter identities are masked and are not exposed to
              administrators, audit teams, or the public.
            </p>
          </details>

          <details className="faq-item">
            <summary>When will election results be published?</summary>
            <p>
              Results are published only after verification and official
              declaration by the election administrator.
            </p>
          </details>

          <details className="faq-item">
            <summary>Who can access audit information?</summary>
            <p>
              Authorized audit teams can view hashed vote records to verify
              integrity without accessing voter identities.
            </p>
          </details>

          <details className="faq-item">
            <summary>Whom should I contact for issues?</summary>
            <p>
              This is an academic prototype. For any technical issues,
              please contact the system administrator or project team.
            </p>
          </details>

        </div>

      </main>

      <footer className="gov-footer">
        © 2026 Election Commission of India
      </footer>

    </div>
  );
}