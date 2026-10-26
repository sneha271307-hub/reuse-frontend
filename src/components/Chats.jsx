function Chats({db,me,upd,k,setK,respond}){
 const reqs=db.requests||{};
 const keys=Object.keys(db.chats).filter(key=>{const [id,buyer]=key.split("|");const l=db.listings.find(i=>i.id==id);return l&&(buyer===me.name||l.owner.name===me.name)});
 const [txt,setTxt]=useState("");
 const [offer,setOffer]=useState("");
 const l=k&&db.listings.find(i=>i.id==k.split("|")[0]);
 const req=k?reqs[k]:null;
 const state=req?req.state:"pending";            // pending | accepted | declined
 const isOwner=!!l&&l.owner.name===me.name;
 const buyerName=k?k.split("|")[1]:"";
 const closed=state==="declined";
 const send=(text)=>{if(closed||!text.trim())return;upd(d=>{d.chats[k].push({from:me.name,text});return d});setTxt("")};
 const handOver=()=>{upd(d=>{const x=d.listings.find(i=>i.id===l.id);x.status=l.type==="rent"?"borrowed":"unavailable";d.chats[k].push({from:"sys",text:"Seller marked this item as handed over."});return d})};
 const reopen=()=>{upd(d=>{d.listings.find(i=>i.id===l.id).status="available";d.chats[k].push({from:"sys",text:"Item is available again."});return d})};
 const stateLabel={pending:"Pending",accepted:"Accepted",declined:"Declined"};
 return <div className="split" style={{marginTop:16}}>
  <div className="card"><h3>Your chats</h3>
   {keys.length===0&&<p className="mute">Tap “I’m interested” on an item to start a chat.</p>}
   {keys.map(key=>{const it=db.listings.find(i=>i.id==key.split("|")[0]);const st=(reqs[key]||{state:"pending"}).state;return <button key={key} className={"chip"+(k===key?" on":"")} style={{display:"block",width:"100%",textAlign:"left",margin:"6px 0",whiteSpace:"normal"}} onClick={()=>setK(key)}>{it.title}<br/><span style={{fontSize:12}}>{it.owner.name===me.name?"Buyer: "+key.split("|")[1]:"Seller: "+it.owner.name} · {stateLabel[st]}</span></button>})}
  </div>
  <div className="card">
   {!l||!db.chats[k]?<p className="mute">Pick a chat to read and reply.</p>:<>
    <div className="row" style={{justifyContent:"space-between"}}><h3>{l.title}</h3><span className="tag" style={{"--c":TCOL[l.type]}}>{TYPES[l.type][0]} · {money(l)}</span></div>
    {isOwner&&state==="pending"&&<div className="banner"><span><b>{buyerName}</b> wants this item. Accept to share contact details.</span><span className="row"><button className="btn sm" onClick={()=>respond(k,"accepted")}>Accept</button><button className="btn alt sm" onClick={()=>respond(k,"declined")}>Decline</button></span></div>}
    {!isOwner&&state==="pending"&&<div className="banner">⏳ Waiting for the seller to accept. Contact details are shared once they do.</div>}
    {state==="accepted"&&<div className="banner ok">✓ Accepted. {isOwner?<>Buyer: <b>{buyerName}</b>{req&&req.buyer?" · "+req.buyer.mobile+" · "+req.buyer.year:""}</>:<>Seller: <b>{l.owner.name}</b> · {l.owner.mobile}</>}</div>}
    {closed&&<div className="banner no">This request was declined, so the chat is closed.</div>}
    <div className="msgs">{db.chats[k].map((m,i)=><div key={i} className={"m "+(m.from==="sys"?"sys":m.from===me.name?"me":"")}>{m.from!=="sys"&&m.from!==me.name&&<b style={{fontSize:12}}>{m.from}<br/></b>}{m.text}</div>)}</div>
    <div className="row" style={{margin:"8px 0"}}>
     {!isOwner&&!closed&&<>
      {l.type==="sell"&&<><input style={{width:110}} type="number" placeholder="₹ offer" value={offer} onChange={e=>setOffer(e.target.value)} aria-label="Offer price"/><button className="btn gold sm" onClick={()=>{send("My offer: ₹"+offer);setOffer("")}} disabled={!offer}>Make offer</button></>}
      {l.type==="rent"&&<button className="btn gold sm" onClick={()=>send("Can I rent this for 3 days at ₹"+l.price+"/day?")}>Ask to rent</button>}
      {l.type==="donate"&&<button className="btn gold sm" onClick={()=>send("Is this still free? I’d like to take it.")}>Ask for it</button>}
      {l.type==="exchange"&&<button className="btn gold sm" onClick={()=>send("I can swap something for this. Interested?")}>Propose swap</button>}
     </>}
     {isOwner&&state==="accepted"&&<button className="btn sm" onClick={handOver}>Mark handed over</button>}
     {isOwner&&<button className="btn alt sm" onClick={reopen}>Make available again</button>}
    </div>
    <form className="row" onSubmit={e=>{e.preventDefault();send(txt)}}><input style={{flex:1}} value={txt} onChange={e=>setTxt(e.target.value)} placeholder={closed?"Chat closed":"Type a message"} disabled={closed} aria-label="Message"/><button className="btn" disabled={closed}>Send</button></form>
   </>}
  </div></div>;
}
