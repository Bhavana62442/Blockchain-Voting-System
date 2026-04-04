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
          free, fair, and transparent democratic elections across the country.
          The Commission is responsible for administering the electoral process,
          maintaining the integrity of voting, and safeguarding the democratic
          rights of citizens.
        </p>

        <p className="gov-text">
          This platform represents an academic prototype designed to demonstrate
          how blockchain technology can be integrated into electronic voting
          systems to enhance transparency, security, and auditability while
          maintaining strict voter anonymity.
        </p>


        <h3>Objectives of the Election</h3>

        <ul className="gov-list">
          <li>Ensure the democratic principle of one person, one vote</li>
          <li>Prevent vote manipulation and unauthorized alterations</li>
          <li>Provide transparency through a publicly verifiable ledger</li>
          <li>Protect voter privacy and identity</li>
          <li>Strengthen trust in the digital voting process</li>
        </ul>


        <h3>About the Blockchain Voting System</h3>

        <p className="gov-text">
          In this system, votes are recorded on a distributed blockchain ledger.
          Each vote is converted into a cryptographic hash and securely stored,
          ensuring that it cannot be altered once recorded. This approach
          guarantees data integrity while enabling public verification without
          exposing any voter identity.
        </p>

        <p className="gov-text">
          After casting a vote, each voter receives a unique transaction hash
          which acts as a digital receipt. This hash can be used to verify that
          the vote has been successfully recorded in the public ledger without
          revealing which candidate the voter selected.
        </p>


        <h3>Key Features of the System</h3>

        <ul className="gov-list">
          <li>Secure voter authentication using DigiLocker</li>
          <li>Blockchain-based immutable vote recording</li>
          <li>Public ledger for transparent vote verification</li>
          <li>Cryptographic hashing to protect vote integrity</li>
          <li>Redaction request mechanism for dispute resolution</li>
        </ul>


        <h3>Disclaimer</h3>

        <p className="gov-text">
          This system is developed strictly for academic and research purposes
          as part of a prototype project. It is intended to demonstrate concepts
          related to secure electronic voting and blockchain technology and does
          not represent an official deployment by the Election Commission of
          India.
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