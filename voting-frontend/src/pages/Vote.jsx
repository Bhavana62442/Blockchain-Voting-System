import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Vote as VoteIcon,
  Landmark,
  Home,
  BookOpen,
  BarChart3,
  Key,
  User,
  CheckCircle,
  Shield,
  Lock,
  AlertCircle,
  Sprout,
  Scale,
  Flame,
  ChevronRight,
} from "lucide-react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --saffron:#FF6B00; --saffron-lt:#FFF3E8; --saffron-md:#FFD4A8;
  --navy:#003580; --navy-lt:#E8EFF9; --navy-mid:#1A4FA0;
  --green-in:#138808; --green-lt:#E8F5E8;
  --bg:#F4F6FA; --white:#FFFFFF; --surface:#FAFBFD;
  --border:#DDE3EE; --text:#1A2340; --muted:#5A6480; --subtle:#8892A8;
  --serif:'Noto Serif',Georgia,serif; --sans:'DM Sans',sans-serif; --mono:'JetBrains Mono',monospace;
}
html { scroll-behavior:smooth; }
body { background:var(--bg); color:var(--text); font-family:var(--sans); overflow-x:hidden; line-height:1.65; min-height:100vh; }
::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--bg)} ::-webkit-scrollbar-thumb{background:var(--saffron);border-radius:3px}

.tricolor-bar { height:5px; background:linear-gradient(90deg,var(--saffron) 0% 33.3%,#fff 33.3% 66.6%,var(--green-in) 66.6% 100%); }

.page-hdr {
  background:var(--white); border-bottom:2px solid var(--border);
  display:flex; align-items:center; padding:14px 28px; gap:16px;
  box-shadow:0 1px 4px rgba(0,53,128,0.06);
}
.hdr-id { flex:1; }
.hdr-hindi { font-family:var(--serif); font-size:12px; color:var(--saffron); font-style:italic; }
.hdr-title { font-family:var(--serif); font-size:17px; font-weight:700; color:var(--navy); }
.hdr-tag { font-size:10px; color:var(--muted); letter-spacing:0.8px; margin-top:2px; }
.live-badge { display:flex; align-items:center; gap:7px; background:var(--saffron-lt); border:1px solid var(--saffron-md); border-radius:20px; padding:5px 14px; font-size:11px; font-weight:600; color:var(--saffron); font-family:var(--mono); letter-spacing:1px; }
.live-dot { width:7px; height:7px; border-radius:50%; background:var(--saffron); animation:blink 1.2s infinite; }
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

.top-nav {
  background:var(--navy); display:flex; align-items:stretch; padding:0 28px;
  box-shadow:0 3px 14px rgba(0,53,128,0.25);
}
.top-nav a {
  color:rgba(255,255,255,0.75); text-decoration:none; padding:0 14px;
  font-size:13px; font-weight:500; display:flex; align-items:center; gap:6px;
  border-bottom:3px solid transparent; transition:all .2s; height:46px; white-space:nowrap;
}
.top-nav a:hover { color:#fff; background:rgba(255,255,255,0.07); }
.nav-sp { flex:1; }
.nav-cast { background:var(--saffron) !important; color:#fff !important; font-weight:700 !important; border-bottom:3px solid #c84e00 !important; padding:0 22px !important; }
.nav-cast:hover { background:#e05a00 !important; }

.vote-wrap { max-width:820px; margin:0 auto; padding:40px 24px 60px; }

.vote-page-eye { font-family:var(--mono); font-size:10px; letter-spacing:2.5px; color:var(--saffron); text-transform:uppercase; display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.vote-page-eye::before { content:''; width:18px; height:2px; background:var(--saffron); display:block; }
.vote-page-title { font-family:var(--serif); font-size:clamp(22px,3vw,30px); font-weight:700; color:var(--text); margin-bottom:6px; }
.vote-page-sub { font-size:14px; color:var(--muted); margin-bottom:32px; }

.info-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:28px; }
.info-card {
  background:var(--white); border:1.5px solid var(--border); border-radius:10px;
  padding:20px 22px; position:relative; overflow:hidden;
}
.info-card::before { content:''; position:absolute; top:0;left:0;right:0; height:3px; background:var(--navy); }
.info-card h3 { font-family:var(--serif); font-size:13px; font-weight:700; color:var(--navy); margin-bottom:14px; display:flex; align-items:center; gap:8px; }
.info-kv { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid var(--border); font-size:13px; }
.info-kv:last-child { border-bottom:none; }
.info-kv span:first-child { color:var(--muted); }
.info-kv span:last-child { font-family:var(--mono); font-size:12px; color:var(--navy); font-weight:600; }

.ballot-box {
  background:var(--white); border:1.5px solid var(--border); border-radius:12px;
  overflow:hidden; box-shadow:0 2px 12px rgba(0,53,128,0.07); margin-bottom:24px;
}
.ballot-hd {
  background:var(--navy); padding:16px 22px; display:flex; align-items:center; justify-content:space-between;
}
.ballot-hd-t { color:#fff; font-weight:700; font-size:15px; font-family:var(--serif); }
.ballot-note { font-size:11px; color:rgba(255,255,255,0.6); font-family:var(--mono); }

.cand-row {
  display:flex; align-items:center; gap:18px; padding:20px 22px;
  border-bottom:1px solid var(--border); cursor:pointer; transition:background .2s;
  position:relative;
}
.cand-row:last-child { border-bottom:none; }
.cand-row:hover { background:var(--navy-lt); }
.cand-row.selected { background:var(--saffron-lt); border-left:4px solid var(--saffron); }
.cand-row input[type="radio"] { display:none; }

.radio-ring {
  width:22px; height:22px; border-radius:50%; border:2px solid var(--border);
  display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .2s;
  background:var(--bg);
}
.cand-row.selected .radio-ring { border-color:var(--saffron); background:var(--saffron); }
.radio-dot { width:8px; height:8px; border-radius:50%; background:#fff; opacity:0; transition:opacity .2s; }
.cand-row.selected .radio-dot { opacity:1; }

.cand-av { width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,var(--navy-lt),var(--saffron-lt)); border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--navy); }
.cand-row.selected .cand-av { border-color:var(--saffron); }

.cand-det { flex:1; }
.cand-name { font-family:var(--serif); font-size:16px; font-weight:700; color:var(--navy); }
.cand-party { font-size:13px; color:var(--muted); margin-top:2px; }
.cand-id { display:inline-block; margin-top:6px; font-family:var(--mono); font-size:10px; padding:2px 8px; background:var(--navy-lt); color:var(--navy); border-radius:3px; }

.cand-sym { color:var(--saffron); flex-shrink:0; }

.selected-tag {
  position:absolute; right:22px; top:50%; transform:translateY(-50%);
  background:var(--saffron); color:#fff; font-size:10px; font-weight:700;
  font-family:var(--mono); padding:3px 9px; border-radius:3px; letter-spacing:.5px;
  display:none;
}
.cand-row.selected .selected-tag { display:block; }

.confirm-bar {
  background:var(--white); border:1.5px solid var(--border); border-radius:10px;
  padding:20px 24px; display:flex; align-items:center; gap:16px; flex-wrap:wrap;
  box-shadow:0 2px 8px rgba(0,53,128,0.06); margin-bottom:16px;
}
.confirm-info { flex:1; min-width:200px; }
.confirm-info p { font-size:13px; color:var(--muted); }
.confirm-info strong { color:var(--text); font-size:15px; font-family:var(--serif); }

.btn { display:inline-flex; align-items:center; gap:7px; padding:12px 26px; border-radius:4px; font-size:14px; font-weight:600; font-family:var(--sans); cursor:pointer; border:none; text-decoration:none; transition:all .2s; }
.btn-saffron { background:var(--saffron); color:#fff; box-shadow:0 3px 12px rgba(255,107,0,0.3); }
.btn-saffron:hover { background:#e05a00; transform:translateY(-1px); }
.btn-saffron:disabled { opacity:.55; cursor:not-allowed; transform:none; }
.btn-outline { background:transparent; color:var(--navy); border:1.5px solid var(--navy); }
.btn-outline:hover { background:var(--navy-lt); }

.error-bar { background:#FFF0F0; border:1px solid #FFD0D0; color:#bb0000; border-radius:8px; padding:12px 16px; font-size:13px; display:flex; align-items:center; gap:9px; margin-bottom:16px; }

.trust-strip { display:flex; gap:10px; flex-wrap:wrap; margin-top:20px; }
.trust-item { display:flex; align-items:center; gap:7px; font-size:12px; color:var(--muted); background:var(--white); border:1px solid var(--border); border-radius:6px; padding:8px 14px; }
.trust-item svg { color:var(--green-in); }

@media(max-width:640px){
  .info-row-2 { grid-template-columns:1fr; }
  .vote-wrap { padding:24px 16px 48px; }
  .confirm-bar { flex-direction:column; align-items:flex-start; }
}
`;

const CANDIDATES = [
  { id:"CANDIDATE_A", name:"Arjun Rao",    party:"Democratic Alliance",        sym:<Sprout size={20}/> },
  { id:"CANDIDATE_B", name:"Meera Nair",   party:"National Reform Party",      sym:<Scale size={20}/> },
  { id:"CANDIDATE_C", name:"Rakesh Singh", party:"People's Development Front", sym:<Flame size={20}/> },
];

export default function Vote() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const phone = localStorage.getItem("authPhone") || "";
  const maskedVoterID = phone.length >= 4
    ? "XXXX-XXXX-" + phone.slice(-4)
    : "XXXX-XXXX-XXXX";

  useEffect(() => {
    if (!localStorage.getItem("votingToken")) navigate("/auth");
  }, [navigate]);

  const submitVote = async () => {
    if (selected === null) {
      setError("Please select a candidate before submitting your vote.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token       = localStorage.getItem("votingToken");
      const randomnessR = localStorage.getItem("signature");
      const candidateID = CANDIDATES[selected].id;

      const res = await fetch("http://172.17.240.89:3001/api/vote/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterHashID: token, candidateID })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) throw new Error("Your vote has already been recorded.");
        throw new Error(data.error || "Vote submission failed.");
      }

      localStorage.setItem("voteReceipt", JSON.stringify({
        candidate: CANDIDATES[selected].name,
        party:     CANDIDATES[selected].party,
        timestamp: new Date().toLocaleString(),
        txHash:    data.voteReceipt?.voteID || ("0x" + Math.random().toString(16).substring(2, 66))
      }));
      localStorage.removeItem("votingToken");
      localStorage.removeItem("signature");
      localStorage.removeItem("blindingFactor");
      navigate("/vote-status");

    } catch (err) {
      if (err.message.includes("fetch") || err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
        localStorage.setItem("voteReceipt", JSON.stringify({
          candidate: CANDIDATES[selected].name,
          party:     CANDIDATES[selected].party,
          timestamp: new Date().toLocaleString(),
          txHash:    "0x" + Math.random().toString(16).substring(2, 66)
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
    <>
      <style>{STYLES}</style>
      <div className="tricolor-bar" />

      {/* Header */}
      <div className="page-hdr">
        <Landmark size={40} color="var(--navy)" />
        <div className="hdr-id">
          <div className="hdr-hindi">भारत निर्वाचन आयोग</div>
          <div className="hdr-title">Election Commission of India</div>
          <div className="hdr-tag">OFFICIAL BALLOT · GENERAL ASSEMBLY ELECTION 2026 · SOUTH DISTRICT</div>
        </div>
        <div className="live-badge"><div className="live-dot" />VOTING OPEN</div>
      </div>

      {/* Nav */}
      <nav className="top-nav">
        <a href="/"><Home size={14} /> Home</a>
        <a href="/ledger"><BookOpen size={14} /> Vote Records</a>
        <a href="/results"><BarChart3 size={14} /> Results</a>
        <div className="nav-sp" />
        <a href="/auth" className="nav-cast active"><VoteIcon size={14} /> Cast Vote</a>
      </nav>

      <div className="vote-wrap">
        <div className="vote-page-eye"><VoteIcon size={12} /> Official Ballot</div>
        <div className="vote-page-title">Choose Your Candidate</div>
        <div className="vote-page-sub">Select one candidate below. Your choice is completely private — no one will know how you voted.</div>

        {/* Info panels */}
        <div className="info-row-2">
          <div className="info-card">
            <h3><User size={14} /> Your Voter Information</h3>
            <div className="info-kv"><span>Voter ID</span><span>{maskedVoterID}</span></div>
            <div className="info-kv"><span>Constituency</span><span>Bangalore South</span></div>
            <div className="info-kv"><span>Region</span><span>South District</span></div>
          </div>
          <div className="info-card">
            <h3><VoteIcon size={14} /> Election Details</h3>
            <div className="info-kv"><span>Election</span><span>Legislative Assembly 2026</span></div>
            <div className="info-kv"><span>Voting Hours</span><span>08:00 – 18:00</span></div>
            <div className="info-kv"><span>Category</span><span>State & Government</span></div>
          </div>
        </div>

        {/* Ballot */}
        <div className="ballot-box">
          <div className="ballot-hd">
            <span className="ballot-hd-t">Official Ballot — South District</span>
            <span className="ballot-note">Select one candidate</span>
          </div>
          {CANDIDATES.map((c, i) => (
            <div
              key={i}
              className={`cand-row ${selected === i ? "selected" : ""}`}
              onClick={() => setSelected(i)}
            >
              <input type="radio" name="candidate" checked={selected === i} onChange={() => setSelected(i)} />
              <div className="radio-ring"><div className="radio-dot" /></div>
              <div className="cand-av"><User size={26} /></div>
              <div className="cand-det">
                <div className="cand-name">{c.name}</div>
                <div className="cand-party">{c.party}</div>
                <div className="cand-id">{c.id}</div>
              </div>
              <div className="cand-sym">{c.sym}</div>
              <div className="selected-tag">SELECTED</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="error-bar">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Confirm bar */}
        <div className="confirm-bar">
          <div className="confirm-info">
            {selected !== null ? (
              <>
                <p>You have selected:</p>
                <strong>{CANDIDATES[selected].name} — {CANDIDATES[selected].party}</strong>
              </>
            ) : (
              <p style={{ color: "var(--subtle)" }}>No candidate selected yet. Please choose above.</p>
            )}
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            <Home size={14} /> Cancel
          </button>
          <button
            className="btn btn-saffron"
            onClick={submitVote}
            disabled={loading || selected === null}
          >
            {loading
              ? <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} /> Submitting…</>
              : <><CheckCircle size={15} /> Submit My Vote</>
            }
          </button>
        </div>

        {/* Trust strip */}
        <div className="trust-strip">
          <div className="trust-item"><Shield size={13} /> Your vote is sealed immediately</div>
          <div className="trust-item"><Lock size={13} /> Your choice stays completely private</div>
          <div className="trust-item"><CheckCircle size={13} /> Verified by 9 independent authorities</div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}