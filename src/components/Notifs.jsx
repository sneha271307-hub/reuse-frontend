function Notifs({list,upd,open}){
 useEffect(()=>{upd(d=>{d.notifs.forEach(n=>{if(list.some(x=>x.id===n.id))n.read=true});return d})},[]);
 return <div style={{maxWidth:600,margin:"20px auto"}}><h2>Alerts</h2>
  {list.length===0?<p className="card">Nothing yet. You’ll see a message here when someone is interested in your item.</p>:
  list.map(n=><div key={n.id} className="card row" style={{margin:"8px 0",justifyContent:"space-between"}}><span>{n.text}</span><button className="btn sm" onClick={()=>open(n.key)}>Open chat</button></div>)}
 </div>;
}
