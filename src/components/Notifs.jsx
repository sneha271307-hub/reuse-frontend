function Notifs({list,upd,open,requests,respond}){
 useEffect(()=>{upd(d=>{d.notifs.forEach(n=>{if(list.some(x=>x.id===n.id))n.read=true});return d})},[]);
 const label={accepted:"Accepted",declined:"Declined"};
 return <div style={{maxWidth:600,margin:"20px auto"}}><h2>Alerts</h2>
  {list.length===0?<p className="card">Nothing yet. You’ll see a message here when someone is interested in your item.</p>:
  list.map(n=>{
   const isResponse=n.kind==="response";
   const state=(requests[n.key]||{state:"pending"}).state;
   return <div key={n.id} className="card" style={{margin:"8px 0"}}>
    <div>{n.text}</div>
    <div className="row" style={{marginTop:10}}>
     {!isResponse&&state==="pending"&&<><button className="btn sm" onClick={()=>respond(n.key,"accepted")}>Accept</button><button className="btn alt sm" onClick={()=>respond(n.key,"declined")}>Decline</button></>}
     {!isResponse&&state!=="pending"&&<b className="mute">{label[state]}</b>}
     <button className="btn alt sm" onClick={()=>open(n.key)}>Open chat</button>
    </div>
   </div>})}
 </div>;
}
