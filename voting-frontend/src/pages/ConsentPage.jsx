import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ConsentPage() {

  const navigate = useNavigate();

  const [aadhaar, setAadhaar] = useState(true);
  const [voterId, setVoterId] = useState(true);
  const [dl, setDl] = useState(false);

  return (
    <div className="digi-page">

      {/* HEADER */}
      <header className="digi-header">
        <img src="/images/digilocker-logo.png" alt="DigiLocker" />
        <div>
          <h1>DigiLocker</h1>
          <span>Document Wallet to Empower Citizens</span>
        </div>
      </header>

      {/* CONSENT BOX */}
      <div
        style={{
          maxWidth: "700px",
          margin: "40px auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
        }}
      >

        <p style={{marginBottom:"20px",fontSize:"15px"}}>
          Please provide your consent to share the following with
          <strong> Secure Voting Portal</strong>:
        </p>

        {/* DOCUMENT SECTION */}
        <div style={{borderTop:"1px solid #eee",paddingTop:"20px"}}>

          <h3 style={{marginBottom:"12px"}}>Issued Documents</h3>

          <label style={{display:"block",marginBottom:"8px"}}>
            <input
              type="checkbox"
              checked={aadhaar}
              onChange={()=>setAadhaar(!aadhaar)}
            />{" "}
            Aadhaar Verification (XXXX 3325)
          </label>

          <label style={{display:"block",marginBottom:"8px"}}>
            <input
              type="checkbox"
              checked={voterId}
              onChange={()=>setVoterId(!voterId)}
            />{" "}
            Voter ID Authentication (XXXX 6789)
          </label>

          <label style={{display:"block"}}>
            <input
              type="checkbox"
              checked={dl}
              onChange={()=>setDl(!dl)}
            />{" "}
            Driving License (can be accessed)
          </label>

        </div>

        {/* PROFILE SECTION */}
        <div style={{marginTop:"25px",borderTop:"1px solid #eee",paddingTop:"20px"}}>

          <h3>Profile Information</h3>

          <p style={{marginTop:"6px",color:"#555"}}>
            Name, Date of Birth, Gender
          </p>

        </div>

        {/* VALIDITY */}
        <div style={{marginTop:"25px",borderTop:"1px solid #eee",paddingTop:"20px"}}>

          <h3>Consent Validity</h3>

          <p style={{color:"#555"}}>
            Valid for 30 days from today
          </p>

        </div>

        {/* PURPOSE */}
        <div style={{marginTop:"25px",borderTop:"1px solid #eee",paddingTop:"20px"}}>

          <h3>Purpose</h3>

          <p style={{color:"#555"}}>
            Identity verification for Secure Electronic Voting System
          </p>

        </div>

        {/* CONSENT TEXT */}
        <p style={{marginTop:"30px",fontSize:"14px",color:"#555"}}>
          By clicking <strong>Allow</strong>, you consent to share the selected
          information with the voting portal for identity verification.
        </p>

        {/* BUTTONS */}
        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            marginTop:"25px"
          }}
        >

          <button
            style={{
              padding:"12px 28px",
              border:"1px solid #4a64f0",
              borderRadius:"8px",
              background:"#fff",
              color:"#4a64f0",
              fontWeight:"600",
              cursor:"pointer"
            }}
            onClick={()=>navigate("/")}
          >
            Deny
          </button>

          <button
            style={{
              padding:"12px 28px",
              border:"none",
              borderRadius:"8px",
              background:"#4a64f0",
              color:"#fff",
              fontWeight:"600",
              cursor:"pointer"
            }}
            onClick={()=>navigate("/vote")}
          >
            Allow
          </button>

        </div>

      </div>

    </div>
  );
}