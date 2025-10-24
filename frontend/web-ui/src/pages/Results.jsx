import React from "react";

const Results = () => {
  const results = [
    { candidate: "Alice", votes: 10 },
    { candidate: "Bob", votes: 7 },
    { candidate: "Charlie", votes: 5 },
  ]; // placeholder

  return (
    <div className="results-container">
      <h2>Election Results</h2>
      <ul>
        {results.map((r, idx) => (
          <li key={idx}>
            {r.candidate}: {r.votes} votes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
