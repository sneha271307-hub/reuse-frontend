function Admin({db,upd,say}){
 const [q,setQ]=useState("");
 const [st,setSt]=useState("all");
 const set=(id,s)=>{upd(d=>{d.listings.find(i=>i.id===id).status=s;return d});say("Marked "+s)};
 const removeListing=l=>{if(!window.confirm("Remove “"+l.title+"”?"))return;set(l.id,"removed")};
 const counts=s=>db.listings.filter(l=>l.status===s).length;
 const rows=db.listings.filter(l=>(st==="all"||l.status===st)&&(!q||(l.title+" "+l.owner.name).toLowerCase().includes(q.toLowerCase())));
 const dismiss=id=>{upd(d=>{d.reports=d.reports.filter(r=>r.id!==id);return d});say("Report dismissed")};
 const removeFromReport=r=>{
  const l=db.listings.find(i=>r.listingId?i.id===r.listingId:i.title===r.item);
  if(!l)return say("Listing not found");
  if(!window.confirm("Remove “"+l.title+"” and close this report?"))return;
  upd(d=>{const x=d.listings.find(i=>i.id===l.id);if(x)x.status="removed";d.reports=d.reports.filter(i=>i.id!==r.id);return d});
  say("Listing removed");
 };
 return <div style={{marginTop:16}}>
  <h2>Admin panel</h2>
  <div style={{margin:"12px 0"}}><ImpactStrip s={impact(db)}/></div>
  <div className="grid" style={{margin:"12px 0"}}>
   {["available","requested","borrowed","unavailable","removed"].map(s=><div key={s} className="card"><div className="price">{counts(s)}</div><div className="mute">{s}</div></div>)}
  </div>
  <h3>All listings</h3>
  <div className="row" style={{margin:"10px 0"}}>
   <input style={{flex:1,minWidth:180}} placeholder="Search by item or owner…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search listings"/>
   <select style={{width:"auto"}} value={st} onChange={e=>setSt(e.target.value)} aria-label="Filter by status">
    <option value="all">All statuses</option>{["available","requested","borrowed","unavailable","removed"].map(s=><option key={s} value={s}>{s}</option>)}
   </select>
  </div>
  <div className="card wide"><table><thead><tr><th>Item</th><th>Owner</th><th>Type</th><th>Status</th><th>Action</th></tr></thead><tbody>
   {rows.length===0&&<tr><td colSpan="5" className="mute">No listings match.</td></tr>}
   {rows.map(l=><tr key={l.id}><td>{l.title}</td><td>{l.owner.name}</td><td>{TYPES[l.type][0]}</td><td><b style={{color:l.status==="available"?"var(--green)":"var(--coral)"}}>{l.status==="available"?"Available":l.status==="removed"?"Removed":"Not available ("+l.status+")"}</b></td>
    <td className="row"><button className="btn alt sm" disabled={l.status==="removed"} onClick={()=>set(l.id,l.status==="available"?"unavailable":"available")}>{l.status==="available"?"Mark unavailable":"Mark available"}</button><button className="btn alt sm" disabled={l.status==="removed"} onClick={()=>removeListing(l)}>Remove</button></td></tr>)}
  </tbody></table></div>
  <h3 style={{marginTop:18}}>Reports ({db.reports.length})</h3>
  <div className="card">{db.reports.length===0?<span className="mute">No reports. Flagged listings will appear here.</span>:db.reports.map(r=><div key={r.id} className="row" style={{justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--line)"}}>
   <div>“{r.item}” reported by {r.by}<div className="mute">{r.reason}{r.at?" · "+new Date(r.at).toLocaleString():""}</div></div>
   <div className="row"><button className="btn alt sm" onClick={()=>dismiss(r.id)}>Dismiss</button><button className="btn sm" onClick={()=>removeFromReport(r)}>Remove listing</button></div>
  </div>)}</div>
  <h3 style={{marginTop:18}}>Search demand (feeds the “Trending” suggestions)</h3>
  <div className="card">{Object.keys(db.searches).length===0?<span className="mute">No searches yet.</span>:Object.entries(db.searches).sort((a,b)=>b[1]-a[1]).map(([w,c])=><div key={w} className="row" style={{justifyContent:"space-between"}}><span>{w}</span><span className="mute">{c}</span></div>)}</div>
 </div>;
}
