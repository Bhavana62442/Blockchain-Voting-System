import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotes();
  }, []);

  async function fetchVotes() {
    try {
      const res = await fetch("http://localhost:3000/api/votes");
      const data = await res.json();
      setVotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch votes:", err);
      setVotes([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-layout">

      {/* ================= SIDEBAR ================= */}
      <aside className="admin-sidebar">
        <h2 className="admin-title">Election Admin Panel</h2>

        <ul className="admin-menu">
          <li className={active === "overview" ? "active" : ""} onClick={() => setActive("overview")}>
            Dashboard Overview
          </li>
          <li className={active === "ledger" ? "active" : ""} onClick={() => setActive("ledger")}>
            Votes Ledger
          </li>
          <li className={active === "results" ? "active" : ""} onClick={() => setActive("results")}>
            Results
          </li>
        </ul>

        <button className="admin-logout" onClick={() => navigate("/")}>
          Logout
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="admin-main">

        {/* ================= OVERVIEW ================= */}
        {active === "overview" && (
          <>
            <h1 className="admin-heading">Dashboard Overview</h1>

            <div className="admin-cards">
              <div className="admin-card">
                <h4>Total Votes Recorded</h4>
                <p>{loading ? "—" : votes.length}</p>
              </div>

              <div className="admin-card">
                <h4>Ledger Status</h4>
                <p>{loading ? "—" : "Connected"}</p>
              </div>

              <div className="admin-card">
                <h4>Results Published</h4>
                <p>—</p>
              </div>

              <div className="admin-card">
                <h4>Redactions</h4>
                <p>—</p>
              </div>
            </div>

            <div className="admin-panel">
              <h3>System Note</h3>
              <p className="admin-text">
                All metrics shown here are fetched from the blockchain ledger in real time.
                Placeholder values are displayed if data is unavailable.
              </p>
            </div>
          </>
        )}

        {/* ================= LEDGER ================= */}
        {active === "ledger" && (
          <>
            <h1 className="admin-heading">Votes Ledger</h1>

            <p className="admin-text">
              Publicly verifiable, anonymized vote transactions recorded on the blockchain.
            </p>

            {loading && <p>Loading ledger…</p>}

            {!loading && votes.length === 0 && (
              <p className="admin-text">No vote records available.</p>
            )}

            <div className="ledger-list">
              {votes.map((v, i) => (
                <div className="ledger-card" key={i}>
                  <div className="ledger-row">
                    <span>Vote ID</span>
                    <code>{v.voterId || "—"}</code>
                  </div>
                  <div className="ledger-row">
                    <span>Candidate</span>
                    <strong>{v.candidate || "—"}</strong>
                  </div>
                  <div className="ledger-row">
                    <span>Hash</span>
                    <code>{v.hash ? v.hash.slice(0, 12) + "…" : "—"}</code>
                  </div>
                  <div className="ledger-row">
                    <span>Status</span>
                    <strong className="ledger-status confirmed">Recorded</strong>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= RESULTS ================= */}
        {active === "results" && (
          <>
            <h1 className="admin-heading">Election Results</h1>

            <p className="admin-text">
              Results are derived from the blockchain ledger and published by the administrator.
            </p>

            {votes.length === 0 ? (
              <p className="admin-text">Results unavailable until votes are recorded.</p>
            ) : (
              <ResultsSummary votes={votes} />
            )}
          </>
        )}

      </main>
    </div>
  );
}

/* ================= RESULTS SUMMARY ================= */

function ResultsSummary({ votes }) {
  const counts = {};

  votes.forEach(v => {
    counts[v.candidate] = (counts[v.candidate] || 0) + 1;
  });

  const max = Math.max(...Object.values(counts));

  return (
    <div className="results-bars">
      {Object.entries(counts).map(([candidate, count]) => (
        <div key={candidate} className="result-row">
          <span>{candidate}</span>
          <div className="result-bar">
            <div
              className="result-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}
