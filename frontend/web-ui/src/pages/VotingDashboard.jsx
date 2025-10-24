import React, { useState, useEffect } from "react";
import candidate1 from "../assets/logo192.png";
import candidate2 from "../assets/logo192.png";
import candidate3 from "../assets/logo192.png";
import candidate4 from "../assets/logo192.png";
import "./css/VotingDashboard.css";

const VotingDashboard = () => {
  const voterDetails = {
    voterID: "INDV123456789",
    name: "Rahul Sharma",
    constituency: "New Delhi Central",
    status: "Verified",
  };

  const elections = [
    {
      id: 1,
      name: "Delhi Assembly Election 2025",
      date: "2025-12-15",
      description:
        "State Assembly election for New Delhi constituencies. Make sure to vote responsibly.",
      candidates: [
        { id: 1, name: "Arvind Kumar", photo: candidate1, party: "BJP" },
        { id: 2, name: "Priya Singh", photo: candidate2, party: "INC" },
        { id: 3, name: "Manish Verma", photo: candidate3, party: "AAP" },
        { id: 4, name: "Neha Joshi", photo: candidate4, party: "Independent" },
      ],
    },
  ];

  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteConfirmed, setVoteConfirmed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [flagged, setFlagged] = useState(false);
  const [revoteReason, setRevoteReason] = useState("");

  useEffect(() => {
    let interval;
    if (voteConfirmed && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [voteConfirmed, timer]);

  const handleElectionSelect = (election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
    setVoteConfirmed(false);
    setFlagged(false);
    setRevoteReason("");
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleConfirmVote = () => {
    if (!selectedCandidate) return;
    setVoteConfirmed(true);
    setTimer(30);
  };

  const handleChangeVote = () => {
    setVoteConfirmed(false);
    setSelectedCandidate(null);
    setTimer(0);
    setFlagged(false);
    setRevoteReason("");
  };

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
    <div className="dashboard-page">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>India Blockchain Voting Portal</h1>
          <p style={{ color: "#ffffff" }}>Official Secure Voting Portal</p>
        </div>
        <div className="header-right">
          <p style={{ color: "#ffffff" }}><strong>Voter ID:</strong> {voterDetails.voterID}</p>
          <p style={{ color: "#ffffff" }}><strong>Name:</strong> {voterDetails.name}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Voter Info */}
        <section className="voter-info-section">
          <h2>Voter Information</h2>
          <div className="voter-info-line"><span>Name:</span> <span>{voterDetails.name}</span></div>
          <div className="voter-info-line"><span>Voter ID:</span> <span>{voterDetails.voterID}</span></div>
          <div className="voter-info-line"><span>Constituency:</span> <span>{voterDetails.constituency}</span></div>
          <div className="voter-info-line"><span>Status:</span> <span>{voterDetails.status}</span></div>
        </section>

        {/* Instructions */}
        <section className="instructions-section">
          <h2>Important Instructions</h2>
          <ul>
            <li>Ensure your voter details are correct before casting your vote.</li>
            <li>You can change your vote only within the countdown timer after confirmation.</li>
            <li>Votes are anonymous and securely recorded on blockchain.</li>
            <li>Do not share your voter ID or credentials with anyone.</li>
            <li>Participation in elections is your fundamental right under the Constitution of India.</li>
          </ul>
        </section>

        {/* Elections */}
        <section className="elections-section">
          <h2>Select an Election</h2>
          <div className="election-list">
            {elections.map((election) => (
              <div
                key={election.id}
                className={`election-line ${selectedElection?.id === election.id ? "selected" : ""}`}
                onClick={() => handleElectionSelect(election)}
              >
                <div className="election-name">{election.name}</div>
                <div className="election-date">Date: {election.date}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Candidate Selection */}
        {selectedElection && !voteConfirmed && (
          <section className="candidates-section">
            <h2>Choose a Candidate</h2>
            <div className="candidate-list">
              {selectedElection.candidates.map((c) => (
                <div
                  key={c.id}
                  className={`candidate-line ${selectedCandidate?.id === c.id ? "selected" : ""}`}
                  onClick={() => handleCandidateSelect(c)}
                >
                  <img src={c.photo} alt={c.name} className="candidate-photo"/>
                  <div className="candidate-info">
                    <span className="candidate-name">{c.name}</span>
                    <span className="candidate-party">{c.party}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="vote-btn" disabled={!selectedCandidate} onClick={handleConfirmVote}>
              Confirm Vote
            </button>
          </section>
        )}

        {/* Vote Confirmation */}
        {voteConfirmed && (
          <section className="vote-confirmation">
            <h2>Vote Confirmed 🇮🇳</h2>
            <p>You voted for <strong>{selectedCandidate.name}</strong> ({selectedCandidate.party}).</p>

            {timer > 0 ? (
              <p>Time remaining to change vote: <strong>{timer} seconds</strong></p>
            ) : (
              <p>Your vote is finalized. Thank you for participating in India's democratic process!</p>
            )}

            {timer > 0 && (
              <button className="change-vote-btn" onClick={handleChangeVote}>
                Change Vote
              </button>
            )}
          </section>
        )}

        {/* Floating Flag / Re-vote Actions */}
        {voteConfirmed && (
          <div className="vote-actions-floating">
            <button className="flag-vote-btn" onClick={handleFlagVote}>Flag Vote</button>

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

            {flagged && <p style={{ color: "#d9534f", marginTop: "10px" }}>Your vote has been flagged for review.</p>}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 India Blockchain Voting System. All Rights Reserved.</p>
        <p>Contact helpdesk@eci.gov.in for assistance</p>
      </footer>
    </div>
  );
};

export default VotingDashboard;
