import { useEffect, useState } from "react";
import AdminSideMenu from "../components/AdminSideMenu";

export default function AdminResults(){

const [menuOpen,setMenuOpen] = useState(false);

const [results,setResults] = useState({
"Arjun Rao":0,
"Meera Nair":0,
"Rakesh Singh":0
});

const [published,setPublished] = useState(false);

const role = localStorage.getItem("adminRole");

const totalEligible = 500;

useEffect(()=>{

let votes={
"Arjun Rao":0,
"Meera Nair":0,
"Rakesh Singh":0
};

/* simulate 300 votes */

for(let i=0;i<300;i++){

const r=Math.floor(Math.random()*3);

if(r===0) votes["Arjun Rao"]++;
if(r===1) votes["Meera Nair"]++;
if(r===2) votes["Rakesh Singh"]++;

}

/* include real vote */

const vote=localStorage.getItem("voteReceipt");

if(vote){

const v=JSON.parse(vote);
votes[v.candidate]++;

}

setResults(votes);

},[]);

const totalVotes =
results["Arjun Rao"] +
results["Meera Nair"] +
results["Rakesh Singh"];

const turnout = ((totalVotes/totalEligible)*100).toFixed(1);

const publishResults = ()=>{

setPublished(true);

};

return(

<div className="admin-page">

<button className="menu-btn" onClick={()=>setMenuOpen(true)}>☰</button>

<AdminSideMenu
open={menuOpen}
onClose={()=>setMenuOpen(false)}
/>

<div className="admin-container">

<h1>Election Results Dashboard</h1>

<div className="results-stats">

<div className="stat-card">
<h3>Total Eligible Voters</h3>
<p>{totalEligible}</p>
</div>

<div className="stat-card">
<h3>Votes Cast</h3>
<p>{totalVotes}</p>
</div>

<div className="stat-card">
<h3>Turnout</h3>
<p>{turnout}%</p>
</div>

</div>

<div className="results-table">

<h2>Candidate Results</h2>

<table>

<thead>

<tr>
<th>Candidate</th>
<th>Votes</th>
</tr>

</thead>

<tbody>

<tr>
<td>Arjun Rao</td>
<td>{results["Arjun Rao"]}</td>
</tr>

<tr>
<td>Meera Nair</td>
<td>{results["Meera Nair"]}</td>
</tr>

<tr>
<td>Rakesh Singh</td>
<td>{results["Rakesh Singh"]}</td>
</tr>

</tbody>

</table>

</div>

{/* Only senior can publish */}

{role === "senior" && !published && (

<button
className="publish-btn"
onClick={publishResults}
>

Publish Election Results

</button>

)}

{published && (

<div className="publish-success">

Results Published Successfully

</div>

)}

</div>

</div>

);

}