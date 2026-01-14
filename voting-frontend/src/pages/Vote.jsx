import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const candidates = [
  {
    id: "C1",
    name: "Arjun Rao",
    party: "Progress Party",
    region: "South District",
    agenda: "Education reform, healthcare access"
  },
  {
    id: "C2",
    name: "Meera Iyer",
    party: "National Front",
    region: "South District",
    agenda: "Economic stability, women empowerment"
  },
  {
    id: "C3",
    name: "Ravi Singh",
    party: "People’s Alliance",
    region: "South District",
    agenda: "Employment generation, rural development"
  },
  {
    id: "C4",
    name: "Neha Verma",
    party: "Unity Party",
    region: "South District",
    agenda: "Infrastructure growth, digital governance"
  },
  {
    id: "C5",
    name: "Karan Malhotra",
    party: "Democratic Voice",
    region: "South District",
    agenda: "Anti-corruption, transparency reforms"
  }
];

export default function Vote() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const confirmVote = async () => {
    if (!selected) return;

    try {
      await axios.post("http://localhost:3000/api/votes", {
        voterId: "VOTER123",
        candidate: selected.name,
        aadhaar: "XXXX-XXXX-XXXX"
      });

      navigate("/vote-status", { state: { candidate: selected } });
    } catch {
      alert("Vote submission failed (backend not running).");
    }
  };

  return (
    <>
      {/* ===== FULL WIDTH BANNER ===== */}
      <section className="vote-banner">
        <div className="vote-banner-text">
          <h1>GENERAL ASSEMBLY ELECTION, 2026</h1>
          <p>Official Electronic Voting Portal</p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <main className="vote-page">
        <h2 className="vote-title">Cast Your Vote</h2>

        <div className="candidate-list">
          {candidates.map((c) => {
            const isSelected = selected?.id === c.id;

            return (
              <div
                key={c.id}
                className={`candidate-row ${isSelected ? "selected" : ""}`}
                onClick={() => setSelected(isSelected ? null : c)}
              >
                <label className="candidate-main">
                  <input
                    type="radio"
                    checked={isSelected}
                    readOnly
                  />
                  <strong>{c.name}</strong>
                  <span> — {c.party}</span>
                </label>

                {isSelected && (
                  <div className="candidate-details">
                    <p><strong>Region:</strong> {c.region}</p>
                    <p><strong>Agenda:</strong> {c.agenda}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="confirm-container">
          <button
            className="confirm-btn"
            disabled={!selected}
            onClick={confirmVote}
          >
            Confirm Vote
          </button>
        </div>
      </main>
    </>
  );
}
