function Add({me,upd,done}){
 const [f,setF]=useState({title:"",cat:CATS[0],type:"sell",price:"",cond:"Good",loc:"",moveOut:false});
 const [err,setErr]=useState("");
 const set=k=>e=>setF({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value});
 const needPrice=f.type==="sell"||f.type==="rent";
 const submit=e=>{
  e.preventDefault();
  if(f.title.trim().length<3)return setErr("Give the item a clear title.");
  if(needPrice&&!(+f.price>0))return setErr("Enter a price greater than 0.");
  upd(d=>{d.listings.unshift({id:Date.now(),title:f.title.trim(),cat:f.cat,type:f.type,price:needPrice?+f.price:0,cond:f.cond,loc:f.loc||"Campus",owner:{name:me.name,mobile:me.mobile,year:me.year},status:"available",moveOut:f.moveOut,tags:f.title.toLowerCase()});return d});
  done();
 };
 return <form className="card" style={{maxWidth:520,margin:"20px auto"}} onSubmit={submit}>
  <h2>Post an item</h2>
  <p className="mute">You can sell, rent, give away or swap, whichever suits you. Buying works from the Home page.</p>
  <label>What is it?</label><input value={f.title} onChange={set("title")}/>
  <label>Category</label><select value={f.cat} onChange={set("cat")}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
  <label>I want to</label>
  <select value={f.type} onChange={set("type")}><option value="sell">Sell</option><option value="rent">Rent out</option><option value="donate">Give away free</option><option value="exchange">Exchange</option></select>
  {needPrice&&<><label>{f.type==="rent"?"Rent per day (₹)":"Price (₹)"}</label><input type="number" min="1" value={f.price} onChange={set("price")}/></>}
  <label>Condition</label><select value={f.cond} onChange={set("cond")}>{["New","Like new","Good","Fair"].map(c=><option key={c}>{c}</option>)}</select>
  <label>Handover spot on campus</label><input value={f.loc} onChange={set("loc")} placeholder="e.g. Hostel B common room"/>
  <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" style={{width:"auto"}} checked={f.moveOut} onChange={set("moveOut")}/>I’m moving out of the hostel</label>
  {err&&<p style={{color:"var(--coral)"}} role="alert">{err}</p>}
  <button className="btn" style={{marginTop:12}}>Post item</button>
 </form>;
}
