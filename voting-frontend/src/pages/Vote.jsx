import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const candidates = [
  { id: "CANDIDATE_A", name: "Arjun Rao",    party: "Democratic Alliance",        photo: "/images/male.png"   },
  { id: "CANDIDATE_B", name: "Meera Nair",   party: "National Reform Party",      photo: "/images/female.png" },
  { id: "CANDIDATE_C", name: "Rakesh Singh", party: "People's Development Front", photo: "/images/male.png"   }
];

export default function Vote() {

  const navigate  = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Real phone from login — show last 4 digits only
  const phone         = localStorage.getItem("authPhone") || "";
  const maskedVoterID = phone.length >= 4 ? "XXXX-XXXX-" + phone.slice(-4) : "XXXX-XXXX-XXXX";

  // Token guard
  useEffect(() => {
    if (!localStorage.getItem("votingToken")) {
      navigate("/auth");
    }
  }, [navigate]);

  const submitVote = async () => {
    if (selected === null) {
      alert("Please select a candidate before submitting.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token       = localStorage.getItem("votingToken");
      const randomnessR = localStorage.getItem("signature");
      const candidateID = candidates[selected].id;

      // Call her Fabric Gateway API → CastVote chaincode
      const res = await fetch("http://localhost:3001/api/vote/cast", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterHashID:  token,
          randomnessR,
          candidateID,
          constituency: "Karnataka"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Your vote has already been recorded on the blockchain.");
        }
        throw new Error(data.error || "Vote submission failed.");
      }

      localStorage.setItem("voteReceipt", JSON.stringify({
        candidate:  candidates[selected].name,
        party:      candidates[selected].party,
        timestamp:  new Date().toLocaleString(),
        txHash:     data.voteReceipt?.voteID || ("0x" + Math.random().toString(16).substring(2, 66))
      }));

      localStorage.removeItem("votingToken");
      localStorage.removeItem("signature");
      localStorage.removeItem("blindingFactor");

      navigate("/vote-status");

    } catch (err) {
      // Blockchain not connected yet — allow demo flow
      if (err.message.includes("fetch") || err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
        localStorage.setItem("voteReceipt", JSON.stringify({
          candidate:  candidates[selected].name,
          party:      candidates[selected].party,
          timestamp:  new Date().toLocaleString(),
          txHash:     "0x" + Math.random().toString(16).substring(2, 66)
        }));
        localStorage.removeItem("votingToken");
        localStorage.removeItem("signature");
        navigate("/vote-status");
        return;
      }
      setError(err.message);
      setLoading(false);
    }
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
            <span>{maskedVoterID}</span>
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

      {error && (
        <p style={{ color: "red", textAlign: "center", margin: "10px auto", maxWidth: "700px" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        className="vote-submit-btn"
        onClick={submitVote}
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Submitting..." : "Submit Vote"}
      </button>

    </div>
  );
}
