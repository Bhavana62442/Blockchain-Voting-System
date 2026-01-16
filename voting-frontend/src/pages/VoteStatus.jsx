import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VoteStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const voterId = location.state?.voterId;

  const [vote, setVote] = useState(null);

  useEffect(() => {
    if (!voterId) {
      navigate("/");
      return;
    }

    fetch(`http://localhost:3000/api/votes/${voterId}`)
      .then((res) => res.json())
      .then((data) => setVote(data))
      .catch(() => setVote(null));
  }, [voterId, navigate]);

  return (
    <div className="gov-page">
      <div className="vote-status-box">
        <h2 className="gov-section-title">Vote Recorded</h2>

        <p className="gov-text">
          Your vote has been successfully recorded on the blockchain.
        </p>

        {vote && (
          <div className="vote-confirmation">
            <span>Selected Candidate</span>
            <strong>{vote.candidate}</strong>
          </div>
        )}

        <p className="vote-status-note">
          You may close this window or return to the home page.
        </p>

        <button
          className="primary-btn"
          onClick={() => navigate("/")}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
