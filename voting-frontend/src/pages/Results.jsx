import { useEffect, useState } from "react";
import SideMenu from "../components/SideMenu";

const API = "http://localhost:3001";

// Candidate display names mapped from chaincode IDs
const CANDIDATE_NAMES = {
  "CANDIDATE_A": "Arjun Rao",
  "CANDIDATE_B": "Meera Nair",
  "CANDIDATE_C": "Rakesh Singh"
};

const TOTAL_ELIGIBLE = 500;

export default function Results() {

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [results,    setResults]    = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const published = localStorage.getItem("resultsPublished") === "true";

  useEffect(() => {
    if (published) fetchResults();
    else setLoading(false);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      // Her API → TallyVotes / GetResults chaincode
      const res  = await fetch(`${API}/api/results/Karnataka`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.perCandidate || {});
        setTotalVotes(data.totalVotes || 0);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback simulated
      setResults({ CANDIDATE_A: 120, CANDIDATE_B: 100, CANDIDATE_C: 81 });
      setTotalVotes(301);
      setError("Blockchain API offline — showing demo data");
    }
    setLoading(false);
  };

  const turnout = TOTAL_ELIGIBLE > 0
    ? ((totalVotes / TOTAL_ELIGIBLE) * 100).toFixed(1)
    : "0.0";

  const winner = Object.keys(results).length > 0
    ? Object.entries(results).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : null;

  return (
    <div className="results-page">

      <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="results-container">

        <h1>Election Results</h1>

        <div className="results-stats">
          <div className="stat-card">
            <h3>Total Eligible Voters</h3>
            <p>{TOTAL_ELIGIBLE}</p>
          </div>
          <div className="stat-card">
            <h3>Votes Cast</h3>
            <p>{totalVotes}</p>
          </div>
          <div className="stat-card">
            <h3>Turnout</h3>
            <p>{turnout}%</p>
          </div>
        </div>

        {!published ? (
          <div className="results-hidden">
            <h2>Results Not Yet Published</h2>
            <p>Election results will be available once officially released by the Election Authority.</p>
          </div>
        ) : loading ? (
          <p>Loading results from blockchain...</p>
        ) : (
          <>
            {error && (
              <p style={{ color: "#e67e22", fontSize: "13px", marginBottom: "10px" }}>⚠ {error}</p>
            )}

            <h2>Candidate Results</h2>

            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([id, count]) => (
                  <tr key={id}>
                    <td>{CANDIDATE_NAMES[id] || id}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {winner && (
              <div className="winner-box">
                <h3>Declared Winner</h3>
                <h2>{CANDIDATE_NAMES[winner] || winner}</h2>
                <p>has secured the highest number of votes in the constituency.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
