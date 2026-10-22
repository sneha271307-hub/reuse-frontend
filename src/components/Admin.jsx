function Admin({db,upd,say}){
 const set=(id,s)=>{upd(d=>{d.listings.find(i=>i.id===id).status=s;return d});say("Marked "+s)};
 const counts=s=>db.listings.filter(l=>l.status===s).length;
 return <div style={{marginTop:16}}>
  <h2>Admin panel</h2>
  <div className="grid" style={{margin:"12px 0"}}>
   {["available","requested","borrowed","unavailable","removed"].map(s=><div key={s} className="card"><div className="price">{counts(s)}</div><div className="mute">{s}</div></div>)}
  </div>
  <h3>All listings</h3>
  <div className="card wide"><table><thead><tr><th>Item</th><th>Owner</th><th>Type</th><th>Status</th><th>Action</th></tr></thead><tbody>
   {db.listings.map(l=><tr key={l.id}><td>{l.title}</td><td>{l.owner.name}</td><td>{TYPES[l.type][0]}</td><td><b style={{color:l.status==="available"?"var(--green)":"var(--coral)"}}>{l.status==="available"?"Available":l.status==="removed"?"Removed":"Not available ("+l.status+")"}</b></td>
    <td className="row"><button className="btn alt sm" onClick={()=>set(l.id,l.status==="available"?"unavailable":"available")}>{l.status==="available"?"Mark unavailable":"Mark available"}</button><button className="btn alt sm" onClick={()=>set(l.id,"removed")}>Remove</button></td></tr>)}
  </tbody></table></div>
  <h3 style={{marginTop:18}}>Reports ({db.reports.length})</h3>
  <div className="card">{db.reports.length===0?<span className="mute">No reports. Flagged listings will appear here.</span>:db.reports.map(r=><div key={r.id}>“{r.item}” reported by {r.by}</div>)}</div>
  <h3 style={{marginTop:18}}>Search demand (feeds the “Trending” suggestions)</h3>
  <div className="card">{Object.entries(db.searches).sort((a,b)=>b[1]-a[1]).map(([w,c])=><div key={w} className="row" style={{justifyContent:"space-between"}}><span>{w}</span><span className="mute">{c}</span></div>)}</div>
 </div>;
}
