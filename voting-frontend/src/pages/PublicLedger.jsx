import { useEffect, useState } from "react";

export default function PublicLedger() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  async function fetchLedger() {
    try {
      const res = await fetch("http://localhost:3000/api/votes");
      const data = await res.json();
      setVotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ledger fetch failed:", err);
      setVotes([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gov-page">

      {/* TOP BAR */}
      <div className="gov-topbar">
        Government of India | Election Commission of India
      </div>

      {/* HEADER */}
      <header className="gov-header">
        <div className="gov-header-left">
          <img src="/images/eci-logo.png" alt="ECI" />
          <div>
            <h1>Public Election Ledger</h1>
            <span>Blockchain-backed vote transparency</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="gov-section">

        <h2 className="gov-section-title">Anonymized Vote Records</h2>

        <p className="gov-instruction">
          This ledger displays anonymized blockchain transactions representing
          votes recorded during the election. No personally identifiable voter
          information is stored or displayed.
        </p>

        {/* SUMMARY STRIP */}
        <div className="ledger-summary">
          <div>
            <strong>Total Votes</strong>
            <span>{loading ? "—" : votes.length}</span>
          </div>
          <div>
            <strong>Ledger Status</strong>
            <span>{loading ? "—" : "Available"}</span>
          </div>
        </div>

        {/* LEDGER LIST */}
        {loading && <p className="gov-text">Loading public ledger…</p>}

        {!loading && votes.length === 0 && (
          <p className="gov-text">
            No vote records are available at this time.
          </p>
        )}

        <div className="ledger-list">
          {votes.map((v, i) => (
            <div className="ledger-card" key={i}>
              <div className="ledger-row">
                <span>Transaction</span>
                <code>{v.hash ? v.hash.slice(0, 16) + "…" : "—"}</code>
              </div>
              <div className="ledger-row">
                <span>Candidate</span>
                <strong>{v.candidate || "—"}</strong>
              </div>
              <div className="ledger-row">
                <span>Status</span>
                <strong className="ledger-status confirmed">Recorded</strong>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="gov-footer">
        © 2026 Election Commission of India
      </footer>
    </div>
  );
}
