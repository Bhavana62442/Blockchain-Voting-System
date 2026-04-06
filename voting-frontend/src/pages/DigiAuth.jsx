import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Shield, ChevronRight, AlertCircle, Fingerprint } from "lucide-react";

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
.secure-badge { display: flex; align-items: center; gap: 7px; background: var(--green-lt); border: 1px solid #a8d8a8; border-radius: 20px; padding: 5px 14px; font-size: 11px; font-weight: 600; color: var(--green-in); font-family: var(--mono); letter-spacing: 1px; }

.top-nav { background: var(--navy); display: flex; align-items: stretch; padding: 0 28px; box-shadow: 0 3px 14px rgba(0,53,128,0.25); }
.top-nav a { color: rgba(255,255,255,0.75); text-decoration: none; padding: 0 14px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; border-bottom: 3px solid transparent; transition: all .2s; height: 46px; }
.top-nav a:hover { color: #fff; background: rgba(255,255,255,0.07); }
.nav-sp { flex: 1; }
.nav-active { background: var(--saffron) !important; color: #fff !important; font-weight: 700 !important; border-bottom: 3px solid #c84e00 !important; padding: 0 22px !important; }

.auth-wrap { max-width: 480px; margin: 0 auto; padding: 48px 24px 80px; animation: fadeUp 0.4s ease both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

.auth-eyebrow { font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px; color: var(--saffron); text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.auth-eyebrow::before { content: ''; width: 18px; height: 2px; background: var(--saffron); display: block; }
.auth-title { font-family: var(--serif); font-size: clamp(22px, 3vw, 28px); font-weight: 700; color: var(--text); margin-bottom: 6px; }
.auth-sub { font-size: 14px; color: var(--muted); margin-bottom: 32px; }

.auth-card {
  background: var(--white); border: 1.5px solid var(--border); border-radius: 12px;
  overflow: hidden; box-shadow: 0 2px 14px rgba(0,53,128,0.08);
}
.auth-card-hd {
  background: var(--navy); padding: 16px 24px;
  display: flex; align-items: center; gap: 12px;
}
.auth-card-hd-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
.auth-card-hd-t { color: #fff; font-weight: 700; font-size: 14px; font-family: var(--serif); }
.auth-card-hd-s { color: rgba(255,255,255,0.6); font-size: 11px; font-family: var(--mono); }

.auth-body { padding: 28px 24px; }

.field-group { margin-bottom: 20px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; font-family: var(--mono); margin-bottom: 8px; display: block; }
.field-input {
  width: 100%; background: var(--surface); border: 1.5px solid var(--border);
  border-radius: 6px; padding: 12px 14px; font-family: var(--mono); font-size: 14px;
  color: var(--text); outline: none; transition: border-color .2s;
}
.field-input:focus { border-color: var(--navy); background: var(--white); }
.field-input::placeholder { color: var(--subtle); }
.field-prefix { display: flex; align-items: center; gap: 0; }
.prefix-tag {
  background: var(--navy-lt); border: 1.5px solid var(--border); border-right: none;
  border-radius: 6px 0 0 6px; padding: 12px 14px; font-family: var(--mono);
  font-size: 13px; color: var(--navy); font-weight: 600; white-space: nowrap;
}
.prefix-tag + .field-input { border-radius: 0 6px 6px 0; }

.error-bar { background: #FFF0F0; border: 1px solid #FFD0D0; color: #bb0000; border-radius: 8px; padding: 12px 16px; font-size: 13px; display: flex; align-items: center; gap: 9px; margin-bottom: 20px; }

.btn-submit {
  width: 100%; background: var(--saffron); color: #fff; border: none;
  border-radius: 6px; padding: 14px 24px; font-size: 15px; font-weight: 700;
  font-family: var(--sans); cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px; transition: all .2s;
  box-shadow: 0 3px 12px rgba(255,107,0,0.3);
}
.btn-submit:hover:not(:disabled) { background: #e05a00; transform: translateY(-1px); }
.btn-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; }

.trust-strip { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
.trust-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted); background: var(--white); border: 1px solid var(--border); border-radius: 6px; padding: 8px 14px; }
.trust-item svg { color: var(--green-in); }

.digilocker-banner {
  display: flex; align-items: center; gap: 12px;
  background: var(--navy-lt); border: 1px solid var(--border);
  border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;
}
.dl-logo { width: 36px; height: 36px; background: var(--navy); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: var(--mono); font-size: 10px; font-weight: 700; flex-shrink: 0; }
.dl-text { font-size: 12px; color: var(--muted); }
.dl-text strong { color: var(--navy); display: block; font-size: 13px; margin-bottom: 2px; }

.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

export default function DigiAuth() {
  const navigate = useNavigate();
  const [mobile,  setMobile]  = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (mobile.length !== 10 || aadhaar.length !== 4) {
      setError("Enter a valid 10-digit mobile number and 4-digit Aadhaar.");
      return;
    }

    try {
      setLoading(true);
      const res  = await fetch("http://localhost:3000/auth/start", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone: mobile, aadhaarLast4: aadhaar })
      });
      const data = await res.json();

      if (data.error) {
        setError("Details not found. Please check your mobile and Aadhaar.");
        setLoading(false);
        return;
      }

      localStorage.setItem("phone",     mobile);
      localStorage.setItem("authPhone", mobile);
      navigate("/otp-verify");

    } catch {
      setError("Cannot connect to auth server. Is it running on port 3000?");
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
          <div className="hdr-tag">SECURE VOTER AUTHENTICATION · GENERAL ASSEMBLY ELECTION 2026</div>
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

      <div className="auth-wrap">
        <div className="auth-eyebrow"><Fingerprint size={12} /> Identity Verification</div>
        <div className="auth-title">Verify Your Identity</div>
        <div className="auth-sub">Authenticate via DigiLocker to access the secure voting portal.</div>

        <div className="digilocker-banner">
          <div className="dl-logo">DL</div>
          <div className="dl-text">
            <strong>DigiLocker Integration</strong>
            Your identity is verified via the Government of India's DigiLocker system. No personal data is stored.
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-hd">
            <div className="auth-card-hd-icon"><Shield size={18} /></div>
            <div>
              <div className="auth-card-hd-t">Voter Authentication</div>
              <div className="auth-card-hd-s">END-TO-END ENCRYPTED</div>
            </div>
          </div>

          <div className="auth-body">
            <form onSubmit={handleVerify}>
              <div className="field-group">
                <label className="field-label">Mobile Number</label>
                <div className="field-prefix">
                  <span className="prefix-tag">+91</span>
                  <input
                    className="field-input"
                    type="text" maxLength="10" placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Last 4 Digits of Aadhaar</label>
                <input
                  className="field-input"
                  type="password" maxLength="4" placeholder="XXXX"
                  value={aadhaar}
                  onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              {error && (
                <div className="error-bar">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <button className="btn-submit" disabled={loading}>
                {loading
                  ? <><div className="spinner" /> Verifying…</>
                  : <>Continue <ChevronRight size={16} /></>
                }
              </button>
            </form>
          </div>
        </div>

        <div className="trust-strip">
          <div className="trust-item"><Shield size={13} /> Identity never stored</div>
          <div className="trust-item"><Shield size={13} /> DigiLocker verified</div>
          <div className="trust-item"><Shield size={13} /> Govt. of India secured</div>
        </div>
      </div>
    </>
  );
}