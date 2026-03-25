import { useState } from "react";

export default function AdminRedactions(){

const [reports,setReports] = useState([
{
id:1,
hash:"0x7bc12e9a8d4c21f0",
reason:"Vote recorded incorrectly",
status:"Pending Review"
},
{
id:2,
hash:"0xa91d44c7ff2a90aa",
reason:"Hash not found in ledger",
status:"Pending Review"
}
]);

const copyHash=(hash)=>{
navigator.clipboard.writeText(hash);
};

const forwardReport=(id)=>{

const updated = reports.map(r=>{
if(r.id===id){
return {...r,status:"Forwarded to Senior"};
}
return r;
});

setReports(updated);

const queue = updated.filter(r=>r.status==="Forwarded to Senior");
localStorage.setItem("seniorQueue",JSON.stringify(queue));

};

const rejectReport=(id)=>{

const updated = reports.map(r=>{
if(r.id===id){
return {...r,status:"Rejected by Officer"};
}
return r;
});

setReports(updated);

};

return(

<div className="admin-page">

<h1>Officer Review Panel</h1>

<table className="admin-table">

<thead>
<tr>
<th>ID</th>
<th>Vote Hash</th>
<th>Reason</th>
<th>Status</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{reports.map(r=>(

<tr key={r.id}>

<td>{r.id}</td>

<td className="hash-cell">

<span>{r.hash}</span>

<button
className="copy-icon"
onClick={()=>copyHash(r.hash)}
>
<svg width="16" height="16" viewBox="0 0 24 24">
<path fill="currentColor"
d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1m3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2
2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11v14Z"/>
</svg>
</button>

</td>

<td>{r.reason}</td>

<td>{r.status}</td>

<td>

{r.status==="Pending Review" && (

<div className="action-buttons">

<button
className="forward-btn"
onClick={()=>forwardReport(r.id)}
>
Forward
</button>

<button
className="reject-btn"
onClick={()=>rejectReport(r.id)}
>
Reject
</button>

</div>

)}

</td>

</tr>

))}

</tbody>

</table>

</div>

);

}