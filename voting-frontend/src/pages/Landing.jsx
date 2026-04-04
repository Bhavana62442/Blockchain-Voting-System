import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Vote,
  Shield,
  User,
  Search,
  CheckCircle,
  Link,
  BarChart3,
  Zap,
  BookOpen,
  CreditCard,
  Sprout,
  Flame,
  Scale,
  PackageCheck,
  Save,
  Scroll,
  Home,
  Key,
  Landmark,
  Monitor,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Users,
  Globe,
  FileCheck,
  CheckSquare,
  AlertCircle,
} from "lucide-react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --saffron:    #FF6B00;
  --saffron-lt: #FFF3E8;
  --saffron-md: #FFD4A8;
  --navy:       #003580;
  --navy-lt:    #E8EFF9;
  --navy-mid:   #1A4FA0;
  --green-in:   #138808;
  --green-lt:   #E8F5E8;
  --gold:       #C8922A;
  --gold-lt:    #FFF8EC;
  --bg:         #F4F6FA;
  --white:      #FFFFFF;
  --surface:    #FAFBFD;
  --border:     #DDE3EE;
  --text:       #1A2340;
  --muted:      #5A6480;
  --subtle:     #8892A8;
  --serif:  'Noto Serif', Georgia, serif;
  --sans:   'DM Sans', sans-serif;
  --mono:   'JetBrains Mono', monospace;
}

html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--sans); overflow-x: hidden; line-height: 1.65; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--saffron); border-radius: 3px; }

.tricolor-bar { height: 5px; background: linear-gradient(90deg, var(--saffron) 0% 33.3%, #fff 33.3% 66.6%, var(--green-in) 66.6% 100%); }

.access-bar {
  background: #111827; display: flex; align-items: center; justify-content: space-between;
  padding: 5px 28px; font-size: 11px; color: #7a8aaa;
}
.access-bar a { color: #7a8aaa; text-decoration: none; transition: color .2s; }
.access-bar a:hover { color: #fff; }
.access-tools { display: flex; gap: 8px; }
.acc-btn {
  background: rgba(255,255,255,0.08); border: none; color: #aab; padding: 2px 8px;
  border-radius: 3px; font-size: 11px; cursor: pointer; font-family: var(--sans); transition: all .2s;
}
.acc-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
.acc-btn.inv { background: #fff; color: #000; }
.acc-btn.inv2 { background: #000; color: #fff; border: 1px solid #555; }

.eci-bar {
  background: var(--white); border-bottom: 2px solid var(--border);
  display: flex; align-items: center; padding: 14px 28px; gap: 18px;
  box-shadow: 0 1px 4px rgba(0,53,128,0.06);
}
.eci-emblem { color: var(--navy); flex-shrink: 0; }
.eci-identity { flex: 1; }
.eci-hindi { font-family: var(--serif); font-size: 13px; color: var(--saffron); font-style: italic; }
.eci-identity h1 { font-family: var(--serif); font-size: 19px; font-weight: 700; color: var(--navy); line-height: 1.2; }
.eci-tagline { font-size: 10px; color: var(--muted); letter-spacing: 0.8px; margin-top: 2px; font-family: var(--sans); }
.eci-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.live-badge {
  display: flex; align-items: center; gap: 7px;
  background: var(--saffron-lt); border: 1px solid var(--saffron-md);
  border-radius: 20px; padding: 5px 14px;
  font-size: 11px; font-weight: 600; color: var(--saffron); font-family: var(--mono); letter-spacing: 1px;
}
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--saffron); animation: blink 1.2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

.gov-nav {
  background: var(--navy); position: sticky; top: 0; z-index: 100;
  display: flex; align-items: stretch; padding: 0 28px;
  box-shadow: 0 3px 14px rgba(0,53,128,0.25);
}
.nav-links-wrap { display: flex; align-items: stretch; flex: 1; }
.gov-nav a {
  color: rgba(255,255,255,0.78); text-decoration: none; padding: 0 16px;
  font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;
  border-bottom: 3px solid transparent; transition: all .2s; white-space: nowrap;
}
.gov-nav a:hover { color: #fff; background: rgba(255,255,255,0.07); }
.gov-nav a.active { color: #fff; border-bottom-color: var(--saffron); }
.nav-spacer { flex: 1; }
.nav-vote-btn {
  background: var(--saffron) !important; color: #fff !important;
  border-radius: 0 !important; padding: 0 22px !important;
  font-weight: 700 !important; border-bottom: 3px solid #c84e00 !important;
}
.nav-vote-btn:hover { background: #e05a00 !important; }
.hamburger { display: none; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 0 12px; margin-left: auto; align-items: center; }

.ticker-wrap { background: var(--navy); overflow: hidden; padding: 8px 0; border-bottom: 3px solid var(--saffron); }
.ticker { display: flex; gap: 40px; animation: scroll-t 28s linear infinite; white-space: nowrap; }
@keyframes scroll-t { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.t-item { display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: var(--mono); color: rgba(255,255,255,0.65); flex-shrink: 0; }
.t-sep { color: var(--saffron); }
.t-hi { color: var(--saffron-md); font-weight: 600; }

.hero-wrap { position: relative; height: 500px; overflow: hidden; }
.hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.3s ease; display: flex; align-items: flex-end; }
.hero-slide.active { opacity: 1; }
.slide-0 { background: linear-gradient(120deg,rgba(0,53,128,0.88) 0%,rgba(0,0,0,0.35) 55%,transparent 100%), #1a3a6b; }
.slide-1 { background: linear-gradient(120deg,rgba(150,60,0,0.82) 0%,rgba(0,0,0,0.3) 55%,transparent 100%), #5c2000; }
.slide-2 { background: linear-gradient(120deg,rgba(0,100,15,0.78) 0%,rgba(0,0,0,0.3) 55%,transparent 100%), #0e4009; }

.slide-art {
  position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center;
  overflow: hidden; pointer-events: none;
}
.slide-art svg { width: 100%; max-width: 960px; opacity: 0.13; }

.hero-wm { position: absolute; right: 48px; top: 50%; transform: translateY(-50%); font-size: 200px; opacity: 0.06; pointer-events: none; line-height: 1; color: #fff; }

.hero-content { position: relative; z-index: 2; padding: 40px 48px; max-width: 680px; color: #fff; }
.hero-eyebrow {
  font-family: var(--mono); font-size: 10px; letter-spacing: 3px;
  color: var(--saffron-md); margin-bottom: 10px; text-transform: uppercase;
  display: flex; align-items: center; gap: 8px;
}
.hero-eyebrow::before { content:''; width:24px; height:2px; background:var(--saffron); display:block; }
.hero-title { font-family: var(--serif); font-size: clamp(24px,4vw,42px); font-weight: 700; line-height: 1.18; letter-spacing: -0.4px; margin-bottom: 12px; text-shadow: 0 2px 12px rgba(0,0,0,0.35); }
.hero-title span { color: var(--saffron-md); }
.hero-desc { font-size: 14px; color: rgba(255,255,255,0.8); max-width: 500px; margin-bottom: 26px; line-height: 1.75; }
.hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }

.btn { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; border-radius: 4px; font-size: 13px; font-weight: 600; font-family: var(--sans); cursor: pointer; border: none; text-decoration: none; transition: all .2s; }
.btn-saffron { background: var(--saffron); color: #fff; box-shadow: 0 3px 12px rgba(255,107,0,0.35); }
.btn-saffron:hover { background: #e05a00; transform: translateY(-1px); }
.btn-wh { background: rgba(255,255,255,0.12); color: #fff; border: 1.5px solid rgba(255,255,255,0.4); }
.btn-wh:hover { background: rgba(255,255,255,0.2); }
.btn-navy { background: var(--navy); color: #fff; }
.btn-navy:hover { background: var(--navy-mid); transform: translateY(-1px); }
.btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--navy); }
.btn-outline:hover { background: var(--navy-lt); }

.slide-dots { position: absolute; bottom: 18px; right: 28px; display: flex; gap: 8px; z-index: 3; }
.sdot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); border: none; cursor: pointer; transition: all .3s; }
.sdot.on { background: var(--saffron); transform: scale(1.35); }
.sarrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.28); color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; transition: all .2s; backdrop-filter: blur(4px); }
.sarrow:hover { background: rgba(255,255,255,0.26); }
.sarrow.L { left: 14px; } .sarrow.R { right: 14px; }

.stats-bar { background: var(--white); border-bottom: 1px solid var(--border); display: flex; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,53,128,0.06); }
.stat-item { flex: 1; min-width: 140px; padding: 16px 18px; border-right: 1px solid var(--border); display: flex; align-items: center; gap: 13px; transition: background .2s; }
.stat-item:hover { background: var(--navy-lt); }
.stat-item:last-child { border-right: none; }
.stat-ico { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--navy); }
.ico-o { background: var(--saffron-lt); color: var(--saffron) !important; }
.ico-b { background: var(--navy-lt); }
.ico-g { background: var(--green-lt); color: var(--green-in) !important; }
.ico-y { background: var(--gold-lt); color: var(--gold) !important; }
.stat-val { font-family: var(--mono); font-size: 20px; font-weight: 700; color: var(--navy); line-height: 1; }
.stat-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 3px; }

.sec { padding: 56px 28px; }
.sec.alt { background: var(--surface); }
.sec.dark { background: var(--navy); color: #fff; }
.inner { max-width: 1160px; margin: 0 auto; }
.s-eyebrow { font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px; color: var(--saffron); text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.s-eyebrow::before { content:''; width:18px; height:2px; background:var(--saffron); display:block; }
.s-title { font-family: var(--serif); font-size: clamp(20px,3vw,30px); font-weight: 700; color: var(--text); letter-spacing: -0.4px; line-height: 1.2; }
.s-title.w { color: #fff; }
.s-sub { color: var(--muted); font-size: 14px; margin-top: 7px; max-width: 520px; }
.s-sub.w { color: rgba(255,255,255,0.65); }
.s-hd { margin-bottom: 32px; }

.divider { display: flex; align-items: center; gap: 14px; margin: 0 28px; }
.divider::before,.divider::after { content:''; flex:1; height:1px; background:var(--border); }
.divider-ico { display: flex; align-items: center; color: var(--saffron); opacity: 0.55; }

.chain-row { display: flex; align-items: center; overflow-x: auto; padding-bottom: 10px; scrollbar-width: thin; scrollbar-color: var(--saffron) var(--border); }
.cblock {
  min-width: 185px; flex-shrink: 0; background: var(--white); border: 1.5px solid var(--border);
  border-radius: 10px; padding: 15px 16px; cursor: default; transition: all .25s; position: relative; overflow: hidden;
}
.cblock::before { content:''; position:absolute; top:0;left:0;right:0; height:3px; background:var(--navy); }
.cblock.pend::before { background: var(--saffron); }
.cblock:hover { border-color: var(--navy); box-shadow: 0 4px 16px rgba(0,53,128,0.12); transform: translateY(-2px); }
.cb-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.cb-num { font-family:var(--mono); font-size:11px; color:var(--muted); font-weight:600; }
.cb-badge { font-size:9px; padding:2px 7px; border-radius:3px; font-family:var(--mono); font-weight:700; letter-spacing:.5px; }
.b-ok { background:var(--green-lt); color:var(--green-in); }
.b-wait { background:var(--saffron-lt); color:var(--saffron); }
.cb-hash { font-family:var(--mono); font-size:10px; color:var(--navy); margin-bottom:6px; word-break:break-all; }
.cb-meta { font-size:11px; color:var(--subtle); display:flex; justify-content:space-between; }
.chain-arrow { color: var(--navy-mid); padding:0 6px; flex-shrink:0; align-self:center; display:flex; }

.steps-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1px; background:var(--border); border-radius:12px; overflow:hidden; border:1px solid var(--border); }
.step-card { background:var(--white); padding:26px 20px; cursor:default; transition:background .2s; position:relative; }
.step-card:hover { background:var(--navy-lt); }
.step-card::after { content:''; position:absolute; bottom:0;left:0;right:0; height:3px; background:transparent; transition:background .2s; }
.step-card:hover::after { background:var(--saffron); }
.sn { font-family:var(--mono); font-size:34px; font-weight:700; color:var(--border); line-height:1; margin-bottom:10px; transition:color .2s; }
.step-card:hover .sn { color:var(--saffron-md); }
.si { margin-bottom:9px; color: var(--navy); display:flex; }
.sname { font-family:var(--serif); font-size:14px; font-weight:700; color:var(--navy); margin-bottom:5px; }
.sdesc { font-size:12px; color:var(--muted); line-height:1.6; }

.cand-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); gap:14px; }
.cand-card { background:var(--white); border:1.5px solid var(--border); border-radius:10px; padding:22px; display:flex; gap:16px; align-items:center; transition:all .25s; cursor:default; }
.cand-card:hover { border-color:var(--saffron); box-shadow:0 4px 20px rgba(255,107,0,0.1); }
.cand-av { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,var(--navy-lt),var(--saffron-lt)); border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; color: var(--navy); }
.c-name { font-family:var(--serif); font-size:16px; font-weight:700; color:var(--navy); }
.c-party { font-size:12px; color:var(--muted); margin-top:2px; }
.c-sym { margin-top:4px; color: var(--saffron); display:flex; }
.c-id { display:inline-block; margin-top:6px; font-family:var(--mono); font-size:10px; padding:2px 8px; background:var(--navy-lt); color:var(--navy); border-radius:3px; }

.ledger-box { background:var(--white); border:1.5px solid var(--border); border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,53,128,0.07); }
.ledger-hd { background:var(--navy); padding:14px 20px; display:flex; align-items:center; justify-content:space-between; }
.ledger-hd-t { color:#fff; font-weight:700; font-size:14px; font-family:var(--serif); }
.live-tag { display:flex; align-items:center; gap:6px; font-family:var(--mono); font-size:10px; color:#90ee90; letter-spacing:1px; }
.ltd { width:6px; height:6px; border-radius:50%; background:#90ee90; animation:blink 1.2s infinite; }
.l-table { width:100%; border-collapse:collapse; font-size:12px; }
.l-table th { background:var(--surface); padding:10px 16px; text-align:left; font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border); font-family:var(--mono); }
.l-table td { padding:12px 16px; border-bottom:1px solid #F0F2F7; color:var(--text); font-size:12px; vertical-align:middle; }
.l-table tr:hover td { background:var(--navy-lt); }
.h-val { font-family:var(--mono); color:var(--navy); font-size:11px; }
.pill-ok { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; background:var(--green-lt); color:var(--green-in); font-size:10px; font-weight:700; font-family:var(--mono); }
.pdot { width:5px; height:5px; border-radius:50%; background:currentColor; }

.verify-card { background:var(--white); border:1.5px solid var(--border); border-radius:12px; padding:36px; max-width:680px; margin:0 auto; box-shadow:0 2px 14px rgba(0,53,128,0.07); }
.verify-card h3 { font-family:var(--serif); font-size:20px; color:var(--navy); margin-bottom:6px; }
.verify-card p { font-size:13px; color:var(--muted); margin-bottom:22px; }
.v-row { display:flex; gap:10px; flex-wrap:wrap; }
.v-inp { flex:1; min-width:210px; background:var(--bg); border:1.5px solid var(--border); border-radius:6px; padding:11px 14px; font-family:var(--mono); font-size:13px; color:var(--text); outline:none; transition:border-color .2s; }
.v-inp:focus { border-color:var(--navy); }
.v-inp::placeholder { color:var(--subtle); }
.v-res { margin-top:14px; padding:13px 16px; border-radius:8px; font-family:var(--mono); font-size:12px; }
.v-ok { background:var(--green-lt); border:1px solid #b5e0b5; color:#095e00; }
.v-err { background:#FFF0F0; border:1px solid #FFD0D0; color:#bb0000; }

.feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }
.feat-card { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.11); border-radius:10px; padding:24px; transition:all .25s; }
.feat-card:hover { background:rgba(255,255,255,0.13); transform:translateY(-2px); }
.f-ico { width:42px; height:42px; border-radius:8px; background:rgba(255,107,0,0.2); display:flex; align-items:center; justify-content:center; color: var(--saffron-md); margin-bottom:13px; }
.f-t { font-weight:700; font-size:14px; color:#fff; margin-bottom:6px; }
.f-d { font-size:12px; color:rgba(255,255,255,0.58); line-height:1.6; }

.about-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; }
.tech-box { background:var(--navy-lt); border-radius:12px; padding:28px; border:1.5px solid var(--border); }
.tech-row { font-size:13px; color:var(--navy); line-height:2.2; }
.tech-row-item { display:flex; align-items:center; gap:9px; }
.tech-row-item svg { flex-shrink:0; color: var(--saffron); }

.footer { background:#0f1b36; color:rgba(255,255,255,0.68); padding:40px 28px 20px; }
.f-inner { max-width:1160px; margin:0 auto; }
.f-top { display:flex; gap:36px; flex-wrap:wrap; margin-bottom:30px; }
.f-brand { flex:1; min-width:200px; }
.f-brand h4 { font-family:var(--serif); color:#fff; font-size:15px; margin-bottom:8px; display:flex; align-items:center; gap:8px; }
.f-brand p { font-size:12px; color:rgba(255,255,255,0.45); line-height:1.75; }
.f-col { min-width:150px; }
.f-col h5 { color:rgba(255,255,255,0.85); font-size:11px; text-transform:uppercase; letter-spacing:1px; margin-bottom:13px; font-family:var(--mono); }
.f-col a { display:block; font-size:13px; color:rgba(255,255,255,0.45); text-decoration:none; margin-bottom:7px; transition:color .2s; }
.f-col a:hover { color:var(--saffron); }
.f-bot { border-top:1px solid rgba(255,255,255,0.09); padding-top:14px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; font-size:11px; color:rgba(255,255,255,0.3); font-family:var(--mono); }
.f-tricolor { height:3px; background:linear-gradient(90deg,var(--saffron) 0% 33.3%,#fff 33.3% 66.6%,var(--green-in) 66.6% 100%); margin-top:18px; border-radius:2px; }

.fab { position:fixed; bottom:26px; right:26px; z-index:90; background:var(--saffron); color:#fff; border:none; border-radius:50px; padding:12px 20px; font-size:14px; font-weight:700; font-family:var(--sans); cursor:pointer; display:flex; align-items:center; gap:7px; box-shadow:0 4px 20px rgba(255,107,0,0.45); transition:all .2s; }
.fab:hover { background:#e05a00; transform:scale(1.04); }

.dov { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:200; backdrop-filter:blur(3px); }
.drawer { position:fixed; top:0; right:0; bottom:0; width:255px; background:var(--white); border-left:2px solid var(--border); z-index:201; display:flex; flex-direction:column; overflow:hidden; }
.d-hd { background:var(--navy); padding:15px 18px; display:flex; align-items:center; justify-content:space-between; color:#fff; font-weight:700; font-family:var(--serif); }
.d-close { background:none; border:none; color:rgba(255,255,255,0.65); font-size:20px; cursor:pointer; }
.d-links { padding:14px; display:flex; flex-direction:column; gap:4px; }
.d-links a { padding:10px 14px; border-radius:6px; font-size:13px; color:var(--text); text-decoration:none; transition:all .2s; display:flex; align-items:center; gap:8px; }
.d-links a:hover { background:var(--navy-lt); color:var(--navy); }
.d-vote { margin:10px 14px; padding:12px; text-align:center; border-radius:6px; background:var(--saffron); color:#fff; font-weight:700; text-decoration:none; font-size:14px; display:flex; align-items:center; justify-content:center; gap:8px; }

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.fu { animation:fadeUp .55s ease both; }
.d1{animation-delay:.08s} .d2{animation-delay:.18s} .d3{animation-delay:.28s} .d4{animation-delay:.38s}

@media(max-width:768px){
  .nav-links-wrap { display:none; }
  .hamburger { display:flex !important; }
  .hero-content { padding:28px 20px; }
  .hero-wrap { height:400px; }
  .sec { padding:36px 16px; }
  .about-grid { grid-template-columns:1fr; }
  .verify-card { padding:22px 16px; }
  .f-top { flex-direction:column; gap:22px; }
  .f-bot { flex-direction:column; text-align:center; }
  .eci-right { display:none; }
  .hero-wm { display:none; }
}
`;

const SLIDES = [
  {
    eyebrow: "Election Commission of India · 2026",
    titleParts: ["India's Most ", "Secure", " Election — Now Online"],
    desc: "Vote from anywhere in India with complete confidence. Every vote is locked and sealed the moment you submit it — no changes, no tampering, ever.",
    b1Label: "Cast Your Vote",
    b2Label: "See All Votes",
    cls: "slide-0",
    b1Nav: "/auth",
    b2Nav: "/ledger",
  },
  {
    eyebrow: "Secured by Multiple Independent Authorities",
    titleParts: ["Your Vote Is Counted ", "Fairly", " — Guaranteed"],
    desc: "Nine independent authorities must all agree before any vote is recorded. No single person or organisation can change the outcome.",
    b1Label: "Check Your Vote",
    b2Label: "View Results",
    cls: "slide-1",
    b1Nav: "#verify",
    b2Nav: "/results",
  },
  {
    eyebrow: "Aadhaar Verified · DigiLocker Authentication",
    titleParts: ["We Know It's ", "You", " — But Not How You Voted"],
    desc: "We verify who you are using your Aadhaar and DigiLocker. Once verified, your vote is completely private — not even election officials can see your choice.",
    b1Label: "Authenticate Now",
    b2Label: "Learn More",
    cls: "slide-2",
    b1Nav: "/auth",
    b2Nav: "#process",
  },
];

const CANDIDATES = [
  { name: "Arjun Rao",   party: "Progress Party",    icon: <Sprout size={20} />, id: "C001" },
  { name: "Meera Iyer",  party: "National Front",    icon: <Scale size={20} />,  id: "C002" },
  { name: "Ravi Singh",  party: "People's Alliance", icon: <Flame size={20} />,  id: "C003" },
];

const STEPS = [
  { n:"01", icon:<CreditCard size={20}/>, name:"Verify Your Identity",    d:"Log in and confirm who you are using your DigiLocker or Aadhaar credentials — the same way you access government services." },
  { n:"02", icon:<Vote size={20}/>,       name:"Choose Your Candidate",   d:"See the official ballot and select the candidate you want to vote for." },
  { n:"03", icon:<CheckCircle size={20}/>,name:"Submit Your Vote",        d:"Your vote is sealed and sent to nine independent authorities simultaneously for verification." },
  { n:"04", icon:<PackageCheck size={20}/>,name:"Vote Officially Counted",d:"All nine authorities confirm your vote. It is permanently and unchangeably recorded in the system." },
  { n:"05", icon:<Save size={20}/>,       name:"Receive Your Receipt",    d:"You get a unique receipt code so you can check that your vote was counted correctly at any time." },
  { n:"06", icon:<Search size={20}/>,     name:"Verify Anytime",          d:"Enter your receipt code on this portal to confirm your vote is exactly as you cast it." },
];

const FEATURES = [
  { icon:<Shield size={20}/>,      t:"Tamper-Proof Records",     d:"Once your vote is recorded, it cannot be changed, deleted, or altered by anyone — including election officials." },
  { icon:<Eye size={20}/>,         t:"Your Vote Stays Private",  d:"You are verified as a real voter, but no one — not even the Election Commission — can see which candidate you chose." },
  { icon:<Lock size={20}/>,        t:"Sealed the Moment You Vote",d:"Your vote is locked with a unique digital seal the instant you submit it. It is impossible to tamper with after that." },
  { icon:<CreditCard size={20}/>,  t:"Aadhaar Identity Check",   d:"Only registered voters can cast a vote. Your identity is confirmed using India's official Aadhaar system." },
  { icon:<Globe size={20}/>,       t:"Anyone Can Audit Results",  d:"The complete vote tally is publicly visible. Any citizen, journalist, or observer can independently verify the result." },
  { icon:<Zap size={20}/>,         t:"Results Updated Live",     d:"Vote counts update in real time as each vote is confirmed. No waiting until polls close to see progress." },
];

const LEDGER = [
  { h:"0x3a9f1c…e1b2", b:4824, c:"Arjun Rao",  t:"3s ago" },
  { h:"0x7d2ce4…a849", b:4824, c:"Meera Iyer", t:"9s ago" },
  { h:"0xf01278…7c3e", b:4823, c:"Ravi Singh", t:"21s ago" },
  { h:"0x881ab3…2f90", b:4823, c:"Arjun Rao",  t:"38s ago" },
  { h:"0xc45b92…d107", b:4822, c:"Meera Iyer", t:"1m ago" },
  { h:"0x29de45…cc01", b:4822, c:"Ravi Singh", t:"1m 14s ago" },
];

const TICKER = [
  "Votes Recorded: 14,893",
  "Authorities Online: 9/9",
  "Network: Secure",
  "Average Confirmation Time: 12s",
  "Election 2026: LIVE",
  "South District Polling Open",
  "All Systems: Operational",
  "Uptime: 100%",
];

function rH() {
  return "0x" + Array.from({ length: 10 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export default function Landing() {
  const navigate = useNavigate();
  const [slide, setSlide]       = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [votes, setVotes]       = useState(14893);
  const [blk, setBlk]           = useState(4824);
  const [vv, setVv]             = useState("");
  const [vr, setVr]             = useState(null);
  const [resultsPublished]      = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setVotes(v => v + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.65) setBlk(b => b + 1);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  function doVerify() {
    if (!vv.trim()) return;
    setVr(
      vv.startsWith("0x") && vv.length >= 8
        ? { ok: true, b: blk - 1 }
        : { ok: false }
    );
  }

  const ChainViz = () => (
    <div className="chain-row">
      {[...Array(6)].map((_, i) => {
        const isPend = i === 5;
        const num = blk - (5 - i);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div className="chain-arrow">
                <ChevronRight size={18} />
              </div>
            )}
            <div className={`cblock ${isPend ? "pend" : ""}`}>
              <div className="cb-top">
                <span className="cb-num">#{num}</span>
                <span className={`cb-badge ${isPend ? "b-wait" : "b-ok"}`}>
                  {isPend ? "PENDING" : "CONFIRMED"}
                </span>
              </div>
              <div className="cb-hash">{rH()}</div>
              <div className="cb-meta">
                <span>{Math.floor(Math.random() * 5) + 2} votes</span>
                <span>{i * 12 + 3}s ago</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>

      {menuOpen && (
        <>
          <div className="dov" onClick={() => setMenuOpen(false)} />
          <nav className="drawer">
            <div className="d-hd">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Vote size={18} /> VoteChain ECI
              </span>
              <button className="d-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="d-links">
              <a href="/"><Home size={16} /> Home</a>
              <a href="/login"><User size={16} /> Voter Login</a>
              <a href="/ledger"><BookOpen size={16} /> Vote Records</a>
              <a href="/results"><BarChart3 size={16} /> Results</a>
              <a href="/admin-login"><Key size={16} /> Admin Login</a>
            </div>
            <a href="/auth" className="d-vote"><Vote size={16} /> Cast Your Vote</a>
          </nav>
        </>
      )}

      <button className="fab" onClick={() => navigate(resultsPublished ? "/results" : "/auth")}>
        <Vote size={16} /> {resultsPublished ? "View Results" : "Cast Vote"}
      </button>

      {/* Tricolor */}
      <div className="tricolor-bar" />

      {/* Accessibility */}
      <div className="access-bar">
        <div style={{ display: "flex", gap: 14 }}>
          <a href="#main">Skip to main content</a>
          <span>|</span>
          <a href="/">Screen Reader</a>
          <span>|</span>
          <a href="/">हिंदी</a>
        </div>
        <div className="access-tools">
          <button className="acc-btn">A+</button>
          <button className="acc-btn">A</button>
          <button className="acc-btn">A-</button>
          <button className="acc-btn inv">A</button>
          <button className="acc-btn inv2">A</button>
        </div>
      </div>

      {/* ECI Identity bar */}
      <div className="eci-bar">
        <div className="eci-emblem"><Landmark size={44} /></div>
        <div className="eci-identity">
          <div className="eci-hindi">भारत निर्वाचन आयोग</div>
          <h1>Election Commission of India</h1>
          <div className="eci-tagline">SECURE ONLINE VOTING PORTAL · GENERAL ASSEMBLY ELECTION 2026 · SOUTH DISTRICT</div>
        </div>
        <div className="eci-right">
          <div className="live-badge"><div className="live-dot" />ELECTION LIVE</div>
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)" }}>सत्यमेव जयते</div>
        </div>
      </div>

      {/* Sticky nav */}
      <nav className="gov-nav">
        <div className="nav-links-wrap">
          <a href="/" className="active"><Home size={14} /> Home</a>
          <a href="/login"><User size={14} /> Voter Login</a>
          <a href="/ledger"><BookOpen size={14} /> Vote Records</a>
          <a href="/results"><BarChart3 size={14} /> Results</a>
          <a href="#process"><CheckSquare size={14} /> Voting Steps</a>
          <a href="#verify"><Search size={14} /> Verify Vote</a>
          <div className="nav-spacer" />
          <a href="/admin-login" style={{ borderLeft: "1px solid rgba(255,255,255,0.1)" }}><Key size={14} /> Admin</a>
          <a href="/auth" className="nav-vote-btn"><Vote size={14} /> Cast Vote</a>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(true)}>☰</button>
      </nav>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="t-item">
              <span className="t-sep">◆</span>
              {t.includes(":")
                ? <>{t.split(":")[0]}: <span className="t-hi">{t.split(":").slice(1).join(":")}</span></>
                : t}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="hero-wrap" id="main">
        {SLIDES.map((s, i) => (
          <div key={i} className={`hero-slide ${s.cls} ${i === slide ? "active" : ""}`}>
            <div className="slide-art">
              <svg viewBox="0 0 960 300" fill="white" xmlns="http://www.w3.org/2000/svg">
                <rect x="370" y="100" width="220" height="200" rx="2" />
                <rect x="388" y="82" width="184" height="26" />
                <rect x="406" y="60" width="148" height="28" />
                <rect x="434" y="38" width="92" height="26" />
                <rect x="456" y="18" width="48" height="24" />
                <rect x="470" y="4" width="20" height="18" />
                <ellipse cx="480" cy="100" rx="60" ry="28" />
                <ellipse cx="480" cy="88" rx="38" ry="18" />
                {[0,1,2,3,4,5,6,7,8,9].map(p => <rect key={p} x={380+p*24} y={122} width={10} height={178} />)}
                <rect x="200" y="145" width="155" height="155" rx="2" />
                <rect x="212" y="130" width="131" height="20" />
                {[0,1,2,3,4].map(p => <rect key={p} x={214+p*26} y={146} width={9} height={154} />)}
                <rect x="605" y="145" width="155" height="155" rx="2" />
                <rect x="617" y="130" width="131" height="20" />
                {[0,1,2,3,4].map(p => <rect key={p} x={619+p*26} y={146} width={9} height={154} />)}
                <rect x="80" y="185" width="105" height="115" rx="2" />
                <rect x="775" y="185" width="105" height="115" rx="2" />
                <rect x="0" y="295" width="960" height="5" />
              </svg>
            </div>
            <div className="hero-wm">✦</div>
            <div className="hero-content">
              <div className="hero-eyebrow fu">{s.eyebrow}</div>
              <h2 className="hero-title fu d1">
                {s.titleParts.map((part, pi) =>
                  pi === 1 ? <span key={pi}>{part}</span> : part
                )}
              </h2>
              <p className="hero-desc fu d2">{s.desc}</p>
              <div className="hero-btns fu d3">
                <button className="btn btn-saffron" onClick={() => navigate(s.b1Nav)}>
                  <Vote size={15} /> {s.b1Label}
                </button>
                <button className="btn btn-wh" onClick={() => navigate(s.b2Nav)}>
                  <BookOpen size={15} /> {s.b2Label}
                </button>
              </div>
            </div>
          </div>
        ))}
        <button className="sarrow L" onClick={() => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)}>
          <ChevronLeft size={20} />
        </button>
        <button className="sarrow R" onClick={() => setSlide(s => (s + 1) % SLIDES.length)}>
          <ChevronRight size={20} />
        </button>
        <div className="slide-dots">
          {SLIDES.map((_, i) => <button key={i} className={`sdot ${i === slide ? "on" : ""}`} onClick={() => setSlide(i)} />)}
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        {[
          { icon:<Vote size={18}/>,    cls:"ico-o", v:votes.toLocaleString("en-IN"), l:"Votes Cast" },
          { icon:<FileCheck size={18}/>,cls:"ico-b", v:`#${blk}`,                    l:"Latest Record" },
          { icon:<Monitor size={18}/>, cls:"ico-g", v:"9 / 9",                       l:"Authorities Online" },
          { icon:<Clock size={18}/>,   cls:"ico-y", v:"12s",                         l:"Confirmation Time" },
          { icon:<Users size={18}/>,   cls:"ico-o", v:"3",                           l:"Candidates" },
          { icon:<Lock size={18}/>,    cls:"ico-b", v:"100%",                        l:"Uptime" },
        ].map((s, i) => (
          <div className="stat-item" key={i}>
            <div className={`stat-ico ${s.cls}`}>{s.icon}</div>
            <div><div className="stat-val">{s.v}</div><div className="stat-lbl">{s.l}</div></div>
          </div>
        ))}
      </div>

      {/* Live vote records */}
      <div className="sec alt">
        <div className="inner">
          <div className="s-hd">
            <div className="s-eyebrow"><Link size={12} /> Live System</div>
            <div className="s-title">Votes Being Recorded — Live View</div>
            <div className="s-sub">Every vote is grouped and confirmed by all nine independent authorities before it becomes permanent and cannot be changed.</div>
          </div>
          <ChainViz />
        </div>
      </div>

      <div className="divider"><span className="divider-ico"><Shield size={16} /></span></div>

      {/* Process */}
      <div className="sec" id="process">
        <div className="inner">
          <div className="s-hd">
            <div className="s-eyebrow"><CheckSquare size={12} /> How It Works</div>
            <div className="s-title">How to Cast Your Vote</div>
            <div className="s-sub">Six simple steps from login to confirmation — designed for every Indian voter.</div>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="sn">{s.n}</div>
                <div className="si">{s.icon}</div>
                <div className="sname">{s.name}</div>
                <div className="sdesc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-ico"><Shield size={16} /></span></div>

      {/* Candidates */}
      <div className="sec alt">
        <div className="inner">
          <div className="s-hd">
            <div className="s-eyebrow"><Landmark size={12} /> Contestants</div>
            <div className="s-title">South District — Registered Candidates</div>
            <div className="s-sub">Officially registered candidates for General Assembly Election 2026.</div>
          </div>
          <div className="cand-grid">
            {CANDIDATES.map((c, i) => (
              <div className="cand-card" key={i}>
                <div className="cand-av"><User size={28} /></div>
                <div>
                  <div className="c-name">{c.name}</div>
                  <div className="c-party">{c.party}</div>
                  <div className="c-sym">{c.icon}</div>
                  <div className="c-id">{c.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-ico"><Shield size={16} /></span></div>

      {/* Ledger */}
      <div className="sec">
        <div className="inner">
          <div className="s-hd">
            <div className="s-eyebrow"><BookOpen size={12} /> Public Record</div>
            <div className="s-title">Live Vote Confirmation Feed</div>
            <div className="s-sub">A real-time record of every confirmed vote. Voter identity is never revealed — only your anonymous receipt code and record number are shown.</div>
          </div>
          <div className="ledger-box">
            <div className="ledger-hd">
              <span className="ledger-hd-t">Confirmed Vote Records — South District</span>
              <span className="live-tag"><span className="ltd" />LIVE</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="l-table">
                <thead>
                  <tr>
                    <th>Receipt Code</th>
                    <th>Record No.</th>
                    <th>Voted For</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {LEDGER.map((r, i) => (
                    <tr key={i}>
                      <td className="h-val">{r.h}</td>
                      <td style={{ fontFamily: "var(--mono)" }}>#{r.b}</td>
                      <td>{r.c}</td>
                      <td style={{ color: "var(--subtle)", fontFamily: "var(--mono)", fontSize: 11 }}>{r.t}</td>
                      <td><span className="pill-ok"><span className="pdot" />Confirmed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-ico"><Shield size={16} /></span></div>

      {/* Verify */}
      <div className="sec alt" id="verify">
        <div className="inner">
          <div className="s-hd" style={{ textAlign: "center" }}>
            <div className="s-eyebrow" style={{ justifyContent: "center" }}><Search size={12} /> Check Your Vote</div>
            <div className="s-title">Did Your Vote Get Counted?</div>
          </div>
          <div className="verify-card">
            <h3>Enter Your Receipt Code</h3>
            <p>After voting, you received a unique receipt code. Enter it below to confirm that your vote was correctly recorded and has not been changed.</p>
            <div className="v-row">
              <input
                className="v-inp"
                placeholder="Enter receipt code e.g. 0x3a9f1c…e1b2"
                value={vv}
                onChange={e => { setVv(e.target.value); setVr(null); }}
                onKeyDown={e => e.key === "Enter" && doVerify()}
              />
              <button className="btn btn-navy" onClick={doVerify}>
                <Search size={14} /> Check Now
              </button>
            </div>
            {vr && (
              <div className={`v-res ${vr.ok ? "v-ok" : "v-err"}`}>
                {vr.ok
                  ? `Your vote is confirmed in Record #${vr.b}. It is permanently recorded and has not been changed.`
                  : "Receipt code not found. Please double-check the code from your voting receipt and try again."}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-ico"><Shield size={16} /></span></div>

      {/* Features dark */}
      <div className="sec dark" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -30, top: -30, opacity: 0.04, lineHeight: 1, pointerEvents: "none", color: "#fff" }}>
          <Shield size={280} />
        </div>
        <div className="inner">
          <div className="s-hd">
            <div className="s-eyebrow" style={{ color: "rgba(255,165,80,0.9)" }}><Shield size={12} /> Why You Can Trust This System</div>
            <div className="s-title w">Your Vote Is Completely Safe</div>
            <div className="s-sub w">Six ways this system protects every Indian voter.</div>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <div className="feat-card" key={i}>
                <div className="f-ico">{f.icon}</div>
                <div className="f-t">{f.t}</div>
                <div className="f-d">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="sec">
        <div className="inner">
          <div className="about-grid">
            <div>
              <div className="s-eyebrow"><AlertCircle size={12} /> About</div>
              <div className="s-title">About This System</div>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, marginTop: 12, maxWidth: 480 }}>
                This portal is an academic research prototype showing how advanced digital security technology
                can make India's democratic process more transparent and trustworthy. Votes are independently
                verified by nine separate authorities, your identity is confirmed via Aadhaar and DigiLocker,
                and every vote is sealed permanently the moment it is cast — while keeping your choice completely private.
              </p>
              <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="btn btn-saffron" onClick={() => navigate(resultsPublished ? "/results" : "/auth")}>
                  <Vote size={15} /> {resultsPublished ? "View Results" : "Cast Your Vote"}
                </button>
                <button className="btn btn-outline" onClick={() => navigate("/ledger")}>
                  <BookOpen size={15} /> Public Vote Records
                </button>
              </div>
            </div>
            <div className="tech-box">
              <div className="tech-row">
                <div className="tech-row-item"><Shield size={14} /> <span><b>Votes verified by:</b> Nine independent authorities</span></div>
                <div className="tech-row-item"><CheckCircle size={14} /> <span><b>Agreement required:</b> All 9 must confirm each vote</span></div>
                <div className="tech-row-item"><Lock size={14} /> <span><b>Identity check:</b> DigiLocker + Aadhaar</span></div>
                <div className="tech-row-item"><Eye size={14} /> <span><b>Vote privacy:</b> Your choice is never revealed</span></div>
                <div className="tech-row-item"><Monitor size={14} /> <span><b>Authorities online:</b> 9 of 9</span></div>
                <div className="tech-row-item"><Clock size={14} /> <span><b>Confirmation time:</b> ~12 seconds</span></div>
                <div className="tech-row-item"><Globe size={14} /> <span><b>Vote records:</b> Publicly viewable by anyone</span></div>
                <div className="tech-row-item"><Landmark size={14} /> <span><b>Operated by:</b> Election Commission of India</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="f-inner">
          <div className="f-top">
            <div className="f-brand">
              <h4><Landmark size={16} /> Election Commission of India</h4>
              <p>VoteChain is an academic research prototype demonstrating a transparent, secure, and publicly auditable online voting system for India's democratic process.</p>
              <div style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                भारत निर्वाचन आयोग · सत्यमेव जयते
              </div>
            </div>
            <div className="f-col">
              <h5>Voting</h5>
              <a href="/auth">Cast Your Vote</a>
              <a href="/login">Voter Login</a>
              <a href="/results">Election Results</a>
              <a href="/ledger">Public Vote Records</a>
            </div>
            <div className="f-col">
              <h5>Help</h5>
              <a href="#process">How Voting Works</a>
              <a href="#verify">Check Your Vote</a>
              <a href="/admin-login">Admin Portal</a>
            </div>
            <div className="f-col">
              <h5>Official Links</h5>
              <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in ↗</a>
              <a href="https://digilocker.gov.in" target="_blank" rel="noopener noreferrer">DigiLocker ↗</a>
              <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer">india.gov.in ↗</a>
            </div>
          </div>
          <div className="f-bot">
            <span>© 2026 VoteChain · Election Commission of India · Academic Research Prototype</span>
            <span>General Assembly Election 2026 · Digitally Secured</span>
          </div>
          <div className="f-tricolor" />
        </div>
      </footer>
    </>
  );
}