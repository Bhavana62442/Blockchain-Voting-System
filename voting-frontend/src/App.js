import { BrowserRouter, Routes, Route } from "react-router-dom";
import Vote from "./pages/Vote";
import VoteStatus from "./pages/VoteStatus";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Vote />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/vote-status" element={<VoteStatus />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// UI verified
