import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { FiCopy } from "react-icons/fi";
import checkAnimation from "../Blue check circle.json";

export default function VoteStatus(){

  const navigate = useNavigate();
  const [receipt,setReceipt] = useState(null);
  const [copied,setCopied] = useState(false);

  useEffect(()=>{

    const data = localStorage.getItem("voteReceipt");

    if(data){
      setReceipt(JSON.parse(data));
    }

  },[]);

  const copyHash = () => {

    navigator.clipboard.writeText(receipt.hash);

    setCopied(true);

    setTimeout(()=>{
      setCopied(false);
    },2000);

  };

  if(!receipt){
    return <h2>No vote record found.</h2>;
  }

  return(

    <div className="status-page">

      <div className="status-card">

        {/* SUCCESS ANIMATION */}
        <div className="status-animation">
          <Lottie animationData={checkAnimation} loop />
        </div>

        <h2>Vote Successfully Recorded</h2>

        <p className="status-message">
          Your vote has been securely encrypted and recorded on the blockchain ledger.
        </p>

        {/* RECEIPT */}
        <div className="receipt-box">

          <div className="receipt-row">
            <span>Selected Candidate</span>
            <span>{receipt.candidate}</span>
          </div>

          <div className="receipt-row">
            <span>Timestamp</span>
            <span>{receipt.timestamp}</span>
          </div>

          <div className="receipt-row">
            <span>Blockchain Hash</span>

            <div className="hash-copy">

              <span className="hash-text">
                {receipt.hash}
              </span>

              <button className="copy-btn" onClick={copyHash}>
                <FiCopy size={16}/>
              </button>

            </div>

          </div>

        </div>

        {copied && <p className="copy-msg">Hash copied!</p>}

        {/* ACTION BUTTONS */}
        <div className="status-buttons">

          <button onClick={()=>navigate("/ledger")}>
            View Public Ledger
          </button>

          <button onClick={()=>navigate("/")}>
            Return Home
          </button>

        </div>

      </div>

    </div>

  );
}