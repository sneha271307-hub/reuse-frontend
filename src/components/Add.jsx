// ⚠️ SET THIS to your real category-prediction route on the backend (the one that calls the Python ML service).
// Expected: POST {title} -> JSON containing the category, e.g. {category:"Books"}.
// If the route is wrong or the server is asleep, the suggestion simply doesn't appear — posting still works.
const PREDICT_URL = "https://reuse-campus.onrender.com/api/predict-category";

function Add({me,upd,done,edit,onCancel}){   // pass `edit` (a listing) to edit instead of create
 const [f,setF]=useState(edit?{title:edit.title,cat:edit.cat,type:edit.type,price:edit.price?String(edit.price):"",cond:edit.cond,loc:edit.loc||"",moveOut:!!edit.moveOut}:{title:"",cat:CATS[0],type:"sell",price:"",cond:"Good",loc:"",moveOut:false});
 const [err,setErr]=useState("");
 const [sugg,setSugg]=useState(null);      // category predicted by the ML service
 const [thinking,setThinking]=useState(false);
 const [photo,setPhoto]=useState(edit?edit.photo||"":"");       // small compressed JPEG (data URL)
 // Shrink the picked photo so it stays small enough to store in the browser
 const pickPhoto=e=>{
  const file=e.target.files[0];e.target.value="";
  if(!file)return;
  if(!file.type.startsWith("image/"))return setErr("Please choose an image file.");
  if(file.size>10*1024*1024)return setErr("Image is too large (max 10 MB).");
  setErr("");
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{
   const r=Math.min(1,720/Math.max(img.width,img.height)),c=document.createElement("canvas");
   c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
   c.getContext("2d").drawImage(img,0,0,c.width,c.height);
   setPhoto(c.toDataURL("image/jpeg",.72));URL.revokeObjectURL(url);
  };
  img.onerror=()=>{URL.revokeObjectURL(url);setErr("Could not read that image.")};
  img.src=url;
 };
 const set=k=>e=>{setErr("");setF({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value})};
 const needPrice=f.type==="sell"||f.type==="rent";

 // Ask the ML service for a category once the person pauses typing
 useEffect(()=>{
  const title=f.title.trim();
  setSugg(null);
  if(title.length<3){setThinking(false);return}
  const ctrl=new AbortController();
  setThinking(true);
  const t=setTimeout(()=>{
   fetch(PREDICT_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title}),signal:ctrl.signal})
    .then(r=>{if(!r.ok)throw new Error("predict failed");return r.json()})
    .then(d=>{
      const raw=d.category||d.predicted_category||d.prediction||"";
      const match=CATS.find(c=>c.toLowerCase()===String(raw).trim().toLowerCase());
      setSugg(match||null);            // only suggest categories that exist in this app
      setThinking(false);
    })
    .catch(e=>{if(e.name!=="AbortError")setThinking(false)});
  },700);
  return()=>{clearTimeout(t);ctrl.abort()};
 },[f.title]);

 const submit=e=>{
  e.preventDefault();
  if(f.title.trim().length<3)return setErr("Give the item a clear title.");
  if(needPrice&&!(+f.price>0))return setErr("Enter a price greater than 0.");
  const fields={title:f.title.trim(),cat:f.cat,type:f.type,price:needPrice?+f.price:0,cond:f.cond,loc:f.loc||"Campus",moveOut:f.moveOut,tags:f.title.toLowerCase(),photo};
  if(edit)upd(d=>{const x=d.listings.find(i=>i.id===edit.id);if(x)Object.assign(x,fields);return d});
  else upd(d=>{d.listings.unshift({id:Date.now(),...fields,owner:{name:me.name,mobile:me.mobile,year:me.year},status:"available"});return d});
  done();
 };
 return <form className="card" style={{maxWidth:520,margin:"20px auto"}} onSubmit={submit}>
  <h2>{edit?"Edit your item":"Post an item"}</h2>
  <p className="mute">You can sell, rent, give away or swap, whichever suits you. Buying works from the Home page.</p>
  <label htmlFor="a-title">What is it?</label>
  <input id="a-title" value={f.title} maxLength={80} onChange={set("title")} placeholder="e.g. Casio fx-991 calculator" autoComplete="off"/>
  <div className="mute" style={{minHeight:22,marginTop:6}} aria-live="polite">
   {thinking&&!sugg&&"Checking category…"}
   {sugg&&sugg!==f.cat&&<span className="row" style={{gap:8}}>Suggested category: <button type="button" className="chip on" style={{minHeight:30,padding:"3px 12px"}} onClick={()=>setF({...f,cat:sugg})}>{sugg} ✓ Use this</button></span>}
   {sugg&&sugg===f.cat&&"✓ Category matches our suggestion"}
  </div>
  <label>Photo <span className="mute">(optional, but listings with photos get more interest)</span></label>
  {photo?<div className="photo-prev"><img src={photo} alt="Preview of your item"/><button type="button" className="btn alt sm" onClick={()=>setPhoto("")}>Remove photo</button></div>
  :<label className="photo-pick" style={{margin:0}}><input type="file" accept="image/*" onChange={pickPhoto} style={{display:"none"}}/><span>📷 Add a photo</span><span className="mute">JPG or PNG</span></label>}
  <label htmlFor="a-cat">Category</label><select id="a-cat" value={f.cat} onChange={set("cat")}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
  <label htmlFor="a-type">I want to</label>
  <select id="a-type" value={f.type} onChange={set("type")}><option value="sell">Sell</option><option value="rent">Rent out</option><option value="donate">Give away free</option><option value="exchange">Exchange</option></select>
  {needPrice&&<><label htmlFor="a-price">{f.type==="rent"?"Rent per day (₹)":"Price (₹)"}</label><input id="a-price" type="number" inputMode="numeric" min="1" value={f.price} onChange={set("price")}/></>}
  <label htmlFor="a-cond">Condition</label><select id="a-cond" value={f.cond} onChange={set("cond")}>{["New","Like new","Good","Fair"].map(c=><option key={c}>{c}</option>)}</select>
  <label htmlFor="a-loc">Handover spot on campus</label><input id="a-loc" value={f.loc} onChange={set("loc")} placeholder="e.g. Hostel B common room"/>
  <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" style={{width:"auto"}} checked={f.moveOut} onChange={set("moveOut")}/>I’m moving out of the hostel</label>
  <p className="mute" style={{marginBottom:0}}>Tip: meet in public campus spots like the library or canteen.</p>
  {err&&<p style={{color:"var(--coral)"}} role="alert">{err}</p>}
  <div className="row" style={{marginTop:12}}>
   <button className="btn">{edit?"Save changes":"Post item"}</button>
   {edit&&<button type="button" className="btn alt" onClick={onCancel}>Cancel</button>}
  </div>
 </form>;
}
