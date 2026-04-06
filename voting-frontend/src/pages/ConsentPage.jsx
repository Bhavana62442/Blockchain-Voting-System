import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Landmark, Shield, CheckCircle, AlertCircle, FileCheck, User, Clock, Target, ChevronRight, X } from "lucide-react";

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
.page-hdr { background: var(--white); border-bottom: 2px solid var(--border); display: flex; align-items: center; padding: 14px 28px; gap: 16px; box-shadow: 0 1px 4px rgba(0,53,128,0.06); }
.hdr-id { flex: 1; }
.hdr-hindi { font-family: var(--serif); font-size: 12px; color: var(--saffron); font-style: italic; }
.hdr-title { font-family: var(--serif); font-size: 17px; font-weight: 700; color: var(--navy); }
.hdr-tag { font-size: 10px; color: var(--muted); letter-spacing: 0.8px; margin-top: 2px; }
.secure-badge { display: flex; align-items: center; gap: 7px; background: var(--green-lt); border: 1px solid #a8d8a8; border-radius: 20px; padding: 5px 14px; font-size: 11px; font-weight: 600; color: var(--green-in); font-family: var(--mono); letter-spacing: 1px; }
.top-nav { background: var(--navy); display: flex; align-items: stretch; padding: 0 28px; box-shadow: 0 3px 14px rgba(0,53,128,0.25); }
.top-nav a { color: rgba(255,255,255,0.75); text-decoration: none; padding: 0 14px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; border-bottom: 3px solid transparent; transition: all .2s; height: 46px; }
.top-nav a:hover { color: #fff; background: rgba(255,255,255,0.07); }
.nav-sp { flex: 1; }
.nav-active { background: var(--saffron) !important; color: #fff !important; font-weight: 700 !important; border-bottom: 3px solid #c84e00 !important; padding: 0 22px !important; }

.consent-wrap { max-width: 600px; margin: 0 auto; padding: 48px 24px 80px; animation: fadeUp 0.4s ease both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

.auth-eyebrow { font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px; color: var(--saffron); text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.auth-eyebrow::before { content: ''; width: 18px; height: 2px; background: var(--saffron); display: block; }
.auth-title { font-family: var(--serif); font-size: clamp(22px, 3vw, 28px); font-weight: 700; color: var(--text); margin-bottom: 6px; }
.auth-sub { font-size: 14px; color: var(--muted); margin-bottom: 32px; }

.consent-card { background: var(--white); border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 14px rgba(0,53,128,0.08); margin-bottom: 16px; }
.consent-card-hd { background: var(--navy); padding: 16px 24px; display: flex; align-items: center; gap: 12px; }
.consent-card-hd-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
.consent-card-hd-t { color: #fff; font-weight: 700; font-size: 14px; font-family: var(--serif); }
.consent-card-hd-s { color: rgba(255,255,255,0.6); font-size: 11px; font-family: var(--mono); }
.consent-body { padding: 24px; }

.requester-row { display: flex; align-items: center; gap: 12px; background: var(--navy-lt); border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; }
.req-icon { width: 40px; height: 40px; background: var(--navy); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.req-text { font-size: 13px; color: var(--muted); }
.req-text strong { color: var(--navy); font-size: 14px; display: block; margin-bottom: 2px; }

.section-label { font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.section-label svg { color: var(--saffron); }

.consent-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); gap: 12px; }
.consent-item:last-child { border-bottom: none; }
.consent-item-label { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text); }
.consent-item-label span { font-family: var(--mono); font-size: 11px; color: var(--muted); }

.toggle { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: var(--border); border-radius: 22px; transition: .2s; }
.toggle-slider:before { position: absolute; content: ''; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .2s; }
input:checked + .toggle-slider { background: var(--green-in); }
input:checked + .toggle-slider:before { transform: translateX(18px); }

.divider { height: 1px; background: var(--border); margin: 20px 0; }

.meta-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); padding: 8px 0; }
.meta-row svg { color: var(--navy); flex-shrink: 0; }
.meta-row strong { color: var(--text); }

.error-bar { background: #FFF0F0; border: 1px solid #FFD0D0; color: #bb0000; border-radius: 8px; padding: 12px 16px; font-size: 13px; display: flex; align-items: center; gap: 9px; margin-bottom: 16px; }

.consent-disclaimer { font-size: 13px; color: var(--muted); background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; line-height: 1.6; }
.consent-disclaimer strong { color: var(--text); }

.action-row { display: flex; gap: 12px; }
.btn-allow { flex: 1; background: var(--saffron); color: #fff; border: none; border-radius: 6px; padding: 14px 24px; font-size: 15px; font-weight: 700; font-family: var(--sans); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .2s; box-shadow: 0 3px 12px rgba(255,107,0,0.3); }
.btn-allow:hover:not(:disabled) { background: #e05a00; transform: translateY(-1px); }
.btn-allow:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.btn-deny { background: transparent; color: var(--navy); border: 1.5px solid var(--border); border-radius: 6px; padding: 14px 20px; font-size: 14px; font-weight: 600; font-family: var(--sans); cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all .2s; }
.btn-deny:hover { background: #FFF0F0; border-color: #FFD0D0; color: #bb0000; }

.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

export default function ConsentPage() {
  const navigate = useNavigate();
  const [aadhaar, setAadhaar] = useState(true);
  const [voterId, setVoterId] = useState(true);
  const [dl,      setDl]      = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleAllow = async () => {
    setError("");
    setLoading(true);

    try {
      const phone = localStorage.getItem("authPhone");
      if (!phone) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const blindingFactor = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const encoder        = new TextEncoder();
      const dataBuffer     = encoder.encode(phone + Date.now().toString() + blindingFactor);
      const hashBuffer     = await crypto.subtle.digest("SHA-256", dataBuffer);
      const blindedHash    = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0")).join("");

      const mspRes = await fetch("http://localhost:8080/issue-token", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone, blinded: blindedHash })
      });

      if (!mspRes.ok) {
        const errText = await mspRes.text();
        throw new Error("MSP error: " + errText);
      }

      const { token, signature } = await mspRes.json();

      try {
        const regRes = await fetch("http://localhost:4000/api/voter/register", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            voterHashID: token,
            randomness:  signature,
            mspID:       "KarnatakaMSP"
          })
        });
        const regData = await regRes.json();
        if (!regRes.ok && !regData.error?.includes("already registered")) {
          console.warn("Blockchain register warning:", JSON.stringify(regData));
        } else {
          console.log("✅ Voter registered on blockchain");
        }
      } catch (regErr) {
        console.warn("Blockchain API not running — skipping register:", regErr.message);
      }

      localStorage.setItem("votingToken",    token);
      localStorage.setItem("signature",      signature);
      localStorage.setItem("blindingFactor", blindingFactor);
      navigate("/vote");

    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="tricolor-bar" />

      <div className="page-hdr">
        <Landmark size={40} color="var(--navy)" />
        <div className="hdr-id">
          <div className="hdr-hindi">भारत निर्वाचन आयोग</div>
          <div className="hdr-title">Election Commission of India</div>
          <div className="hdr-tag">DIGILOCKER CONSENT · IDENTITY VERIFICATION</div>
        </div>
        <div className="secure-badge"><Shield size={12} /> SECURED</div>
      </div>

      <nav className="top-nav">
        <a href="/">Home</a>
        <a href="/ledger">Vote Records</a>
        <a href="/results">Results</a>
        <div className="nav-sp" />
        <a href="/auth" className="nav-active">Cast Vote</a>
      </nav>

      <div className="consent-wrap">
        <div className="auth-eyebrow"><FileCheck size={12} /> Consent Required</div>
        <div className="auth-title">Share Your Documents</div>
        <div className="auth-sub">Review and approve the information to be shared with the Secure Voting Portal.</div>

        <div className="consent-card">
          <div className="consent-card-hd">
            <div className="consent-card-hd-icon"><FileCheck size={18} /></div>
            <div>
              <div className="consent-card-hd-t">DigiLocker Consent Request</div>
              <div className="consent-card-hd-s">GOVT. OF INDIA · SECURE PORTAL</div>
            </div>
          </div>

          <div className="consent-body">
            <div className="requester-row">
              <div className="req-icon"><Target size={18} /></div>
              <div className="req-text">
                <strong>Secure Voting Portal — Election Commission of India</strong>
                Requesting access to verify your eligibility to vote in the 2026 General Assembly Election.
              </div>
            </div>

            <div className="section-label"><FileCheck size={12} /> Issued Documents</div>

            <div className="consent-item">
              <div className="consent-item-label">
                <CheckCircle size={16} color="var(--green-in)" />
                Aadhaar Verification <span>(XXXX 3325)</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={aadhaar} onChange={() => setAadhaar(!aadhaar)} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="consent-item">
              <div className="consent-item-label">
                <CheckCircle size={16} color="var(--green-in)" />
                Voter ID Authentication <span>(XXXX 6789)</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={voterId} onChange={() => setVoterId(!voterId)} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="consent-item">
              <div className="consent-item-label">
                <CheckCircle size={16} color={dl ? "var(--green-in)" : "var(--border)"} />
                Driving License <span>(optional)</span>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={dl} onChange={() => setDl(!dl)} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="divider" />

            <div className="section-label"><User size={12} /> Profile Information</div>
            <div className="meta-row"><User size={14} /> <span>Name, Date of Birth, Gender</span></div>

            <div className="divider" />

            <div className="meta-row"><Clock size={14} /> <strong>Consent Validity:</strong>&nbsp; 30 days from today</div>
            <div className="meta-row"><Target size={14} /> <strong>Purpose:</strong>&nbsp; Identity verification for Secure Electronic Voting System</div>

            <div className="divider" />

            <div className="consent-disclaimer">
              By clicking <strong>Allow</strong>, you consent to share the selected information with the voting portal for identity verification. Your vote remains completely anonymous.
            </div>

            {error && (
              <div className="error-bar">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div className="action-row">
              <button className="btn-deny" onClick={() => navigate("/")}>
                <X size={14} /> Deny
              </button>
              <button className="btn-allow" onClick={handleAllow} disabled={loading}>
                {loading
                  ? <><div className="spinner" /> Processing…</>
                  : <>Allow Access <ChevronRight size={16} /></>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}