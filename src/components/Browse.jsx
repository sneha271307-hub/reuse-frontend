const API_BASE_URL = "https://reuse-campus.onrender.com/api";

async function fetchListings() {
  const response = await fetch(`${API_BASE_URL}/listings`);
  if (!response.ok) {
    throw new Error("Unable to load listings");
  }
  return response.json();
}


function Browse({db,me,onInterest,onSearch,say,upd,moveOnly}){
 const [q,setQ]=useState("");
 const [cat,setCat]=useState("All");
 const [type,setType]=useState("all");
 const sug=useMemo(()=>Object.entries(db.searches).sort((a,b)=>b[1]-a[1]).slice(0,5),[db.searches]);
 const list=db.listings.filter(l=>l.status!=="removed"&&(!moveOnly||l.moveOut)&&(cat==="All"||l.cat===cat)&&(type==="all"||l.type===type)&&(!q||(l.title+" "+l.tags+" "+l.cat).toLowerCase().includes(q.toLowerCase())));
 const pick=w=>{setQ(w);onSearch(w)};
 return <>
  <div className="hero">
   <h1>{moveOnly?"Hostel move-in / move-out exchange":"What do you need this semester?"}</h1>
   {moveOnly&&<p className="mute">Outgoing residents list what they’re leaving behind. Incoming students grab it first.</p>}
  </div>
  {!moveOnly&&<><h3 style={{margin:"10px 0"}}>Trending on campus</h3>
  <div className="sug">{sug.map(([w,c])=><button key={w} onClick={()=>pick(w)}><b>{w[0].toUpperCase()+w.slice(1)}</b><span className="mute">searched {c} times</span></button>)}</div></>}
  <form className="row" style={{margin:"14px 0 8px"}} onSubmit={e=>{e.preventDefault();onSearch(q)}}>
   <input style={{flex:1,minWidth:200}} placeholder="Search calculator, drafter, notebooks…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search items"/>
   <button className="btn">Search</button>
  </form>
  <div className="row" style={{marginBottom:8}}>
   {["All",...CATS].map(c=><button key={c} className={"chip"+(cat===c?" on":"")} onClick={()=>setCat(c)}>{c}</button>)}
  </div>
  <div className="row" style={{marginBottom:16}}>
   {[["all","Any deal"],["sell","Buy"],["rent","Rent"],["donate","Free"],["exchange","Exchange"]].map(([k,l])=><button key={k} className={"chip"+(type===k?" on":"")} onClick={()=>setType(k)}>{l}</button>)}
  </div>
  {list.length===0?<div className="card">No items match. Clear a filter or post what you’re looking for.</div>:
  <div className="grid">{list.map(l=>{
   const own=l.owner.name===me.name;
   return <div className="card item" key={l.id} style={{"--c":TCOL[l.type]}}>
    <div className="row" style={{justifyContent:"space-between"}}><span className="tag">{TYPES[l.type][0]}</span><span className="mute">{l.status}</span></div>
    <h3>{l.title}</h3>
    <div className="price">{money(l)}</div>
    <div className="mute">{l.cat} · {l.cond} · {l.loc}{l.moveOut?" · move-out":""}</div>
    <div className="mute">{l.owner.name}, {l.owner.year}<br/>Mobile {l.owner.mobile}</div>
    {own?<button className="btn alt sm" onClick={()=>{upd(d=>{d.listings.find(i=>i.id===l.id).status="removed";return d});say("Listing removed")}}>Remove my listing</button>
    :<div className="row">
      <button className="btn sm" disabled={l.status==="unavailable"||l.status==="borrowed"} onClick={()=>onInterest(l)}>I’m interested</button>
      <button className="btn alt sm" onClick={()=>{upd(d=>{d.reports.push({id:Date.now(),item:l.title,by:me.name,reason:"Flagged by user"});return d});say("Reported to admin")}}>Report</button>
    </div>}
   </div>})}</div>}
 </>;
}
