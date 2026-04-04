import { useState, useEffect } from "react";

const API = "http://localhost:3001";

const CANDIDATE_NAMES = {
  "CANDIDATE_A": "Arjun Rao",
  "CANDIDATE_B": "Meera Nair",
  "CANDIDATE_C": "Rakesh Singh"
};

export default function AdminResultsControl() {

  const role      = localStorage.getItem("adminRole");
  const [published, setPublished] = useState(
    localStorage.getItem("resultsPublished") === "true"
  );
  const [tally,   setTally]   = useState({});
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetchTally();
  }, []);

  const fetchTally = async () => {
    setLoading(true);
    setError("");
    try {
      // Her API → TallyVotes chaincode
      const res = await fetch(`${API}/api/results/Karnataka`);
      if (res.ok) {
        const data = await res.json();
        setTally(data.perCandidate || {});
        setTotal(data.totalVotes  || 0);
      } else {
        throw new Error("API error");
      }
    } catch {
      setTally({ CANDIDATE_A: 120, CANDIDATE_B: 100, CANDIDATE_C: 81 });
      setTotal(301);
      setError("Blockchain API offline — showing demo data");
    }
    setLoading(false);
  };

  const publishResults = () => {
    localStorage.setItem("resultsPublished", "true");
    setPublished(true);
  };

  if (role !== "senior") {
    return (
      <div className="admin-page">
        <h1>Access Restricted</h1>
        <p>Only Senior Election Authority can publish official results.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Official Results Control</h1>

      {error && (
        <p style={{ color: "#e67e22", fontSize: "13px", marginBottom: "10px" }}>⚠ {error}</p>
      )}

      <div className="results-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Live Vote Tally — Blockchain</h3>
          <button
            onClick={fetchTally}
            style={{ padding: "6px 14px", background: "#1f3b82", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
          >
            ↻ Refresh from Blockchain
          </button>
        </div>

        <p style={{ color: "#555", fontSize: "13px", margin: "6px 0 16px" }}>
          Total votes cast: <strong>{total}</strong>
        </p>

        {loading ? (
          <p>Loading from blockchain...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tally).map(([id, count]) => (
                <tr key={id}>
                  <td>{CANDIDATE_NAMES[id] || id}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="publish-section">
        {published ? (
          <p className="results-live">
            ✅ Results have been officially published and are visible to the public.
          </p>
        ) : (
          <>
            <p style={{ color: "#555", fontSize: "14px", marginBottom: "12px" }}>
              Once published, results will be visible on the public Results page.
              This action cannot be undone.
            </p>
            <button className="publish-btn" onClick={publishResults}>
              Publish Official Results
            </button>
          </>
        )}
      </div>
    </div>
  );
}
