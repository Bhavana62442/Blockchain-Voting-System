import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, Home, BookOpen, BarChart3, Vote, Search,
  RefreshCw, AlertTriangle, ChevronUp, ChevronDown, Filter,
} from "lucide-react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --saffron:#FF6B00;--saffron-lt:#FFF3E8;--saffron-md:#FFD4A8;
  --navy:#003580;--navy-lt:#E8EFF9;--navy-mid:#1A4FA0;
  --green-in:#138808;--green-lt:#E8F5E8;
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
.live-badge{display:flex;align-items:center;gap:7px;background:var(--saffron-lt);border:1px solid var(--saffron-md);border-radius:20px;padding:5px 14px;font-size:11px;font-weight:600;color:var(--saffron);font-family:var(--mono);letter-spacing:1px}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--saffron);animation:blink 1.2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

.top-nav{background:var(--navy);display:flex;align-items:stretch;padding:0 28px;box-shadow:0 3px 14px rgba(0,53,128,0.25)}
.top-nav a{color:rgba(255,255,255,0.75);text-decoration:none;padding:0 14px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;border-bottom:3px solid transparent;transition:all .2s;height:46px;white-space:nowrap}
.top-nav a:hover{color:#fff;background:rgba(255,255,255,0.07)}
.top-nav a.active{color:#fff;border-bottom-color:var(--saffron)}
.nav-sp{flex:1}
.nav-vote{background:var(--saffron)!important;color:#fff!important;font-weight:700!important;border-bottom:3px solid #c84e00!important;padding:0 22px!important}
.nav-vote:hover{background:#e05a00!important}

.ledger-wrap{max-width:1100px;margin:0 auto;padding:40px 24px 60px}

.page-eye{font-family:var(--mono);font-size:10px;letter-spacing:2.5px;color:var(--saffron);text-transform:uppercase;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.page-eye::before{content:'';width:18px;height:2px;background:var(--saffron);display:block}
.page-title-main{font-family:var(--serif);font-size:clamp(22px,3vw,30px);font-weight:700;color:var(--text);margin-bottom:6px}
.page-sub{font-size:14px;color:var(--muted);margin-bottom:32px;max-width:580px}

.toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px}
.search-wrap{flex:1;min-width:240px;position:relative}
.search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--subtle)}
.search-inp{width:100%;background:var(--white);border:1.5px solid var(--border);border-radius:6px;padding:10px 14px 10px 38px;font-family:var(--mono);font-size:13px;color:var(--text);outline:none;transition:border-color .2s}
.search-inp:focus{border-color:var(--navy)}
.search-inp::placeholder{color:var(--subtle)}

.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:4px;font-size:13px;font-weight:600;font-family:var(--sans);cursor:pointer;border:none;text-decoration:none;transition:all .2s}
.btn-navy{background:var(--navy);color:#fff}
.btn-navy:hover{background:var(--navy-mid)}
.btn-outline{background:transparent;color:var(--navy);border:1.5px solid var(--navy)}
.btn-outline:hover{background:var(--navy-lt)}
.btn-saffron{background:var(--saffron);color:#fff;box-shadow:0 3px 12px rgba(255,107,0,0.3)}
.btn-saffron:hover{background:#e05a00}

.warn-bar{background:#FFF8EC;border:1px solid #f5d78e;color:#92600a;border-radius:8px;padding:11px 16px;font-size:12px;display:flex;align-items:center;gap:9px;margin-bottom:16px;font-family:var(--mono)}

.stats-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px}
.stat-c{background:var(--white);border:1.5px solid var(--border);border-radius:10px;padding:16px 18px;display:flex;align-items:center;gap:12px}
.stat-ic{width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ic-o{background:var(--saffron-lt);color:var(--saffron)}
.ic-b{background:var(--navy-lt);color:var(--navy)}
.ic-g{background:var(--green-lt);color:var(--green-in)}
.stat-val{font-family:var(--mono);font-size:18px;font-weight:700;color:var(--navy);line-height:1}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-top:3px}

.ledger-box{background:var(--white);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,53,128,0.07)}
.ledger-hd{background:var(--navy);padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
.ledger-hd-t{color:#fff;font-weight:700;font-size:14px;font-family:var(--serif)}
.live-tag{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10px;color:#90ee90;letter-spacing:1px}
.ltd{width:6px;height:6px;border-radius:50%;background:#90ee90;animation:blink 1.2s infinite}

.l-table{width:100%;border-collapse:collapse;font-size:13px}
.l-table th{background:var(--surface);padding:11px 18px;text-align:left;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);font-family:var(--mono);cursor:pointer;white-space:nowrap;user-select:none}
.l-table th:hover{background:var(--navy-lt);color:var(--navy)}
.l-table td{padding:13px 18px;border-bottom:1px solid #F0F2F7;color:var(--text);vertical-align:middle}
.l-table tr:last-child td{border-bottom:none}
.l-table tr:hover td{background:var(--navy-lt)}
.l-table tr.my-row td{background:var(--saffron-lt)}
.l-table tr.my-row:hover td{background:#ffe0c0}
.hash-cell{font-family:var(--mono);color:var(--navy);font-size:11px}
.rec-num{font-family:var(--mono);font-size:12px;color:var(--muted)}
.pill-ok{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;background:var(--green-lt);color:var(--green-in);font-size:10px;font-weight:700;font-family:var(--mono)}
.pdot{width:5px;height:5px;border-radius:50%;background:currentColor}
.pill-mine{background:var(--saffron-lt);color:var(--saffron)}

.empty-state{padding:60px 20px;text-align:center;color:var(--muted)}
.empty-state svg{margin:0 auto 12px;display:block;opacity:.4}
.empty-state p{font-size:14px}

.pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--border);flex-wrap:wrap;gap:8px}
.page-info{font-size:12px;color:var(--muted);font-family:var(--mono)}
.page-btns{display:flex;gap:6px}
.page-btn{width:32px;height:32px;border-radius:4px;border:1.5px solid var(--border);background:var(--white);color:var(--text);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.page-btn:hover{border-color:var(--navy);color:var(--navy)}
.page-btn.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.page-btn:disabled{opacity:.4;cursor:not-allowed}

.loading-box{padding:60px 20px;text-align:center}
.spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--saffron);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 14px}
@keyframes spin{to{transform:rotate(360deg)}}

@media(max-width:640px){
  .ledger-wrap{padding:24px 14px 48px}
  .stats-strip{grid-template-columns:1fr 1fr}
}
`;

const CANDIDATE_NAMES = {
  CANDIDATE_A: "Arjun Rao",
  CANDIDATE_B: "Meera Nair",
  CANDIDATE_C: "Rakesh Singh",
};

const PAGE_SIZE = 15;

export default function PublicLedger() {
  const navigate = useNavigate();
  const [ledger,   setLedger]   = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [page,     setPage]     = useState(1);
  const [sortDir,  setSortDir]  = useState("desc");
  const myHash = (() => { try { return JSON.parse(localStorage.getItem("voteReceipt") || "{}").txHash || ""; } catch { return ""; } })();

  useEffect(() => { fetchLedger(); }, []);

  const fetchLedger = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/results/Karnataka");
      if (res.ok) {
        const data = await res.json();
        const rows = [];
        let block = 1;
        for (const [id, count] of Object.entries(data.perCandidate || {})) {
          for (let i = 0; i < count; i++) {
            rows.push({
              block: block++,
              displayName: CANDIDATE_NAMES[id] || id,
              hash: "0x" + Math.random().toString(16).substring(2, 66),
              timestamp: new Date(Date.now() - Math.random() * 100000000).toLocaleString(),
            });
          }
        }
        maybeAddMyVote(rows, rows.length + 1);
        rows.sort((a, b) => b.block - a.block);
        setLedger(rows);
      } else throw new Error("API error");
    } catch {
      const sim = [];
      const ids = ["CANDIDATE_A", "CANDIDATE_B", "CANDIDATE_C"];
      for (let i = 1; i <= 300; i++) {
        const id = ids[Math.floor(Math.random() * 3)];
        sim.push({
          block: i,
          displayName: CANDIDATE_NAMES[id],
          hash: "0x" + Math.random().toString(16).substring(2, 66),
          timestamp: new Date(Date.now() - Math.random() * 100000000).toLocaleString(),
        });
      }
      maybeAddMyVote(sim, 301);
      sim.sort((a, b) => b.block - a.block);
      setLedger(sim);
      setError("System is in demo mode — showing sample data");
    }
    setLoading(false);
  };

  function maybeAddMyVote(rows, nextBlock) {
    try {
      const receipt = localStorage.getItem("voteReceipt");
      if (!receipt) return;
      const v = JSON.parse(receipt);
      rows.push({
        block: nextBlock,
        displayName: v.candidate,
        hash: v.txHash || ("0x" + Math.random().toString(16).substring(2, 66)),
        timestamp: v.timestamp,
        isMyVote: true,
      });
    } catch {}
  }

  const filtered = ledger
    .filter(e =>
      e.hash.toLowerCase().includes(search.toLowerCase()) ||
      e.displayName.toLowerCase().includes(search.toLowerCase()) ||
      e.block.toString().includes(search)
    )
    .sort((a, b) => sortDir === "desc" ? b.block - a.block : a.block - b.block);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <>
      <style>{STYLES}</style>
      <div className="tricolor-bar" />

      <div className="page-hdr">
        <Landmark size={40} color="var(--navy)" />
        <div className="hdr-id">
          <div className="hdr-hindi">भारत निर्वाचन आयोग</div>
          <div className="hdr-title">Election Commission of India</div>
          <div className="hdr-tag">PUBLIC VOTE RECORDS · GENERAL ASSEMBLY ELECTION 2026 · SOUTH DISTRICT</div>
        </div>
        <div className="live-badge"><div className="live-dot" />LIVE RECORDS</div>
      </div>

      <nav className="top-nav">
        <a href="/"><Home size={14} /> Home</a>
        <a href="/ledger" className="active"><BookOpen size={14} /> Vote Records</a>
        <a href="/results"><BarChart3 size={14} /> Results</a>
        <div className="nav-sp" />
        <a href="/auth" className="nav-vote"><Vote size={14} /> Cast Vote</a>
      </nav>

      <div className="ledger-wrap">
        <div className="page-eye"><BookOpen size={12} /> Public Records</div>
        <div className="page-title-main">Public Vote Confirmation Records</div>
        <div className="page-sub">
          Every confirmed vote is listed here. Your identity is never shown — only your anonymous receipt code.
          Use the search bar to check that your own vote appears correctly.
        </div>

        {error && (
          <div className="warn-bar">
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* Stats strip */}
        <div className="stats-strip">
          <div className="stat-c">
            <div className="stat-ic ic-o"><Vote size={17} /></div>
            <div><div className="stat-val">{ledger.length.toLocaleString("en-IN")}</div><div className="stat-lbl">Total Votes</div></div>
          </div>
          <div className="stat-c">
            <div className="stat-ic ic-b"><Filter size={17} /></div>
            <div><div className="stat-val">{filtered.length.toLocaleString("en-IN")}</div><div className="stat-lbl">Shown</div></div>
          </div>
          <div className="stat-c">
            <div className="stat-ic ic-g"><BookOpen size={17} /></div>
            <div><div className="stat-val">#{ledger[0]?.block || "—"}</div><div className="stat-lbl">Latest Record</div></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <Search size={15} className="search-ico" />
            <input
              className="search-inp"
              type="text"
              placeholder="Search by receipt code, record number, or candidate name…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline" onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}>
            {sortDir === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {sortDir === "desc" ? "Newest First" : "Oldest First"}
          </button>
          <button className="btn btn-navy" onClick={fetchLedger}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="ledger-box">
          <div className="ledger-hd">
            <span className="ledger-hd-t">Confirmed Vote Records — South District</span>
            <span className="live-tag"><span className="ltd" />LIVE</span>
          </div>

          {loading ? (
            <div className="loading-box">
              <div className="spinner" />
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Loading vote records…</p>
            </div>
          ) : pageData.length === 0 ? (
            <div className="empty-state">
              <Search size={36} />
              <p>No records match your search. Try a different receipt code or candidate name.</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="l-table">
                  <thead>
                    <tr>
                      <th onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}>
                        Record No. {sortDir === "desc" ? <ChevronDown size={11} style={{display:"inline"}} /> : <ChevronUp size={11} style={{display:"inline"}} />}
                      </th>
                      <th>Voted For</th>
                      <th>Receipt Code</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((e, i) => (
                      <tr key={i} className={e.isMyVote || e.hash === myHash ? "my-row" : ""}>
                        <td className="rec-num">#{e.block}</td>
                        <td style={{ fontWeight: 600 }}>{e.displayName}</td>
                        <td className="hash-cell">{e.hash.slice(0, 20)}…</td>
                        <td style={{ color: "var(--subtle)", fontFamily: "var(--mono)", fontSize: 11 }}>{e.timestamp}</td>
                        <td>
                          {e.isMyVote || e.hash === myHash
                            ? <span className="pill-ok pill-mine"><span className="pdot" />Your Vote</span>
                            : <span className="pill-ok"><span className="pdot" />Confirmed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span className="page-info">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
                </span>
                <div className="page-btns">
                  <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return p <= totalPages
                      ? <button key={p} className={`page-btn ${p === page ? "on" : ""}`} onClick={() => setPage(p)}>{p}</button>
                      : null;
                  })}
                  <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-saffron" onClick={() => navigate("/auth")}><Vote size={14} /> Cast Your Vote</button>
          <button className="btn btn-outline" onClick={() => navigate("/")}><Home size={14} /> Back to Home</button>
        </div>
      </div>
    </>
  );
}