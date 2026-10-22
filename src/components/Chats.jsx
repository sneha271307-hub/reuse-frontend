function Chats({db,me,upd,k,setK}){
 const keys=Object.keys(db.chats).filter(key=>{const [id,buyer]=key.split("|");const l=db.listings.find(i=>i.id==id);return l&&(buyer===me.name||l.owner.name===me.name)});
 const [txt,setTxt]=useState("");
 const [offer,setOffer]=useState("");
 const l=k&&db.listings.find(i=>i.id==k.split("|")[0]);
 const send=(text)=>{if(!text.trim())return;upd(d=>{d.chats[k].push({from:me.name,text});return d});setTxt("")};
 return <div className="split" style={{marginTop:16}}>
  <div className="card"><h3>Your chats</h3>
   {keys.length===0&&<p className="mute">Tap “I’m interested” on an item to start a chat.</p>}
   {keys.map(key=>{const it=db.listings.find(i=>i.id==key.split("|")[0]);return <button key={key} className={"chip"+(k===key?" on":"")} style={{display:"block",width:"100%",textAlign:"left",margin:"6px 0"}} onClick={()=>setK(key)}>{it.title}<br/><span style={{fontSize:12}}>{it.owner.name===me.name?"Buyer: "+key.split("|")[1]:"Seller: "+it.owner.name}</span></button>})}
  </div>
  <div className="card">
   {!l||!db.chats[k]?<p className="mute">Pick a chat to read and reply.</p>:<>
    <div className="row" style={{justifyContent:"space-between"}}><h3>{l.title}</h3><span className="tag" style={{"--c":TCOL[l.type]}}>{TYPES[l.type][0]} · {money(l)}</span></div>
    <div className="msgs">{db.chats[k].map((m,i)=><div key={i} className={"m "+(m.from==="sys"?"sys":m.from===me.name?"me":"")}>{m.from!=="sys"&&m.from!==me.name&&<b style={{fontSize:12}}>{m.from}<br/></b>}{m.text}</div>)}</div>
    <div className="row" style={{margin:"8px 0"}}>
     {l.type==="sell"&&<><input style={{width:110}} type="number" placeholder="₹ offer" value={offer} onChange={e=>setOffer(e.target.value)} aria-label="Offer price"/><button className="btn gold sm" onClick={()=>{send("My offer: ₹"+offer);setOffer("")}} disabled={!offer}>Make offer</button></>}
     {l.type==="rent"&&<button className="btn gold sm" onClick={()=>send("Can I rent this for 3 days at ₹"+l.price+"/day?")}>Ask to rent</button>}
     {l.type==="donate"&&<button className="btn gold sm" onClick={()=>send("Is this still free? I’d like to take it.")}>Ask for it</button>}
     {l.type==="exchange"&&<button className="btn gold sm" onClick={()=>send("I can swap something for this. Interested?")}>Propose swap</button>}
     {l.owner.name===me.name&&<><button className="btn sm" onClick={()=>{upd(d=>{d.listings.find(i=>i.id===l.id).status="borrowed";d.chats[k].push({from:"sys",text:"Seller marked this item as handed over."});return d})}}>Mark handed over</button>
     <button className="btn alt sm" onClick={()=>{upd(d=>{d.listings.find(i=>i.id===l.id).status="available";d.chats[k].push({from:"sys",text:"Item is available again."});return d})}}>Make available again</button></>}
    </div>
    <form className="row" onSubmit={e=>{e.preventDefault();send(txt)}}><input style={{flex:1}} value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Type a message" aria-label="Message"/><button className="btn">Send</button></form>
   </>}
  </div></div>;
}
