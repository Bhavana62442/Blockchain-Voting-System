import { useEffect,useState } from "react";

export default function AdminSeniorRedactions(){

const [reports,setReports] = useState([]);

useEffect(()=>{

const queue = JSON.parse(localStorage.getItem("seniorQueue")) || [];
setReports(queue);

},[]);

const acceptRedaction=(id)=>{

const updated = reports.map(r=>{
if(r.id===id){
return {...r,status:"Redaction Approved"};
}
return r;
});

setReports(updated);

};

const rejectRedaction=(id)=>{

const updated = reports.map(r=>{
if(r.id===id){
return {...r,status:"Rejected by Senior"};
}
return r;
});

setReports(updated);

};

return(

<div className="admin-page">

<h1>Senior Authority Review</h1>

<table className="admin-table">

<thead>
<tr>
<th>ID</th>
<th>Vote Hash</th>
<th>Reason</th>
<th>Status</th>
<th>Decision</th>
</tr>
</thead>

<tbody>

{reports.map(r=>(

<tr key={r.id}>

<td>{r.id}</td>

<td>{r.hash}</td>

<td>{r.reason}</td>

<td>{r.status}</td>

<td>

{r.status==="Forwarded to Senior" && (

<div className="action-buttons">

<button
className="approve-btn"
onClick={()=>acceptRedaction(r.id)}
>
Accept
</button>

<button
className="reject-btn"
onClick={()=>rejectRedaction(r.id)}
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