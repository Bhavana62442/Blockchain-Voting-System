import React, { useState } from "react";
import "./css/VoteReciept.css";

const VoteReceipt = () => {
  // Sample vote hash (in real case, fetch from blockchain)
  const [voteHash, setVoteHash] = useState("0xA1B2C3D4E5F67890ABCDEF1234567890");
  const [flagged, setFlagged] = useState(false);
  const [revoteReason, setRevoteReason] = useState("");

  const handleFlagVote = () => {
    setFlagged(true);
    alert("Your vote has been flagged for blockchain verification.");
  };

  const handleRevoteRequest = () => {
    if (!revoteReason) {
      alert("Please select a reason for requesting a re-vote.");
      return;
    }
    alert(`Re-vote requested successfully. Reason: ${revoteReason}`);
  };

  return (
    <div className="vote-receipt-page">
      <h1>Vote Receipt / Blockchain Verification</h1>

      <section className="vote-hash-section">
        <h2>Your Vote Hash</h2>
        <p className="vote-hash">{voteHash}</p>
        <p>
          Compare this hash with the blockchain record to verify your vote integrity.
        </p>
      </section>

      <section className="vote-actions">
        <button className="flag-vote-btn" onClick={handleFlagVote}>
          Flag Vote
        </button>

        <div className="request-revote">
          <label htmlFor="revote-reason">Request Re-vote:</label>
          <select
            id="revote-reason"
            value={revoteReason}
            onChange={(e) => setRevoteReason(e.target.value)}
          >
            <option value="">Select Reason</option>
            <option value="mistake">Voted for wrong candidate</option>
            <option value="technical">Technical issue during voting</option>
            <option value="other">Other</option>
          </select>
          <button onClick={handleRevoteRequest}>Submit Re-vote Request</button>
        </div>

        {flagged && (
          <p className="flagged-msg">
            Your vote has been flagged for blockchain verification.
          </p>
        )}
      </section>
    </div>
  );
};

export default VoteReceipt;
