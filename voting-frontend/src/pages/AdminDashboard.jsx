import { useState } from "react";
import AdminSideMenu from "../components/AdminSideMenu";
import { Bar, Doughnut } from "react-chartjs-2";

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
);

export default function AdminDashboard(){

const [menuOpen,setMenuOpen] = useState(false);

const eligible = 1200;
const votes = 301;

const turnoutData = {
labels:["Votes Cast","Remaining"],
datasets:[
{
data:[votes,eligible-votes],
backgroundColor:["#1f3b82","#dfe6f3"]
}
]
};

const candidateData = {
labels:["Arjun Rao","Meera Nair","Rakesh Singh"],
datasets:[
{
label:"Votes",
data:[120,100,81],
backgroundColor:["#1f3b82","#4e73df","#9bb2ff"]
}
]
};

return(

<div className="admin-page">

<button
className="menu-btn"
onClick={()=>setMenuOpen(true)}
>
☰
</button>

<AdminSideMenu
open={menuOpen}
onClose={()=>setMenuOpen(false)}
/>

<div className="admin-container">

<h1>Election Administration Dashboard</h1>

<div className="admin-cards">

<div className="admin-card">
<h4>Eligible Voters</h4>
<p>{eligible}</p>
</div>

<div className="admin-card">
<h4>Votes Cast</h4>
<p>{votes}</p>
</div>

<div className="admin-card">
<h4>Turnout</h4>
<p>{Math.round((votes/eligible)*100)}%</p>
</div>

<div className="admin-card">
<h4>Redaction Requests</h4>
<p>0</p>
</div>

</div>

<div className="admin-charts">

<div className="chart-box">
<h3>Voter Turnout</h3>
<Doughnut data={turnoutData}/>
</div>

<div className="chart-box">
<h3>Candidate Vote Distribution</h3>
<Bar data={candidateData}/>
</div>

</div>

<div className="admin-panel">

<h3>Election Monitoring</h3>

<ul>
<li>Blockchain ledger active</li>
<li>Votes recorded securely</li>
<li>Public verification enabled</li>
<li>Redaction monitoring active</li>
</ul>

</div>

</div>

</div>

);
}