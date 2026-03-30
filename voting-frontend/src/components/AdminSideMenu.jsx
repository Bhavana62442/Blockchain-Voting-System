import { useNavigate } from "react-router-dom";

export default function AdminSideMenu({ open, onClose }) {

  const navigate = useNavigate();
  const role     = localStorage.getItem("adminRole");

  const handleLogout = () => {
    localStorage.removeItem("adminRole");
    onClose();
    navigate("/admin-login");
  };

  return (
    <>
      <div
        className={`side-drawer-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`side-drawer ${open ? "open" : ""}`}>

        <div className="side-drawer-header">
          <h3>Election Admin</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Role badge */}
        <div style={{
          padding: "8px 16px",
          marginBottom: "8px",
          background: role === "senior" ? "#1f3b82" : "#4e73df",
          color: "#fff",
          fontSize: "12px",
          borderRadius: "4px",
          margin: "0 16px 12px",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          {role === "senior" ? "👑 Senior Officer" : "🔵 Election Officer"}
        </div>

        <ul className="side-drawer-list">

          <li onClick={() => { navigate("/admin"); onClose(); }}>
            📊 Dashboard
          </li>

          <li onClick={() => { navigate("/admin-ledger"); onClose(); }}>
            🔗 Blockchain Ledger
          </li>

          {/* Officer menu */}
          {role === "officer" && (
            <li onClick={() => { navigate("/admin-redactions"); onClose(); }}>
              📋 Review Complaints
            </li>
          )}

          {/* Senior menu */}
          {role === "senior" && (
            <>
              <li onClick={() => { navigate("/admin-redactions"); onClose(); }}>
                📋 Review Complaints
              </li>
              <li onClick={() => { navigate("/admin-senior-redactions"); onClose(); }}>
                ✅ Redaction Approval
              </li>
              <li onClick={() => { navigate("/admin-results-control"); onClose(); }}>
                📣 Publish Results
              </li>
            </>
          )}

        </ul>

        {/* Logout at bottom of drawer */}
        <div style={{ padding: "16px", borderTop: "1px solid #eee", marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px",
              background: "#fff",
              border: "1px solid #e74c3c",
              borderRadius: "8px",
              color: "#e74c3c",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🚪 Logout
          </button>
        </div>

      </aside>
    </>
  );
}
