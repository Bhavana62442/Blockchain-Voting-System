import { useEffect, useState } from "react";

export default function Results() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const resultsPublished =
    localStorage.getItem("resultsPublished") === "true";

  useEffect(() => {
    if (!resultsPublished) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:3000/api/votes")
      .then((res) => res.json())
      .then((data) => {
        setVotes(data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load election results.");
        setLoading(false);
      });
  }, [resultsPublished]);

  /* ---- normalize votes ---- */
  const normalizeVote = (v) => {
    if (v.Record) {
      return v.Record.redacted ? null : v.Record.candidate;
    }
    return v.redacted ? null : v.candidate;
  };

  /* ---- compute results ---- */
  const resultMap = {};
  votes.forEach((v) => {
    const candidate = normalizeVote(v);
    if (candidate) {
      resultMap[candidate] = (resultMap[candidate] || 0) + 1;
    }
  });

  const results = Object.keys(resultMap).map((k) => ({
    candidate: k,
    votes: resultMap[k],
  }));

  const winner =
    results.length > 0
      ? results.reduce((a, b) => (b.votes > a.votes ? b : a))
      : null;

  return (
    <div className="results-page">

      {/* TOP BAR */}
      <div className="gov-topbar">
        Government of India | Election Commission of India
      </div>

      {/* HEADER */}
      <header className="gov-header">
        <div className="gov-header-left">
          <img src="/images/eci-logo.png" alt="ECI Logo" />
          <div>
            <h1>Election Commission of India</h1>
            <span>General Assembly Election – 2026</span>
          </div>
        </div>
      </header>

      <main className="results-container">

        {/* RESULTS NOT PUBLISHED */}
        {!resultsPublished && (
          <>
            <h2>Election Results</h2>
            <p className="results-note">
              Election results have not yet been published.
              Please check back after the official declaration.
            </p>
          </>
        )}

        {/* LOADING */}
        {resultsPublished && loading && (
          <p>Loading election results…</p>
        )}

        {/* ERROR */}
        {resultsPublished && error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {/* RESULTS */}
        {resultsPublished && !loading && !error && (
          <>
            <h2>Election Results Declared</h2>

            <p className="results-note">
              The results below are final and have been published
              by the Election Administrator.
            </p>

            {/* RESULTS TABLE */}
            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Total Votes</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.candidate}</td>
                    <td>{r.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* WINNER */}
            {winner && (
              <div className="winner-box">
                <strong>Declared Winner:</strong> {winner.candidate}  
                <br />
                <span>Total Votes: {winner.votes}</span>
              </div>
            )}
          </>
        )}

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
