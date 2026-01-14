import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VoteStatus() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (seconds === 0) {
      setLocked(true);
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  return (
    <div className="status-page">

      {!locked ? (
        <div className="status-card">

          <h1 className="status-title">Vote Submitted</h1>

          <p className="status-sub">
            Your vote has been successfully submitted.
          </p>

          {/* TIMER */}
          <div className="timer-circle">
            {seconds}
          </div>

          <p className="grace-text">
            You may change your vote during the grace period.
          </p>

          <button
            className="secondary-btn"
            onClick={() => navigate("/vote")}
          >
            Change Vote
          </button>

        </div>
      ) : (
        <div className="status-card success">

          {/* SUCCESS ANIMATION */}
          <div className="tick-circle">
            <svg
              width="56"
              height="56"
              viewBox="0 0 52 52"
              className="checkmark"
            >
              <path
                fill="none"
                stroke="#fff"
                strokeWidth="5"
                d="M14 27l7 7 17-17"
              />
            </svg>
          </div>

          <h1 className="status-title">Vote Recorded</h1>

          <p className="status-sub">
            Your vote has been securely recorded on the system.
          </p>

          <p className="thank-you">
            Thank you for participating in the democratic process.
          </p>

          {/* CONFETTI */}
          <div className="confetti"></div>

          <button
            className="primary-btn"
            onClick={() => navigate("/results")}
          >
            View Results (When Announced)
          </button>

        </div>
      )}

    </div>
  );
}
