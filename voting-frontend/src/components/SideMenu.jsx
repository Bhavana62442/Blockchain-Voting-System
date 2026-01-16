import { useNavigate } from "react-router-dom";

export default function SideMenu({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`side-drawer-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`side-drawer ${open ? "open" : ""}`}>
        <div className="side-drawer-header">
          <h3>Election Services</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <ul className="side-drawer-list">
          <li onClick={() => { navigate("/"); onClose(); }}>
            Home
          </li>

          <li onClick={() => { navigate("/about-election"); onClose(); }}>
            About Election
          </li>

          <li onClick={() => { navigate("/how-to-vote"); onClose(); }}>
            How to Vote
          </li>

          <li onClick={() => { navigate("/help-faqs"); onClose(); }}>
            Help & FAQs
          </li>

          <li onClick={() => { navigate("/results"); onClose(); }}>
            Results
          </li>
          <li onClick={() => { navigate("/ledger"); onClose(); }}>
            Public Ledger
          </li>

          <li onClick={() => { navigate("/admin-login"); onClose(); }}>
            Admin Login
          </li>
        </ul>

        <p className="side-drawer-footer">
          Official Academic Prototype<br />
          Election Commission of India
        </p>
      </aside>
    </>
  );
}
