import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";

export default function PublicLedger(){

  const navigate = useNavigate();

  const [ledger,setLedger] = useState([]);
  const [search,setSearch] = useState("");
  const [menuOpen,setMenuOpen] = useState(false);

  const candidates = [
    "Arjun Rao",
    "Meera Nair",
    "Rakesh Singh"
  ];

  useEffect(()=>{

    let simulatedVotes = [];

    for(let i=1;i<=300;i++){

      simulatedVotes.push({
        block:i,
        candidate:candidates[Math.floor(Math.random()*3)],
        hash:"0x"+Math.random().toString(16).substring(2,66),
        timestamp:new Date(
          Date.now()-Math.random()*100000000
        ).toLocaleString()
      });

    }

    const currentVote = localStorage.getItem("voteReceipt");

    if(currentVote){

      const vote = JSON.parse(currentVote);

      simulatedVotes.push({
        block:301,
        candidate:vote.candidate,
        hash:vote.hash,
        timestamp:vote.timestamp
      });

    }

    simulatedVotes.sort((a,b)=>b.block-a.block);

    setLedger(simulatedVotes);

  },[]);

  const filteredLedger = ledger.filter(entry =>
    entry.hash.toLowerCase().includes(search.toLowerCase())
  );

  return(

    <div className="ledger-page">

      {/* Side Menu */}
      <SideMenu
        open={menuOpen}
        onClose={()=>setMenuOpen(false)}
      />

      {/* Menu Button */}
      <button
      className="menu-btn"
      onClick={()=>setMenuOpen(true)}
      >
      ☰
      </button>

      <h1>Public Voting Ledger</h1>

      <p className="ledger-note">
      Search your transaction hash to verify that your vote has been recorded.
      </p>

      <input
      className="ledger-search"
      type="text"
      placeholder="Search by Transaction Hash..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      />

      <div className="ledger-container">

        <table className="ledger-table">

          <thead>
            <tr>
              <th>Block</th>
              <th>Candidate</th>
              <th>Transaction Hash</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody>

          {filteredLedger.map((entry,index)=>(
            <tr key={index}>
              <td>{entry.block}</td>
              <td>{entry.candidate}</td>
              <td className="hash">{entry.hash}</td>
              <td>{entry.timestamp}</td>
            </tr>
          ))}

          </tbody>

        </table>

      </div>

      <button
      className="back-btn"
      onClick={()=>navigate("/")}
      >
      Return Home
      </button>

    </div>

  );
}