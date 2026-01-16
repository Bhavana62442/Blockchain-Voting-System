import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Vote() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const voterId = localStorage.getItem("voterId") || "VOTER123";
  const aadhaar = localStorage.getItem("aadhaar") || "XXXX-XXXX";

  const candidates = [
    {
      id: "Candidate A",
      name: "Candidate A",
      party: "National Progressive Party",
      image: "/images/male.png",
    },
    {
      id: "Candidate B",
      name: "Candidate B",
      party: "People’s Democratic Front",
      image: "/images/female.png",
    },
    {
      id: "Candidate C",
      name: "Candidate C",
      party: "United Reform Alliance",
      image: "/images/male.png",
    },
  ];

  async function handleSubmit() {
    if (!selected) {
      alert("Please select one candidate.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId,
          candidate: selected,
          aadhaar,
        }),
      });

      if (!res.ok) throw new Error();

      navigate("/vote-status", { state: { voterId } });
    } catch {
      alert("Vote submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="gov-page">
      <div className="vote-container">
        <h2 className="gov-section-title">Cast Your Vote</h2>

        <p className="gov-instruction">
          Select <strong>one candidate</strong>. Your vote will be securely
          recorded and cannot be modified once finalized.
        </p>

        {candidates.map((c) => (
          <div
            key={c.id}
            className={`vote-card ${
              selected === c.id ? "selected" : ""
            }`}
            onClick={() => setSelected(c.id)}
          >
            <img
              src={c.image}
              alt={c.name}
              className="vote-photo"
            />

            <div className="vote-info">
              <h4>{c.name}</h4>
              <p>{c.party}</p>
            </div>
          </div>
        ))}

        <button
          className="primary-btn vote-submit"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting Vote..." : "Confirm & Submit Vote"}
        </button>

        <p className="gov-text subtle-note">
          Voting is confidential. This system follows official election
          procedures.
        </p>
      </div>
    </div>
  );
}
