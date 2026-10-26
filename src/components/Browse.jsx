const API_BASE_URL = "https://reuse-campus.onrender.com/api";

async function fetchListings() {
  const response = await fetch(`${API_BASE_URL}/listings`);
  if (!response.ok) {
    throw new Error("Unable to load listings");
  }
  return response.json();
}

// Friendly wording for the internal status values
const STATUS = {available:"Available",requested:"Interest received",unavailable:"Unavailable",borrowed:"Borrowed"};
const SORTS = [["new","Newest first"],["low","Price: low to high"],["high","Price: high to low"]];

// "Recommended for you": simple rules for now (the ML recommendation service can replace this later).
// 1) categories of items this student saved or asked about; 2) otherwise items matching the top trending searches.
function recommend(db,me,saved){
 const seen=new Set(saved.map(String));
 Object.keys(db.requests||{}).forEach(k=>{const [id,buyer]=k.split("|");if(buyer===me.name)seen.add(String(id))});
 const pool=db.listings.filter(l=>l.status==="available"&&l.owner.name!==me.name&&!seen.has(String(l.id)));
 const catScore={};
 db.listings.forEach(l=>{if(seen.has(String(l.id)))catScore[l.cat]=(catScore[l.cat]||0)+1});
 let items=pool.filter(l=>catScore[l.cat]).sort((a,b)=>catScore[b.cat]-catScore[a.cat]||b.id-a.id);
 if(items.length)return {items:items.slice(0,6),reason:"Based on items you saved or asked about"};
 const terms=Object.entries(db.searches).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]);
 const rank=l=>terms.findIndex(t=>(l.title+" "+l.tags+" "+l.cat).toLowerCase().includes(t));
 items=pool.filter(l=>rank(l)>=0).sort((a,b)=>rank(a)-rank(b));
 return {items:items.slice(0,6),reason:"Popular on campus right now"};
}

function Browse({db,me,onInterest,onSearch,say,upd,moveOnly}){
 const [q,setQ]=useState("");
 const [cat,setCat]=useState("All");
 const [type,setType]=useState("all");
 const [min,setMin]=useState("");
 const [max,setMax]=useState("");
 const [sort,setSort]=useState("new");
 const [onlySaved,setOnlySaved]=useState(false);
 // Saved items are remembered per student in this browser
 const savedKey="reuse_saved_"+me.name;
 const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem(savedKey))||[]}catch(e){return[]}});
 useEffect(()=>{try{localStorage.setItem(savedKey,JSON.stringify(saved))}catch(e){}},[saved,savedKey]);
 const toggleSave=id=>setSaved(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 const rec=useMemo(()=>recommend(db,me,saved),[db,me,saved]);

 const sug=useMemo(()=>Object.entries(db.searches).sort((a,b)=>b[1]-a[1]).slice(0,5),[db.searches]);
 const list=db.listings
  .filter(l=>l.status!=="removed"&&(!moveOnly||l.moveOut)&&(cat==="All"||l.cat===cat)&&(type==="all"||l.type===type)
   &&(!onlySaved||saved.includes(l.id))
   &&(min===""||(l.price||0)>=+min)&&(max===""||(l.price||0)<=+max)
   &&(!q||(l.title+" "+l.tags+" "+l.cat).toLowerCase().includes(q.toLowerCase())))
  .sort((a,b)=>sort==="low"?(a.price||0)-(b.price||0):sort==="high"?(b.price||0)-(a.price||0):b.id-a.id);
 const pick=w=>{setQ(w);onSearch(w)};
 const clear=()=>{setQ("");setCat("All");setType("all");setMin("");setMax("");setOnlySaved(false)};
 const filtered=q||cat!=="All"||type!=="all"||min!==""||max!==""||onlySaved;
 return <>
  <div className="hero">
   <h1>{moveOnly?"Hostel move-in / move-out exchange":"What do you need this semester?"}</h1>
   {moveOnly&&<p className="mute">Outgoing residents list what they’re leaving behind. Incoming students grab it first.</p>}
  </div>
  {!moveOnly&&<><h3 style={{margin:"10px 0"}}>Trending on campus</h3>
  <div className="sug">{sug.map(([w,c])=><button key={w} onClick={()=>pick(w)}><b>{w[0].toUpperCase()+w.slice(1)}</b><span className="mute">searched {c} times</span></button>)}</div></>}
  {!moveOnly&&rec.items.length>0&&<><h3 style={{margin:"18px 0 2px"}}>Recommended for you</h3>
   <p className="mute" style={{margin:"0 0 8px"}}>{rec.reason}</p>
   <div className="sug">{rec.items.map(l=><button key={l.id} onClick={()=>{setQ(l.title);const el=document.getElementById("results");if(el)el.scrollIntoView({behavior:"smooth",block:"start"})}} aria-label={"Show "+l.title}>
    {l.photo?<img className="rec-thumb" src={l.photo} alt=""/>:<div className="rec-thumb ph" aria-hidden="true">♻</div>}
    <b>{l.title}</b><span className="mute">{TYPES[l.type][0]} · {money(l)}</span></button>)}</div></>}
  <form className="row" style={{margin:"14px 0 8px"}} onSubmit={e=>{e.preventDefault();onSearch(q)}}>
   <input style={{flex:1,minWidth:200}} placeholder="Search calculator, drafter, notebooks…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search items"/>
   <button className="btn">Search</button>
  </form>
  <div className="filter-label">Category</div>
  <div className="row" style={{marginBottom:4}}>
   {["All",...CATS].map(c=><button key={c} className={"chip"+(cat===c?" on":"")} onClick={()=>setCat(c)}>{c}</button>)}
  </div>
  <div className="filter-label">Deal type</div>
  <div className="row" style={{marginBottom:4}}>
   {[["all","Any deal"],["sell","Buy"],["rent","Rent"],["donate","Free"],["exchange","Exchange"]].map(([k,l])=><button key={k} className={"chip"+(type===k?" on":"")} onClick={()=>setType(k)}>{l}</button>)}
  </div>
  <div className="filter-label">Price, sort and saved</div>
  <div className="toolbar">
   <input type="number" min="0" inputMode="numeric" placeholder="Min ₹" value={min} onChange={e=>setMin(e.target.value)} aria-label="Minimum price"/>
   <input type="number" min="0" inputMode="numeric" placeholder="Max ₹" value={max} onChange={e=>setMax(e.target.value)} aria-label="Maximum price"/>
   <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort listings">{SORTS.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
   <button type="button" className={"chip"+(onlySaved?" on":"")} onClick={()=>setOnlySaved(v=>!v)} aria-pressed={onlySaved}>♥ Saved ({saved.length})</button>
   {filtered&&<button type="button" className="chip" onClick={clear}>✕ Clear filters</button>}
  </div>
  <div id="results" className="mute" style={{margin:"12px 0"}} aria-live="polite">{list.length} {list.length===1?"item":"items"} found</div>
  {list.length===0?<div className="card empty"><p style={{marginTop:0}}>{onlySaved&&saved.length===0?"You haven’t saved anything yet. Tap the ♡ on a listing to keep it here.":"No items match your search."}</p><button className="btn alt sm" onClick={clear}>Clear filters</button></div>:
  <div className="grid">{list.map(l=>{
   const own=l.owner.name===me.name,isSaved=saved.includes(l.id);
   return <div className="card item" key={l.id} style={{"--c":TCOL[l.type]}}>
    <div className="thumb-wrap">
     {l.photo?<img className="thumb" src={l.photo} alt={l.title} loading="lazy"/>:<div className="thumb ph" aria-hidden="true">♻</div>}
     {!own&&<button type="button" className={"save"+(isSaved?" on":"")} onClick={()=>{toggleSave(l.id);say(isSaved?"Removed from saved":"Saved")}} aria-pressed={isSaved} aria-label={isSaved?"Remove from saved":"Save item"}>{isSaved?"♥":"♡"}</button>}
    </div>
    <div className="row" style={{justifyContent:"space-between"}}><span className="tag">{TYPES[l.type][0]}</span><span className="mute">{STATUS[l.status]||l.status}</span></div>
    <h3>{l.title}</h3>
    <div className="price">{money(l)}</div>
    <div className="meta"><span>{l.cat}</span><span>{l.cond}</span><span>{l.loc}</span>{l.moveOut&&<span>Move-out</span>}</div>
    <div className="mute">{l.owner.name}, {l.owner.year}<br/>📞 Contact shared after the seller accepts</div>
    {own?<button className="btn alt sm" onClick={()=>{if(!window.confirm("Remove this listing?"))return;upd(d=>{d.listings.find(i=>i.id===l.id).status="removed";return d});say("Listing removed")}}>Remove my listing</button>
    :<div className="row">
      <button className="btn sm" disabled={l.status==="unavailable"||l.status==="borrowed"} onClick={()=>onInterest(l)}>I’m interested</button>
      <button className="btn alt sm" onClick={()=>{upd(d=>{d.reports.push({id:Date.now(),listingId:l.id,item:l.title,by:me.name,reason:"Flagged by user",at:Date.now()});return d});say("Reported to admin")}}>Report</button>
    </div>}
   </div>})}</div>}
 </>;
}
