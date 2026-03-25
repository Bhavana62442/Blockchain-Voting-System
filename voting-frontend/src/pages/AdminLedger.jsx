import { useEffect, useState } from "react";
import AdminSideMenu from "../components/AdminSideMenu";

export default function AdminLedger(){

const [menuOpen,setMenuOpen] = useState(false);
const [ledger,setLedger] = useState([]);
const [search,setSearch] = useState("");

const candidates=[
"Arjun Rao",
"Meera Nair",
"Rakesh Singh"
];

useEffect(()=>{

let simulatedVotes=[];

for(let i=1;i<=300;i++){

simulatedVotes.push({

block:i,
candidate:candidates[Math.floor(Math.random()*3)],
hash:"0x"+Math.random().toString(16).substring(2,66),
timestamp:new Date(
Date.now()-Math.random()*100000000
).toLocaleString()

});

}

const vote = localStorage.getItem("voteReceipt");

if(vote){

const v = JSON.parse(vote);

simulatedVotes.push({
block:301,
candidate:v.candidate,
hash:v.hash,
timestamp:v.timestamp
});

}

/* Add complaint hashes so admins can investigate */

const complaint = JSON.parse(localStorage.getItem("redactComplaint"));

if(complaint){

simulatedVotes.push({
block:302,
candidate:"Unknown",
hash:complaint.hash,
timestamp:new Date().toLocaleString()
});


}

simulatedVotes.sort((a,b)=>b.block-a.block);

setLedger(simulatedVotes);

},[]);

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

<h1>Blockchain Ledger Monitor</h1>

<input
className="ledger-search"
type="text"
placeholder="Search by hash, block number or candidate..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<div className="admin-table">

<table>

<thead>

<tr>
<th>Block</th>
<th>Candidate</th>
<th>Transaction Hash</th>
<th>Timestamp</th>
</tr>

</thead>

<tbody>

{ledger
.filter(entry =>
entry.hash.toLowerCase().includes(search.toLowerCase()) ||
entry.candidate.toLowerCase().includes(search.toLowerCase()) ||
entry.block.toString().includes(search)
)
.map((entry,index)=>(

<tr key={index}>

<td>{entry.block}</td>

<td>{entry.candidate}</td>

<td className="hash-cell">

<span>{entry.hash.substring(0,14)}...</span>

<button
className="copy-btn"
onClick={()=>navigator.clipboard.writeText(entry.hash)}
>

<svg
xmlns="http://www.w3.org/2000/svg"
width="16"
height="16"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>

<rect x="9" y="9" width="13" height="13" rx="2"></rect>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>

</svg>

</button>

</td>

<td>{entry.timestamp}</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</div>

);

}