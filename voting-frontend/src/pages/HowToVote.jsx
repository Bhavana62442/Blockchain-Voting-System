export default function HowToVote() {
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
            <span>General Assembly Election – 2026</span>
          </div>
        </div>
      </header>

      <main className="gov-content">
        <h2>How to Vote</h2>

        <p>
          Voters are requested to carefully follow the instructions
          below to successfully cast their vote.
        </p>

        <h3>Step 1: Voter Authentication</h3>
        <p>
          Login using one of the supported identification methods:
        </p>
        <ul>
          <li>Voter ID</li>
          <li>Aadhaar (OTP based verification)</li>
          <li>DigiLocker</li>
        </ul>

        <h3>Step 2: Cast Your Vote</h3>
        <p>
          Select one candidate from the list displayed on the ballot
          screen. Only one selection is permitted.
        </p>

        <h3>Step 3: Confirmation & Grace Period</h3>
        <p>
          After submitting your vote, a short grace period is provided
          during which you may revise your selection if required.
        </p>

        <h3>Step 4: Vote Finalization</h3>
        <p>
          Once the grace period ends, the vote is permanently recorded
          on the blockchain ledger and cannot be modified.
        </p>

        <p>
          Voters are advised to verify their selection carefully before
          final submission.
        </p>
      </main>

      <footer className="gov-footer">
        © 2026 Election Commission of India
      </footer>
    </div>
  );
}
