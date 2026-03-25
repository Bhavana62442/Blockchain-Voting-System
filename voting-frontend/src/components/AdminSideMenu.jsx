import { useNavigate } from "react-router-dom";

export default function AdminSideMenu({ open, onClose }) {

const navigate = useNavigate();
const role = localStorage.getItem("adminRole");

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

<ul className="side-drawer-list">

<li onClick={() => { navigate("/admin"); onClose(); }}>
Dashboard
</li>

<li onClick={() => { navigate("/admin-ledger"); onClose(); }}>
Blockchain Ledger
</li>

{/* OFFICER MENU */}
{role === "officer" && (
<li onClick={() => { navigate("/admin-redactions"); onClose(); }}>
Review Complaints
</li>
)}

{/* SENIOR MENU */}
{role === "senior" && (
<>
<li onClick={() => { navigate("/admin-senior-redactions"); onClose(); }}>
Redaction Approval
</li>

<li onClick={() => { navigate("/admin-results-control"); onClose(); }}>
Publish Results
</li>
</>
)}

<li onClick={() => { navigate("/admin-login"); onClose(); }}>
Logout
</li>

</ul>

</aside>
</>
);
}