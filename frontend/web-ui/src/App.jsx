// web-ui/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import VoterLogin from "./pages/VoterLogin";
import AdminLogin from "./pages/AdminLogin";
import VotingDashboard from "./pages/VotingDashboard";
import VoteReceipt from "./pages/VoteReceipt";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/voter-login" element={<VoterLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/voting-dashboard" element={<VotingDashboard />} />
        <Route path="/receipt" element={<VoteReceipt />} />
      </Routes>
    </Router>
  );
}

export default App;
