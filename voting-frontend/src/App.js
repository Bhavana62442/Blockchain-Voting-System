import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import SideMenu from "./components/SideMenu";

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
  useEffect(()=>{

localStorage.removeItem("voteReceipt");
localStorage.removeItem("redactionRequests");
localStorage.removeItem("adminForwarded");

localStorage.setItem("resultsPublished","false");

},[])

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

      {/* Side Menu */}
      {showMenu && (
        <SideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <Routes>

        {/* Public Pages */}

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/about-election" element={<AboutElection />} />

        <Route path="/how-to-vote" element={<HowToVote />} />

        <Route path="/help-faqs" element={<HelpFAQs />} />

        <Route path="/results" element={<Results />} />

        <Route path="/ledger" element={<PublicLedger />} />


        {/* Voting Flow */}

        <Route path="/auth" element={<DigiAuth />} />

        <Route path="/otp-verify" element={<OTPVerify />} />

        <Route path="/consent" element={<ConsentPage />} />

        <Route path="/vote" element={<Vote />} />

        <Route path="/vote-status" element={<VoteStatus />} />

        <Route path="/redact-vote" element={<RedactVote />} />


        {/* Admin */}

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin-ledger" element={<AdminLedger />} />

        <Route path="/admin-results" element={<Results />} />

        <Route path="/admin-redactions" element={<AdminRedactions />} />


<Route path="/admin-senior-redactions" element={<AdminSeniorRedactions/>}/>
<Route path="/admin-results-control" element={<AdminResultsControl />} />
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