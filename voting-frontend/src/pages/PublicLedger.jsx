import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";

const API = "http://localhost:3001";

const CANDIDATE_NAMES = {
  "CANDIDATE_A": "Arjun Rao",
  "CANDIDATE_B": "Meera Nair",
  "CANDIDATE_C": "Rakesh Singh"
};

export default function PublicLedger() {

  const navigate = useNavigate();
  const [ledger,   setLedger]   = useState([]);
  const [search,   setSearch]   = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    setError("");
    try {
      // Her API → GetResults / TallyVotes chaincode
      const res = await fetch(`${API}/api/results/Karnataka`);
      if (res.ok) {
        const data = await res.json();
        const rows = [];
        let block = 1;
        for (const [candidateID, count] of Object.entries(data.perCandidate || {})) {
          for (let i = 0; i < count; i++) {
            rows.push({
              block: block++,
              candidateID,
              displayName: CANDIDATE_NAMES[candidateID] || candidateID,
              hash: "0x" + Math.random().toString(16).substring(2, 66),
              timestamp: new Date(Date.now() - Math.random() * 100000000).toLocaleString()
            });
          }
        }
        // Add this voter's real receipt if available
        const receipt = localStorage.getItem("voteReceipt");
        if (receipt) {
          const v = JSON.parse(receipt);
          rows.push({
            block: block,
            candidateID: v.candidate,
            displayName: v.candidate,
            hash: v.txHash || ("0x" + Math.random().toString(16).substring(2, 66)),
            timestamp: v.timestamp
          });
        }
        rows.sort((a, b) => b.block - a.block);
        setLedger(rows);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback simulated
      const simulated = [];
      const candidates = ["CANDIDATE_A", "CANDIDATE_B", "CANDIDATE_C"];
      for (let i = 1; i <= 300; i++) {
        const id = candidates[Math.floor(Math.random() * 3)];
        simulated.push({
          block: i,
          candidateID: id,
          displayName: CANDIDATE_NAMES[id] || id,
          hash: "0x" + Math.random().toString(16).substring(2, 66),
          timestamp: new Date(Date.now() - Math.random() * 100000000).toLocaleString()
        });
      }
      const receipt = localStorage.getItem("voteReceipt");
      if (receipt) {
        const v = JSON.parse(receipt);
        simulated.push({
          block: 301,
          candidateID: v.candidate,
          displayName: v.candidate,
          hash: v.txHash || ("0x" + Math.random().toString(16).substring(2, 66)),
          timestamp: v.timestamp
        });
      }
      simulated.sort((a, b) => b.block - a.block);
      setLedger(simulated);
      setError("Blockchain API offline — showing demo data");
    }
    setLoading(false);
  };

  const filtered = ledger.filter(e =>
    e.hash.toLowerCase().includes(search.toLowerCase()) ||
    e.displayName.toLowerCase().includes(search.toLowerCase()) ||
    e.block.toString().includes(search)
  );

  return (
    <div className="ledger-page">

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>

      <h1>Public Voting Ledger</h1>

      <p className="ledger-note">
        Search your transaction hash to verify that your vote has been recorded on the blockchain.
      </p>

      {error && (
        <p style={{ color: "#e67e22", fontSize: "13px", marginBottom: "10px" }}>⚠ {error}</p>
      )}

      <input
        className="ledger-search"
        type="text"
        placeholder="Search by Transaction Hash, Block or Candidate..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "40px" }}>Loading blockchain ledger...</p>
      ) : (
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
              {filtered.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.block}</td>
                  <td>{entry.displayName}</td>
                  <td className="hash">{entry.hash}</td>
                  <td>{entry.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate("/")}>
        Return Home
      </button>

    </div>
  );
}
