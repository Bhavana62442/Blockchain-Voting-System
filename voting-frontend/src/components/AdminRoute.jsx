import { Navigate } from "react-router-dom";

/**
 * AdminRoute — protects admin pages
 *
 * Usage in App.js:
 *   <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
 *   <Route path="/admin-ledger" element={<AdminRoute allowedRoles={["senior"]}><AdminLedger /></AdminRoute>} />
 *
 * roles:
 *   "officer" — can see dashboard, ledger, redactions
 *   "senior"  — can see everything including senior redactions + results control
 */
export default function AdminRoute({ children, allowedRoles }) {

  const role = localStorage.getItem("adminRole");

  // Not logged in at all → go to admin login
  if (!role) {
    return <Navigate to="/admin-login" replace />;
  }

  // Role restriction — e.g. only senior can access certain pages
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
