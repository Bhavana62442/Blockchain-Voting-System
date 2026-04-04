import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import SideMenu from "./components/SideMenu";
import AdminRoute from "./components/AdminRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Vote from "./pages/Vote";
import VoteStatus from "./pages/VoteStatus";
import Results from "./pages/Results";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLedger from "./pages/AdminLedger";
import AdminRedactions from "./pages/AdminRedactions";

import AboutElection from "./pages/AboutElection";
import HowToVote from "./pages/HowToVote";
import HelpFAQs from "./pages/HelpFAQs";
import PublicLedger from "./pages/PublicLedger";

import DigiAuth from "./pages/DigiAuth";
import OTPVerify from "./pages/OTPVerify";
import ConsentPage from "./pages/ConsentPage";
import AdminSeniorRedactions from "./pages/AdminSeniorRedactions";
import RedactVote from "./pages/RedactVote";
import AdminResultsControl from "./pages/AdminResultsControl";

function AppContent() {

  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.removeItem("voteReceipt");
    localStorage.removeItem("redactionRequests");
    localStorage.removeItem("adminForwarded");
    localStorage.setItem("resultsPublished", "false");
  }, []);

  const hideMenuPages = [
    "/login",
    "/vote",
    "/vote-status",
    "/auth",
    "/otp-verify",
    "/consent",
    "/admin",
    "/admin-ledger",
    "/admin-redactions",
    "/admin-senior-redactions",
    "/admin-results-control",
    "/admin-results"
  ];
  const showMenu = !hideMenuPages.includes(location.pathname);

  return (
    <>
      {showMenu && (
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      )}

      <Routes>

        {/* ── PUBLIC PAGES ─────────────────────────────────── */}
        <Route path="/"                element={<Landing />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/about-election"  element={<AboutElection />} />
        <Route path="/how-to-vote"     element={<HowToVote />} />
        <Route path="/help-faqs"       element={<HelpFAQs />} />
        <Route path="/results"         element={<Results />} />
        <Route path="/ledger"          element={<PublicLedger />} />

        {/* ── VOTER FLOW ───────────────────────────────────── */}
        <Route path="/auth"            element={<DigiAuth />} />
        <Route path="/otp-verify"      element={<OTPVerify />} />
        <Route path="/consent"         element={<ConsentPage />} />
        <Route path="/vote"            element={<Vote />} />
        <Route path="/vote-status"     element={<VoteStatus />} />
        <Route path="/redact-vote"     element={<RedactVote />} />

        {/* ── ADMIN LOGIN (public) ─────────────────────────── */}
        <Route path="/admin-login"     element={<AdminLogin />} />

        {/* ── ADMIN PAGES (protected) ──────────────────────── */}

        {/* Both officer and senior can access */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="/admin-ledger" element={
          <AdminRoute>
            <AdminLedger />
          </AdminRoute>
        } />

        <Route path="/admin-redactions" element={
          <AdminRoute>
            <AdminRedactions />
          </AdminRoute>
        } />

        <Route path="/admin-results" element={
          <AdminRoute>
            <Results />
          </AdminRoute>
        } />

        {/* Senior officer only */}
        <Route path="/admin-senior-redactions" element={
          <AdminRoute allowedRoles={["senior"]}>
            <AdminSeniorRedactions />
          </AdminRoute>
        } />

        <Route path="/admin-results-control" element={
          <AdminRoute allowedRoles={["senior"]}>
            <AdminResultsControl />
          </AdminRoute>
        } />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
