import { useState } from "react";

export default function AdminResultsControl(){

const role = localStorage.getItem("adminRole");

const [published,setPublished] = useState(
localStorage.getItem("resultsPublished")==="true"
);

const votes = {
"Arjun Rao":120,
"Meera Nair":100,
"Rakesh Singh":81
};

const publishResults=()=>{

localStorage.setItem("resultsPublished","true");
setPublished(true);

};

if(role!=="senior"){

return(

<div className="admin-page">

<h1>Access Restricted</h1>

<p>
Only Senior Election Authority can publish official results.
</p>

</div>

);

}

return(

<div className="admin-page">

<h1>Official Results Control</h1>

<div className="results-panel">

<h3>Vote Tally Verification</h3>

<table className="admin-table">

<thead>
<tr>
<th>Candidate</th>
<th>Votes</th>
</tr>
</thead>

<tbody>

{Object.entries(votes).map(([name,count])=>(

<tr key={name}>
<td>{name}</td>
<td>{count}</td>
</tr>

))}

</tbody>

</table>

</div>

<div className="publish-section">

{published ? (

<p className="results-live">
Results have been officially published.
</p>

):( 

<button
className="publish-btn"
onClick={publishResults}
>
Publish Official Results
</button>

)}

</div>

</div>

);

}