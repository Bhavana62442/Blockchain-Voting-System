import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RedactVote() {

  const navigate = useNavigate();

  const [hash,setHash] = useState("");
  const [issueType,setIssueType] = useState("");
  const [details,setDetails] = useState("");

  const submitComplaint = () => {

    if(!hash || !issueType || !details){
      alert("Please complete all required fields.");
      return;
    }

    const complaint = {
      hash,
      issueType,
      details,
      status: "Pending Level 1 Review",
      submittedAt: new Date().toLocaleString()
    };

    localStorage.setItem("redactComplaint", JSON.stringify(complaint));

    alert("Complaint submitted to Level 1 Election Officer.");

    navigate("/ledger");
  };

  return (

    <div className="complaint-page">

      <h1>Vote Redaction Complaint</h1>

      <p className="complaint-note">
        If your vote cannot be found in the public ledger or appears incorrect,
        you may submit a redaction request. Your request will be reviewed by
        election officers.
      </p>

      <div className="complaint-grid">

        <div className="form-group">
          <label>Transaction Hash</label>
          <input
            type="text"
            placeholder="Enter vote transaction hash"
            value={hash}
            onChange={(e)=>setHash(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Issue Type</label>
          <select
            value={issueType}
            onChange={(e)=>setIssueType(e.target.value)}
          >
            <option value="">Select issue</option>
            <option>Vote not found in ledger</option>
            <option>Incorrect vote recorded</option>
            <option>Hash mismatch</option>
            <option>Other issue</option>
          </select>
        </div>

      </div>

      <div className="form-group">
        <label>Detailed Explanation</label>

        <textarea
          rows="5"
          placeholder="Provide a detailed explanation of the issue..."
          value={details}
          onChange={(e)=>setDetails(e.target.value)}
        />
      </div>

      <div className="complaint-actions">

        <button
          className="submit-btn"
          onClick={submitComplaint}
        >
          Submit Complaint
        </button>

        <button
          className="cancel-btn"
          onClick={()=>navigate("/ledger")}
        >
          Cancel
        </button>

      </div>

    </div>
  );
}