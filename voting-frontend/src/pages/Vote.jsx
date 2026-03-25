import { useState } from "react";
import { useNavigate } from "react-router-dom";

const candidates = [
  {
    name: "Arjun Rao",
    party: "Democratic Alliance",
    photo: "/images/male.png"
  },
  {
    name: "Meera Nair",
    party: "National Reform Party",
    photo: "/images/female.png"
  },
  {
    name: "Rakesh Singh",
    party: "People's Development Front",
    photo: "/images/male.png"
  }
];

export default function Vote() {

  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const submitVote = () => {

    if (selected === null) {
      alert("Please select a candidate.");
      return;
    }

    const voteData = {
  candidate: candidates[selected].name,
  timestamp: new Date().toLocaleString(),
  hash: "0x" + Math.random().toString(16).substring(2, 66)
};
    localStorage.setItem("voteReceipt", JSON.stringify(voteData));

    navigate("/vote-status");
  };

  return (
    <div className="vote-page">

      <h1 className="page-title">Secure Electronic Voting Portal</h1>

      {/* INFO PANELS */}
      <div className="top-info">

        <div className="info-panel">
          <h3>Voter Information</h3>

          <div className="info-row">
            <span>Voter ID</span>
            <span>******6789</span>
          </div>

          <div className="info-row">
            <span>Constituency</span>
            <span>Bangalore South</span>
          </div>

          <div className="info-row">
            <span>Region</span>
            <span>South District</span>
          </div>
        </div>

        <div className="info-panel">
          <h3>Election Details</h3>

          <div className="info-row">
            <span>Election</span>
            <span>Legislative Assembly Election</span>
          </div>

          <div className="info-row">
            <span>Voting Window</span>
            <span>08:00 – 18:00</span>
          </div>

          <div className="info-row">
            <span>Election Category</span>
            <span>Government & State</span>
          </div>
        </div>

      </div>

      {/* CANDIDATES */}
      <div className="candidate-section">

        <h2>Select Candidate</h2>

        {candidates.map((c, index) => (
          <label key={index} className="candidate-row">

            <input
              type="radio"
              name="candidate"
              checked={selected === index}
              onChange={() => setSelected(index)}
            />

            <img src={c.photo} alt={c.name} />

            <div className="candidate-info">
              <strong>{c.name}</strong>
              <span>{c.party}</span>
            </div>

          </label>
        ))}

      </div>

      <button
        type="button"
        className="vote-submit-btn"
        onClick={submitVote}
      >
        Submit Vote
      </button>

    </div>
  );
}