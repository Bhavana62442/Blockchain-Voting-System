import React from "react";

const AdminDashboard = () => {
  const handleStartElection = () => alert("Election Started");
  const handleStopElection = () => alert("Election Stopped");

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
      <button onClick={handleStartElection}>Start Election</button>
      <button onClick={handleStopElection}>Stop Election</button>
      <h3>Registered Voters</h3>
      <ul>
        <li>Voter1</li>
        <li>Voter2</li>
        <li>Voter3</li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
