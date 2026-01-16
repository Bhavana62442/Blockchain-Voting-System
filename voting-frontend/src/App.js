import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Vote from "./pages/Vote";
import VoteStatus from "./pages/VoteStatus";
import Results from "./pages/Results";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AboutElection from "./pages/AboutElection";
import HowToVote from "./pages/HowToVote";
import HelpFAQs from "./pages/HelpFAQs";
import PublicLedger from "./pages/PublicLedger";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/vote-status" element={<VoteStatus />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about-election" element={<AboutElection />} />
        <Route path="/how-to-vote" element={<HowToVote />} />
        <Route path="/help-faqs" element={<HelpFAQs />} />
        <Route path="/ledger" element={<PublicLedger />} />
      </Routes>
    </BrowserRouter>
  );
}
