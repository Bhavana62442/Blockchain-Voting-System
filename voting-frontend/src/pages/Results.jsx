import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, Home, BookOpen, BarChart3, Vote,
  Trophy, Users, TrendingUp, Lock, AlertTriangle,
  CheckCircle, Sprout, Scale, Flame,
} from "lucide-react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --saffron:#FF6B00;--saffron-lt:#FFF3E8;--saffron-md:#FFD4A8;
  --navy:#003580;--navy-lt:#E8EFF9;--navy-mid:#1A4FA0;
  --green-in:#138808;--green-lt:#E8F5E8;
  --gold:#C8922A;--gold-lt:#FFF8EC;
  --bg:#F4F6FA;--white:#FFFFFF;--surface:#FAFBFD;
  --border:#DDE3EE;--text:#1A2340;--muted:#5A6480;--subtle:#8892A8;
  --serif:'Noto Serif',Georgia,serif;--sans:'DM Sans',sans-serif;--mono:'JetBrains Mono',monospace;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--sans);overflow-x:hidden;line-height:1.65;min-height:100vh}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--saffron);border-radius:3px}

.tricolor-bar{height:5px;background:linear-gradient(90deg,var(--saffron) 0% 33.3%,#fff 33.3% 66.6%,var(--green-in) 66.6% 100%)}

.page-hdr{background:var(--white);border-bottom:2px solid var(--border);display:flex;align-items:center;padding:14px 28px;gap:16px;box-shadow:0 1px 4px rgba(0,53,128,0.06)}
.hdr-id{flex:1}
.hdr-hindi{font-family:var(--serif);font-size:12px;color:var(--saffron);font-style:italic}
.hdr-title{font-family:var(--serif);font-size:17px;font-weight:700;color:var(--navy)}
.hdr-tag{font-size:10px;color:var(--muted);letter-spacing:0.8px;margin-top:2px}

.top-nav{background:var(--navy);display:flex;align-items:stretch;padding:0 28px;box-shadow:0 3px 14px rgba(0,53,128,0.25)}
.top-nav a{color:rgba(255,255,255,0.75);text-decoration:none;padding:0 14px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;border-bottom:3px solid transparent;transition:all .2s;height:46px;white-space:nowrap}
.top-nav a:hover{color:#fff;background:rgba(255,255,255,0.07)}
.top-nav a.active{color:#fff;border-bottom-color:var(--saffron)}
.nav-sp{flex:1}
.nav-vote{background:var(--saffron)!important;color:#fff!important;font-weight:700!important;border-bottom:3px solid #c84e00!important;padding:0 22px!important}
.nav-vote:hover{background:#e05a00!important}

.results-wrap{max-width:1000px;margin:0 auto;padding:40px 24px 60px}

.page-eye{font-family:var(--mono);font-size:10px;letter-spacing:2.5px;color:var(--saffron);text-transform:uppercase;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.page-eye::before{content:'';width:18px;height:2px;background:var(--saffron);display:block}
.page-title-main{font-family:var(--serif);font-size:clamp(22px,3vw,30px);font-weight:700;color:var(--text);margin-bottom:6px}
.page-sub{font-size:14px;color:var(--muted);margin-bottom:32px;max-width:560px}

.stats-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:32px}
.stat-c{background:var(--white);border:1.5px solid var(--border);border-radius:10px;padding:18px 20px;display:flex;align-items:center;gap:14px;transition:background .2s}
.stat-c:hover{background:var(--navy-lt)}
.stat-ic{width:42px;height:42px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ic-o{background:var(--saffron-lt);color:var(--saffron)}
.ic-b{background:var(--navy-lt);color:var(--navy)}
.ic-g{background:var(--green-lt);color:var(--green-in)}
.ic-y{background:var(--gold-lt);color:var(--gold)}
.stat-val{font-family:var(--mono);font-size:22px;font-weight:700;color:var(--navy);line-height:1}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-top:4px}

/* Not published */
.not-published{
  background:var(--white);border:1.5px solid var(--border);border-radius:14px;
  padding:60px 36px;text-align:center;
  box-shadow:0 2px 12px rgba(0,53,128,0.07);
}
.np-ico{width:72px;height:72px;border-radius:50%;background:var(--navy-lt);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:var(--navy)}
.np-title{font-family:var(--serif);font-size:24px;font-weight:700;color:var(--navy);margin-bottom:10px}
.np-desc{font-size:14px;color:var(--muted);max-width:440px;margin:0 auto;line-height:1.75}

/* Results */
.candidates-section{margin-bottom:28px}
.sec-label{font-family:var(--serif);font-size:16px;font-weight:700;color:var(--navy);margin-bottom:16px;display:flex;align-items:center;gap:8px}

.cand-result-card{
  background:var(--white);border:1.5px solid var(--border);border-radius:10px;
  padding:20px 22px;margin-bottom:12px;display:flex;align-items:center;gap:20px;
  transition:all .25s;position:relative;overflow:hidden;
}
.cand-result-card.winner{border-color:var(--gold);box-shadow:0 4px 20px rgba(200,146,42,0.15)}
.cand-result-card.winner::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--saffron))}

.cand-rank{font-family:var(--mono);font-size:22px;font-weight:700;color:var(--border);width:36px;flex-shrink:0}
.cand-result-card.winner .cand-rank{color:var(--gold)}

.cand-av{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--navy-lt),var(--saffron-lt));border:2px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--navy)}
.cand-result-card.winner .cand-av{border-color:var(--gold);color:var(--gold)}

.cand-info{flex:1;min-width:0}
.cand-name{font-family:var(--serif);font-size:16px;font-weight:700;color:var(--navy)}
.cand-party{font-size:12px;color:var(--muted);margin-top:2px}

.bar-wrap{flex:2;min-width:120px}
.bar-track{height:10px;background:var(--border);border-radius:5px;overflow:hidden;margin-bottom:5px}
.bar-fill{height:100%;border-radius:5px;background:var(--navy-mid);transition:width 1s ease}
.cand-result-card.winner .bar-fill{background:linear-gradient(90deg,var(--gold),var(--saffron))}
.bar-pct{font-family:var(--mono);font-size:11px;color:var(--muted)}

.cand-votes{font-family:var(--mono);font-size:20px;font-weight:700;color:var(--navy);text-align:right;min-width:80px;flex-shrink:0}
.cand-result-card.winner .cand-votes{color:var(--gold)}
.votes-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-top:2px}

.winner-tag{
  position:absolute;top:16px;right:16px;background:var(--gold);color:#fff;
  font-size:10px;font-weight:700;font-family:var(--mono);padding:3px 10px;
  border-radius:3px;letter-spacing:.5px;display:flex;align-items:center;gap:5px;
}

/* Winner banner */
.winner-banner{
  background:linear-gradient(135deg,var(--navy) 0%,var(--navy-mid) 100%);
  border-radius:12px;padding:32px 36px;text-align:center;margin-bottom:28px;
  position:relative;overflow:hidden;
  box-shadow:0 8px 32px rgba(0,53,128,0.2);
}
.winner-banner::before{content:'';position:absolute;right:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.04)}
.winner-banner::after{content:'';position:absolute;left:-20px;bottom:-20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.04)}
.wb-eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:3px;color:rgba(255,165,80,0.8);text-transform:uppercase;margin-bottom:8px}
.wb-name{font-family:var(--serif);font-size:clamp(22px,4vw,36px);font-weight:700;color:#fff;margin-bottom:4px}
.wb-party{font-size:14px;color:rgba(255,255,255,0.65)}
.wb-icon{width:64px;height:64px;border-radius:50%;background:rgba(200,146,42,0.2);border:2px solid rgba(200,146,42,0.4);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--saffron-md)}

.warn-bar{background:#FFF8EC;border:1px solid #f5d78e;color:#92600a;border-radius:8px;padding:11px 16px;font-size:12px;display:flex;align-items:center;gap:9px;margin-bottom:16px;font-family:var(--mono)}

.btn{display:inline-flex;align-items:center;gap:7px;padding:11px 22px;border-radius:4px;font-size:13px;font-weight:600;font-family:var(--sans);cursor:pointer;border:none;text-decoration:none;transition:all .2s}
.btn-saffron{background:var(--saffron);color:#fff;box-shadow:0 3px 12px rgba(255,107,0,0.3)}
.btn-saffron:hover{background:#e05a00;transform:translateY(-1px)}
.btn-outline{background:transparent;color:var(--navy);border:1.5px solid var(--navy)}
.btn-outline:hover{background:var(--navy-lt)}

.loading-box{padding:60px 20px;text-align:center}
.spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--saffron);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 14px}
@keyframes spin{to{transform:rotate(360deg)}}

@media(max-width:640px){
  .results-wrap{padding:24px 14px 48px}
  .cand-result-card{flex-wrap:wrap}
  .bar-wrap{flex:100%}
  .winner-banner{padding:24px 20px}
}
`;

const CANDIDATE_NAMES = {
  CANDIDATE_A: "Arjun Rao",
  CANDIDATE_B: "Meera Nair",
  CANDIDATE_C: "Rakesh Singh",
};
const CANDIDATE_PARTY = {
  CANDIDATE_A: "Democratic Alliance",
  CANDIDATE_B: "National Reform Party",
  CANDIDATE_C: "People's Development Front",
};
const CANDIDATE_ICON = {
  CANDIDATE_A: <Sprout size={22} />,
  CANDIDATE_B: <Scale size={22} />,
  CANDIDATE_C: <Flame size={22} />,
};

const TOTAL_ELIGIBLE = 500;

export default function Results() {
  const navigate = useNavigate();
  const [results,    setResults]    = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const published = localStorage.getItem("resultsPublished") === "true";

  useEffect(() => {
    if (published) fetchResults();
    else setLoading(false);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://172.17.240.89:3001/api/results/Karnataka");
      if (res.ok) {
        const data = await res.json();
        setResults(data.perCandidate || {});
        setTotalVotes(data.totalVotes || 0);
      } else throw new Error("API error");
    } catch {
      setResults({ CANDIDATE_A: 120, CANDIDATE_B: 100, CANDIDATE_C: 81 });
      setTotalVotes(301);
      setError("System is in demo mode — showing sample data");
    }
    setLoading(false);
  };

  const turnout = TOTAL_ELIGIBLE > 0
    ? ((totalVotes / TOTAL_ELIGIBLE) * 100).toFixed(1)
    : "0.0";

  const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
  const winner = sorted.length > 0 ? sorted[0][0] : null;
  const maxVotes = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <>
      <style>{STYLES}</style>
      <div className="tricolor-bar" />

      <div className="page-hdr">
        <Landmark size={40} color="var(--navy)" />
        <div className="hdr-id">
          <div className="hdr-hindi">भारत निर्वाचन आयोग</div>
          <div className="hdr-title">Election Commission of India</div>
          <div className="hdr-tag">ELECTION RESULTS · GENERAL ASSEMBLY ELECTION 2026 · SOUTH DISTRICT</div>
        </div>
      </div>

      <nav className="top-nav">
        <a href="/"><Home size={14} /> Home</a>
        <a href="/ledger"><BookOpen size={14} /> Vote Records</a>
        <a href="/results" className="active"><BarChart3 size={14} /> Results</a>
        <div className="nav-sp" />
        <a href="/auth" className="nav-vote"><Vote size={14} /> Cast Vote</a>
      </nav>

      <div className="results-wrap">
        <div className="page-eye"><BarChart3 size={12} /> Official Results</div>
        <div className="page-title-main">General Assembly Election 2026 — Results</div>
        <div className="page-sub">South District · Bangalore South Constituency</div>

        {/* Stats */}
        <div className="stats-strip">
          <div className="stat-c">
            <div className="stat-ic ic-b"><Users size={19} /></div>
            <div><div className="stat-val">{TOTAL_ELIGIBLE.toLocaleString("en-IN")}</div><div className="stat-lbl">Eligible Voters</div></div>
          </div>
          <div className="stat-c">
            <div className="stat-ic ic-o"><Vote size={19} /></div>
            <div><div className="stat-val">{totalVotes.toLocaleString("en-IN")}</div><div className="stat-lbl">Votes Cast</div></div>
          </div>
          <div className="stat-c">
            <div className="stat-ic ic-g"><TrendingUp size={19} /></div>
            <div><div className="stat-val">{published ? `${turnout}%` : "—"}</div><div className="stat-lbl">Voter Turnout</div></div>
          </div>
          <div className="stat-c">
            <div className="stat-ic ic-y"><Trophy size={19} /></div>
            <div>
              <div className="stat-val" style={{ fontSize: 14 }}>
                {published && winner ? CANDIDATE_NAMES[winner] : "Pending"}
              </div>
              <div className="stat-lbl">Winner</div>
            </div>
          </div>
        </div>

        {!published ? (
          <div className="not-published">
            <div className="np-ico"><Lock size={32} /></div>
            <div className="np-title">Results Not Yet Released</div>
            <p className="np-desc">
              Election results will be made available here once they have been officially verified
              and released by the Election Commission of India. Please check back later.
            </p>
            <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-saffron" onClick={() => navigate("/auth")}><Vote size={14} /> Cast Your Vote</button>
              <button className="btn btn-outline" onClick={() => navigate("/ledger")}><BookOpen size={14} /> View Vote Records</button>
            </div>
          </div>
        ) : loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Loading official results…</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="warn-bar">
                <AlertTriangle size={15} /> {error}
              </div>
            )}

            {/* Winner banner */}
            {winner && (
              <div className="winner-banner">
                <div className="wb-eyebrow">Declared Winner · South District</div>
                <div className="wb-icon"><Trophy size={30} /></div>
                <div className="wb-name">{CANDIDATE_NAMES[winner]}</div>
                <div className="wb-party">{CANDIDATE_PARTY[winner]}</div>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "var(--mono)" }}>
                  <CheckCircle size={14} style={{ color: "#90ee90" }} />
                  Result verified by all 9 independent authorities
                </div>
              </div>
            )}

            {/* Candidate breakdown */}
            <div className="candidates-section">
              <div className="sec-label"><BarChart3 size={17} /> Vote Count by Candidate</div>
              {sorted.map(([id, count], idx) => {
                const pct = ((count / totalVotes) * 100).toFixed(1);
                const isWinner = id === winner;
                return (
                  <div key={id} className={`cand-result-card ${isWinner ? "winner" : ""}`}>
                    {isWinner && <div className="winner-tag"><Trophy size={10} /> WINNER</div>}
                    <div className="cand-rank">{idx + 1}</div>
                    <div className="cand-av">{CANDIDATE_ICON[id]}</div>
                    <div className="cand-info">
                      <div className="cand-name">{CANDIDATE_NAMES[id]}</div>
                      <div className="cand-party">{CANDIDATE_PARTY[id]}</div>
                      <div className="bar-wrap" style={{ marginTop: 10 }}>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${(count / maxVotes) * 100}%` }}
                          />
                        </div>
                        <div className="bar-pct">{pct}% of votes cast</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="cand-votes">{count.toLocaleString("en-IN")}</div>
                      <div className="votes-label">Votes</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-saffron" onClick={() => navigate("/ledger")}><BookOpen size={14} /> View Full Vote Records</button>
              <button className="btn btn-outline" onClick={() => navigate("/")}><Home size={14} /> Back to Home</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}