import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideMenu from "../components/AdminSideMenu";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const API      = "http://172.17.240.89:3001";
const ELIGIBLE = 1200;

export default function AdminDashboard() {

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tally,    setTally]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const role = localStorage.getItem("adminRole");

  useEffect(() => { fetchTally(); }, []);

  const fetchTally = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/results/Karnataka`);
      if (res.ok) {
        const data = await res.json();
        setTally(data);
      } else throw new Error();
    } catch {
      setTally({
        perCandidate: { CANDIDATE_A: 120, CANDIDATE_B: 100, CANDIDATE_C: 81 },
        totalVotes: 301,
        validVotes: 301
      });
      setError("Blockchain API offline — showing demo data");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminRole");
    navigate("/admin-login");
  };

  const votes   = tally?.totalVotes  || 0;
  const perCand = tally?.perCandidate || {};
  const labels  = Object.keys(perCand);
  const counts  = Object.values(perCand);

  const turnoutData = {
    labels: ["Votes Cast", "Remaining"],
    datasets: [{ data: [votes, Math.max(0, ELIGIBLE - votes)], backgroundColor: ["#1f3b82", "#dfe6f3"] }]
  };

  const candidateData = {
    labels,
    datasets: [{ label: "Votes", data: counts, backgroundColor: ["#1f3b82", "#4e73df", "#9bb2ff"] }]
  };

  return (
    <div className="admin-page">

      <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>

      <AdminSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="admin-container">

        {/* Header row with logout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h1>Election Administration Dashboard</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>
              Logged in as <strong>{role === "senior" ? "Senior Officer" : "Election Officer"}</strong>
            </span>
            <button
              onClick={fetchTally}
              style={{ padding: "8px 14px", background: "#1f3b82", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
            >
              ↻ Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{ padding: "8px 14px", background: "#fff", border: "1px solid #e74c3c", color: "#e74c3c", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "#e67e22", fontSize: "13px", marginBottom: "10px" }}>⚠ {error}</p>
        )}

        {loading ? (
          <p>Loading blockchain data...</p>
        ) : (
          <>
            <div className="admin-cards">
              <div className="admin-card"><h4>Eligible Voters</h4><p>{ELIGIBLE}</p></div>
              <div className="admin-card"><h4>Votes Cast</h4><p>{votes}</p></div>
              <div className="admin-card"><h4>Turnout</h4><p>{ELIGIBLE > 0 ? Math.round((votes / ELIGIBLE) * 100) : 0}%</p></div>
              <div className="admin-card"><h4>Valid Votes</h4><p>{tally?.validVotes || votes}</p></div>
            </div>

            <div className="admin-charts">
              <div className="chart-box">
                <h3>Voter Turnout</h3>
                <Doughnut data={turnoutData} />
              </div>
              <div className="chart-box">
                <h3>Candidate Vote Distribution</h3>
                <Bar data={candidateData} />
              </div>
            </div>
          </>
        )}

        <div className="admin-panel">
          <h3>Election Monitoring</h3>
          <ul>
            <li>Blockchain ledger active — nationalvotingchannel</li>
            <li>Votes recorded via Hyperledger Fabric chaincode</li>
            <li>Chameleon hash verification enabled</li>
            <li>MVCC duplicate vote prevention active</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
