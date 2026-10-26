// "My listings": owner tools. Reuses your existing statuses so Browse and Admin keep working:
//   rent -> "borrowed" when it is rented out; sell / donate / exchange -> "unavailable" once it has gone.
const MINE_STATUS={available:"Available",requested:"Interest received",unavailable:"Gone / closed",borrowed:"Rented out"};
const DONE_LABEL={sell:"Mark as sold",rent:"Mark as rented out",donate:"Mark as given away",exchange:"Mark as swapped"};

function MyListings({db,me,upd,say,onEdit,onPost}){
 const mine=db.listings.filter(l=>l.owner.name===me.name&&l.status!=="removed");
 const n=f=>mine.filter(f).length;
 const setStatus=(l,s,msg)=>{upd(d=>{const x=d.listings.find(i=>i.id===l.id);if(x)x.status=s;return d});say(msg)};
 const remove=l=>{if(!window.confirm("Remove “"+l.title+"”? This can’t be undone from here."))return;setStatus(l,"removed","Listing removed")};
 return <div style={{marginTop:16}}>
  <div className="row" style={{justifyContent:"space-between"}}><h2>My listings</h2><button className="btn sm" onClick={onPost}>+ Post item</button></div>
  <div className="grid" style={{margin:"12px 0"}}>
   <div className="card"><div className="price">{mine.length}</div><div className="mute">Total</div></div>
   <div className="card"><div className="price">{n(l=>l.status==="available")}</div><div className="mute">Available</div></div>
   <div className="card"><div className="price">{n(l=>l.status==="requested")}</div><div className="mute">With interest</div></div>
   <div className="card"><div className="price">{n(l=>l.status==="unavailable"||l.status==="borrowed")}</div><div className="mute">Completed</div></div>
  </div>
  {mine.length===0?<div className="card empty"><p style={{marginTop:0}}>You haven’t posted anything yet.</p><button className="btn" onClick={onPost}>Post your first item</button></div>:
  <div className="mine-list">{mine.map(l=>{
   const closed=l.status==="unavailable"||l.status==="borrowed";
   return <div className="card mine-row" key={l.id} style={{"--c":TCOL[l.type]}}>
    {l.photo?<img className="thumb" src={l.photo} alt={l.title}/>:<div className="thumb ph" aria-hidden="true">♻</div>}
    <div className="mine-body">
     <div className="row" style={{justifyContent:"space-between"}}><span className="tag">{TYPES[l.type][0]}</span><b style={{color:l.status==="available"?"var(--green)":l.status==="requested"?"var(--pine)":"var(--mute)"}}>{MINE_STATUS[l.status]||l.status}</b></div>
     <h3 style={{margin:"8px 0 2px"}}>{l.title}</h3>
     <div className="price" style={{fontSize:20}}>{money(l)}</div>
     <div className="meta">{l.cat} · {l.cond} · {l.loc}</div>
     {l.status==="requested"&&<p className="mute" style={{margin:"6px 0 0"}}>Someone is interested. Check your Chats and Alerts.</p>}
     <div className="row" style={{marginTop:12}}>
      <button className="btn alt sm" onClick={()=>onEdit(l)}>Edit</button>
      {closed
       ?<button className="btn sm" onClick={()=>setStatus(l,"available","Marked available again")}>Mark available again</button>
       :<button className="btn sm" onClick={()=>setStatus(l,l.type==="rent"?"borrowed":"unavailable","Listing updated")}>{DONE_LABEL[l.type]}</button>}
      <button className="btn alt sm" onClick={()=>remove(l)}>Remove</button>
     </div>
    </div>
   </div>})}</div>}
 </div>;
}
