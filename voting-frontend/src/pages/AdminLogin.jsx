import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, Home, Shield, Key, User, Lock,
  Eye, EyeOff, AlertCircle, ChevronRight, BookOpen, BarChart3,
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

.top-nav{background:var(--navy);display:flex;align-items:stretch;padding:0 28px;box-shadow:0 3px 14px rgba(0,53,128,0.25)}
.top-nav a{color:rgba(255,255,255,0.75);text-decoration:none;padding:0 14px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;border-bottom:3px solid transparent;transition:all .2s;height:46px;white-space:nowrap}
.top-nav a:hover{color:#fff;background:rgba(255,255,255,0.07)}
.top-nav a.active{color:#fff;border-bottom-color:var(--saffron)}
.nav-sp{flex:1}

.admin-outer{min-height:calc(100vh - 120px);display:flex;align-items:center;justify-content:center;padding:48px 20px}

.admin-card{
  background:var(--white);border:1.5px solid var(--border);border-radius:14px;
  width:100%;max-width:440px;overflow:hidden;
  box-shadow:0 8px 40px rgba(0,53,128,0.12);
}
.admin-card-top{
  background:var(--navy);padding:32px 32px 28px;position:relative;overflow:hidden;
}
.admin-card-top::after{
  content:'';position:absolute;right:-30px;top:-30px;width:140px;height:140px;
  border-radius:50%;background:rgba(255,255,255,0.04);pointer-events:none;
}
.admin-card-top::before{
  content:'';position:absolute;right:30px;top:30px;width:80px;height:80px;
  border-radius:50%;background:rgba(255,255,255,0.04);pointer-events:none;
}
.admin-shield-wrap{width:56px;height:56px;border-radius:12px;background:rgba(255,107,0,0.2);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.admin-card-title{font-family:var(--serif);font-size:22px;font-weight:700;color:#fff;margin-bottom:6px}
.admin-card-sub{font-size:13px;color:rgba(255,255,255,0.6)}
.restricted-tag{
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(255,107,0,0.18);border:1px solid rgba(255,107,0,0.35);
  border-radius:20px;padding:4px 12px;font-size:10px;font-weight:700;
  color:var(--saffron-md);font-family:var(--mono);letter-spacing:1px;margin-top:12px;
}

.admin-card-body{padding:28px 32px 32px}

.field-group{margin-bottom:18px}
.field-label{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px;font-family:var(--mono)}
.field-wrap{position:relative}
.field-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--subtle);pointer-events:none}
.field-inp{
  width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:6px;
  padding:11px 14px 11px 38px;font-family:var(--sans);font-size:14px;color:var(--text);
  outline:none;transition:border-color .2s;
}
.field-inp:focus{border-color:var(--navy);background:var(--white)}
.field-inp::placeholder{color:var(--subtle)}
.pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--subtle);transition:color .2s;display:flex;align-items:center}
.pw-toggle:hover{color:var(--navy)}

.error-bar{background:#FFF0F0;border:1px solid #FFD0D0;color:#bb0000;border-radius:8px;padding:11px 14px;font-size:13px;display:flex;align-items:center;gap:9px;margin-bottom:16px}

.login-btn{
  width:100%;padding:13px 20px;background:var(--saffron);color:#fff;border:none;border-radius:6px;
  font-size:15px;font-weight:700;font-family:var(--sans);cursor:pointer;transition:all .2s;
  display:flex;align-items:center;justify-content:center;gap:8px;
  box-shadow:0 3px 14px rgba(255,107,0,0.3);
}
.login-btn:hover{background:#e05a00;transform:translateY(-1px)}
.login-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}

.roles-strip{
  display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px;padding-top:18px;border-top:1px solid var(--border);
}
.role-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 14px}
.role-card-title{font-size:12px;font-weight:700;color:var(--navy);display:flex;align-items:center;gap:6px;margin-bottom:4px;font-family:var(--serif)}
.role-card-desc{font-size:11px;color:var(--muted);line-height:1.5}

.back-link{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);text-decoration:none;margin-bottom:20px;transition:color .2s;width:fit-content}
.back-link:hover{color:var(--navy)}
`;

export default function AdminLogin() {
  const navigate  = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === "officer" && password === "officer123") {
        localStorage.setItem("adminRole", "officer");
        navigate("/admin");
        return;
      }
      if (username === "senior" && password === "senior123") {
        localStorage.setItem("adminRole", "senior");
        navigate("/admin");
        return;
      }
      setError("Invalid credentials. Please check your username and password.");
      setLoading(false);
    }, 600);
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
          <div className="hdr-tag">ADMINISTRATION PORTAL · GENERAL ASSEMBLY ELECTION 2026</div>
        </div>
      </div>

      <nav className="top-nav">
        <a href="/"><Home size={14} /> Home</a>
        <a href="/ledger"><BookOpen size={14} /> Vote Records</a>
        <a href="/results"><BarChart3 size={14} /> Results</a>
        <div className="nav-sp" />
        <a href="/admin-login" className="active"><Key size={14} /> Admin Login</a>
      </nav>

      <div className="admin-outer">
        <div style={{ width: "100%", maxWidth: 440 }}>
          <a href="/" className="back-link"><Home size={13} /> Back to Home</a>

          <div className="admin-card">
            <div className="admin-card-top">
              <div className="admin-shield-wrap"><Shield size={28} color="var(--saffron-md)" /></div>
              <div className="admin-card-title">Administration Portal</div>
              <div className="admin-card-sub">Election Commission of India — South District</div>
              <div className="restricted-tag"><Lock size={10} /> AUTHORISED PERSONNEL ONLY</div>
            </div>

            <div className="admin-card-body">
              <form onSubmit={handleLogin}>
                <div className="field-group">
                  <label className="field-label"><User size={12} /> Username</label>
                  <div className="field-wrap">
                    <User size={15} className="field-ico" />
                    <input
                      className="field-inp"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label"><Lock size={12} /> Password</label>
                  <div className="field-wrap">
                    <Lock size={15} className="field-ico" />
                    <input
                      className="field-inp"
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-bar">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <button className="login-btn" type="submit" disabled={loading}>
                  {loading
                    ? <><span style={{ width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }} /> Verifying…</>
                    : <><Key size={15} /> Sign In to Portal <ChevronRight size={15} /></>
                  }
                </button>
              </form>

              {/* Role info */}
              <div className="roles-strip">
                <div className="role-card">
                  <div className="role-card-title"><User size={12} /> Officer</div>
                  <div className="role-card-desc">Access dashboard, view vote records, manage entries</div>
                </div>
                <div className="role-card">
                  <div className="role-card-title"><Shield size={12} /> Senior Officer</div>
                  <div className="role-card-desc">Full access including results control and approvals</div>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop:16, fontSize:11, color:"var(--subtle)", textAlign:"center", fontFamily:"var(--mono)" }}>
            This portal is monitored. Unauthorised access attempts are logged.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}