import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, CheckCircle, Copy, BookOpen, Home,
  Shield, Lock, Vote, ExternalLink,
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
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--sans); overflow-x: hidden; line-height: 1.65; min-height: 100vh; }
::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--saffron); border-radius: 3px; }

.tricolor-bar { height: 5px; background: linear-gradient(90deg, var(--saffron) 0% 33.3%, #fff 33.3% 66.6%, var(--green-in) 66.6% 100%); }

.page-hdr {
  background: var(--white); border-bottom: 2px solid var(--border);
  display: flex; align-items: center; padding: 14px 28px; gap: 16px;
  box-shadow: 0 1px 4px rgba(0,53,128,0.06);
}
.hdr-id { flex: 1; }
.hdr-hindi { font-family: var(--serif); font-size: 12px; color: var(--saffron); font-style: italic; }
.hdr-title { font-family: var(--serif); font-size: 17px; font-weight: 700; color: var(--navy); }
.hdr-tag { font-size: 10px; color: var(--muted); letter-spacing: 0.8px; margin-top: 2px; }
.confirmed-badge { display: flex; align-items: center; gap: 7px; background: var(--green-lt); border: 1px solid #a8d8a8; border-radius: 20px; padding: 5px 14px; font-size: 11px; font-weight: 600; color: var(--green-in); font-family: var(--mono); letter-spacing: 1px; }

.top-nav {
  background: var(--navy); display: flex; align-items: stretch; padding: 0 28px;
  box-shadow: 0 3px 14px rgba(0,53,128,0.25);
}
.top-nav a {
  color: rgba(255,255,255,0.75); text-decoration: none; padding: 0 14px;
  font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;
  border-bottom: 3px solid transparent; transition: all .2s; height: 46px; white-space: nowrap;
}
.top-nav a:hover { color: #fff; background: rgba(255,255,255,0.07); }
.nav-sp { flex: 1; }

/* Main layout */
.status-wrap { max-width: 680px; margin: 0 auto; padding: 48px 24px 80px; }

/* Success hero */
.success-hero {
  text-align: center; margin-bottom: 36px;
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

.check-ring {
  width: 88px; height: 88px; border-radius: 50%;
  background: var(--green-lt); border: 3px solid var(--green-in);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 22px; color: var(--green-in);
  animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.success-eyebrow { font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px; color: var(--green-in); text-transform: uppercase; margin-bottom: 10px; }
.success-title { font-family: var(--serif); font-size: clamp(22px, 3vw, 30px); font-weight: 700; color: var(--text); margin-bottom: 10px; }
.success-sub { font-size: 14px; color: var(--muted); max-width: 440px; margin: 0 auto; }

/* Receipt card */
.receipt-card {
  background: var(--white); border: 1.5px solid var(--border); border-radius: 12px;
  overflow: hidden; box-shadow: 0 2px 14px rgba(0,53,128,0.08);
  margin-bottom: 20px; animation: fadeUp 0.5s 0.1s ease both;
}
.receipt-hd {
  background: var(--navy); padding: 14px 22px;
  display: flex; align-items: center; justify-content: space-between;
}
.receipt-hd-t { color: #fff; font-weight: 700; font-size: 14px; font-family: var(--serif); }
.receipt-id { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.55); letter-spacing: 1px; }

.receipt-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 22px; border-bottom: 1px solid var(--border);
  gap: 16px; flex-wrap: wrap;
}
.receipt-row:last-child { border-bottom: none; }
.receipt-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.7px; font-family: var(--mono); flex-shrink: 0; }
.receipt-value { font-size: 14px; font-weight: 600; color: var(--text); text-align: right; }
.receipt-value.candidate { font-family: var(--serif); font-size: 16px; color: var(--navy); }
.receipt-value.ts { font-family: var(--mono); font-size: 12px; color: var(--muted); font-weight: 400; }

.hash-row { flex-direction: column; align-items: flex-start; gap: 8px; }
.hash-val {
  font-family: var(--mono); font-size: 12px; color: var(--navy);
  background: var(--navy-lt); border: 1px solid var(--border);
  border-radius: 6px; padding: 10px 14px; word-break: break-all;
  line-height: 1.6; width: 100%;
}

.copy-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: 1.5px solid var(--border);
  color: var(--navy); border-radius: 4px; padding: 6px 14px;
  font-size: 12px; font-weight: 600; font-family: var(--sans);
  cursor: pointer; transition: all .2s; margin-top: 4px;
}
.copy-btn:hover { background: var(--navy-lt); border-color: var(--navy); }
.copy-btn.copied { background: var(--green-lt); border-color: var(--green-in); color: var(--green-in); }

/* Action buttons */
.action-row {
  display: flex; gap: 12px; flex-wrap: wrap;
  margin-bottom: 20px; animation: fadeUp 0.5s 0.2s ease both;
}
.btn { display: inline-flex; align-items: center; gap: 7px; padding: 12px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; font-family: var(--sans); cursor: pointer; border: none; text-decoration: none; transition: all .2s; }
.btn-green { background: var(--green-in); color: #fff; box-shadow: 0 3px 12px rgba(19,136,8,0.25); flex: 1; justify-content: center; }
.btn-green:hover { background: #0f6b06; transform: translateY(-1px); }
.btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--navy); }
.btn-outline:hover { background: var(--navy-lt); }

/* Trust strip */
.trust-strip { display: flex; gap: 10px; flex-wrap: wrap; animation: fadeUp 0.5s 0.3s ease both; }
.trust-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted); background: var(--white); border: 1px solid var(--border); border-radius: 6px; padding: 8px 14px; }
.trust-item svg { color: var(--green-in); }

/* No receipt state */
.no-receipt { text-align: center; padding: 80px 24px; }
.no-receipt h2 { font-family: var(--serif); color: var(--navy); margin-bottom: 10px; }
.no-receipt p { color: var(--muted); font-size: 14px; margin-bottom: 24px; }

@media(max-width: 600px) {
  .status-wrap { padding: 28px 16px 60px; }
  .receipt-row { flex-direction: column; align-items: flex-start; }
  .receipt-value { text-align: left; }
  .action-row { flex-direction: column; }
  .btn-green { flex: unset; }
}
`;

export default function VoteStatus() {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("voteReceipt");
    if (data) {
      try { setReceipt(JSON.parse(data)); } catch {}
    }
  }, []);

  const copyHash = () => {
    const hash = receipt?.txHash || receipt?.hash || "";
    if (!hash) return;
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Normalise: old code stored "hash", new stores "txHash"
  const txHash   = receipt?.txHash || receipt?.hash || "";
  const shortID  = txHash ? txHash.slice(0, 10).toUpperCase() : "—";

  if (!receipt) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="tricolor-bar" />
        <div className="page-hdr">
          <Landmark size={40} color="var(--navy)" />
          <div className="hdr-id">
            <div className="hdr-hindi">भारत निर्वाचन आयोग</div>
            <div className="hdr-title">Election Commission of India</div>
          </div>
        </div>
        <div className="status-wrap">
          <div className="no-receipt">
            <CheckCircle size={48} color="var(--subtle)" style={{ margin: "0 auto 16px", display: "block" }} />
            <h2>No Vote Record Found</h2>
            <p>You haven't cast a vote in this session, or the record has expired.</p>
            <button className="btn btn-outline" onClick={() => navigate("/auth")}>
              <Vote size={14} /> Go to Voting
            </button>
          </div>
        </div>
      </>
    );
  }

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
          <div className="hdr-tag">VOTE CONFIRMATION · GENERAL ASSEMBLY ELECTION 2026 · SOUTH DISTRICT</div>
        </div>
        <div className="confirmed-badge">
          <CheckCircle size={12} /> VOTE CONFIRMED
        </div>
      </div>

      {/* Nav */}
      <nav className="top-nav">
        <a href="/"><Home size={14} /> Home</a>
        <a href="/ledger"><BookOpen size={14} /> Vote Records</a>
        <div className="nav-sp" />
      </nav>

      <div className="status-wrap">

        {/* Hero */}
        <div className="success-hero">
          <div className="check-ring">
            <CheckCircle size={44} strokeWidth={1.5} />
          </div>
          <div className="success-eyebrow">Vote Recorded Successfully</div>
          <div className="success-title">Your Vote Has Been Cast</div>
          <div className="success-sub">
            Your choice has been sealed on the blockchain. No one can change or view it.
            Save your receipt code to verify your vote in the public ledger.
          </div>
        </div>

        {/* Receipt */}
        <div className="receipt-card">
          <div className="receipt-hd">
            <span className="receipt-hd-t">Official Vote Receipt</span>
            <span className="receipt-id">REF: {shortID}</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Candidate</span>
            <span className="receipt-value candidate">{receipt.candidate}</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Party</span>
            <span className="receipt-value">{receipt.party || "—"}</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Timestamp</span>
            <span className="receipt-value ts">{receipt.timestamp}</span>
          </div>

          <div className="receipt-row hash-row">
            <span className="receipt-label">Blockchain Receipt Code</span>
            <div className="hash-val">{txHash || "—"}</div>
            <button
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={copyHash}
            >
              <Copy size={13} />
              {copied ? "Copied!" : "Copy Receipt Code"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="action-row">
          <button className="btn btn-green" onClick={() => navigate("/ledger")}>
            <BookOpen size={15} /> Verify in Public Ledger
          </button>
          <button className="btn btn-outline" onClick={() => navigate("/")}>
            <Home size={14} /> Return Home
          </button>
        </div>

        {/* Trust */}
        <div className="trust-strip">
          <div className="trust-item"><Shield size={13} /> Vote permanently sealed</div>
          <div className="trust-item"><Lock size={13} /> Identity never revealed</div>
          <div className="trust-item"><CheckCircle size={13} /> Verifiable by receipt code</div>
        </div>

      </div>
    </>
  );
}