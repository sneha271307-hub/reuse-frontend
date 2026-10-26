const {useState,useEffect,useMemo}=React;

// Persist an explicit theme choice. First visit defaults to dark (matches index.html and the background artwork).
function useTheme(){
 const [theme,setTheme]=useState(()=>{
  try{const saved=localStorage.getItem("reuse_theme");if(saved==="light"||saved==="dark")return saved;}catch(e){}
  return "dark";
 });
 useEffect(()=>{
  document.documentElement.setAttribute("data-theme",theme);
  try{localStorage.setItem("reuse_theme",theme)}catch(e){}
 },[theme]);
 return [theme,()=>setTheme(current=>current==="dark"?"light":"dark")];
}
const CATS=["Stationery","Books","Calculators","Furniture","Hostel Essentials","Lab Equipment"];
const TYPES={sell:["Sell",""],rent:["Rent",""],donate:["Free / Donate",""],exchange:["Exchange",""]};
const TCOL={sell:"#2f6fb5",rent:"#8a5cc2",donate:"#2e8b57",exchange:"#c47a12"};
const U=(name,mobile,year)=>({name,mobile,year});
const SEED={
 listings:[
  {id:1,title:"Casio fx-991 calculator",cat:"Calculators",type:"sell",price:450,cond:"Good",loc:"Hostel B",owner:U("Aarav Singh","98100 11111","2nd year"),status:"available",moveOut:false,tags:"calculator"},
  {id:2,title:"Mini drafter set",cat:"Stationery",type:"rent",price:20,cond:"Good",loc:"Hostel A",owner:U("Priya Verma","98100 22222","3rd year"),status:"available",moveOut:false,tags:"drafter"},
  {id:3,title:"Engineering Maths – Vol 1",cat:"Books",type:"donate",price:0,cond:"Fair",loc:"Library gate",owner:U("Rohan Das","98100 33333","4th year"),status:"available",moveOut:true,tags:"books maths"},
  {id:4,title:"Study table lamp",cat:"Hostel Essentials",type:"exchange",price:0,cond:"Like new",loc:"Hostel C",owner:U("Sneha Rao","98100 44444","4th year"),status:"available",moveOut:true,tags:"lamp"},
  {id:5,title:"Foldable study desk",cat:"Furniture",type:"sell",price:900,cond:"Good",loc:"Hostel B",owner:U("Rohan Das","98100 33333","4th year"),status:"available",moveOut:true,tags:"desk furniture"},
  {id:6,title:"Ruled notebooks (pack of 5)",cat:"Stationery",type:"sell",price:120,cond:"New",loc:"Hostel A",owner:U("Priya Verma","98100 22222","3rd year"),status:"available",moveOut:false,tags:"notebooks"},
  {id:7,title:"Lab coat (size M)",cat:"Lab Equipment",type:"rent",price:30,cond:"Good",loc:"Block 2",owner:U("Aarav Singh","98100 11111","2nd year"),status:"requested",moveOut:false,tags:"lab coat"}
 ],
 searches:{calculator:48,drafter:41,notebooks:35,books:33,"lab coat":18,lamp:12,desk:9},
 notifs:[],chats:{},requests:{},reports:[]
};
function load(){try{const s=localStorage.getItem("reuse_v2");if(s)return JSON.parse(s)}catch(e){}return SEED}
const money=l=>l.type==="donate"?"Free":l.type==="exchange"?"Swap":l.type==="rent"?"₹"+l.price+"/day":"₹"+l.price;

// ---- Impact numbers (landing page + admin) ----
// Savings are an ESTIMATE: for completed "sell" items we assume a new one would cost about this many times the second-hand price.
const ASSUMED_NEW_PRICE_MULTIPLIER=2;
function impact(db){
 const live=db.listings.filter(l=>l.status!=="removed");
 const done=live.filter(l=>l.status==="unavailable"||l.status==="borrowed");
 const saved=done.filter(l=>l.type==="sell").reduce((t,l)=>t+(l.price||0)*(ASSUMED_NEW_PRICE_MULTIPLIER-1),0);
 return {reused:done.length,listed:live.length,free:live.filter(l=>l.type==="donate").length,saved};
}
function ImpactStrip({s}){
 const items=[["♻",s.reused,"Items reused"],["📦",s.listed,"Items listed"],["🎁",s.free,"Free items shared"],["₹","₹"+s.saved.toLocaleString("en-IN"),"Estimated savings"]];
 return <div>
  <div className="impact" role="list">{items.map(([ic,v,l])=><div className="card stat" role="listitem" key={l}><div className="stat-ic" aria-hidden="true">{ic}</div><div className="price">{v}</div><div className="mute">{l}</div></div>)}</div>
  <p className="mute" style={{fontSize:12,marginTop:8}}>Savings are an estimate: we assume a new item costs about {ASSUMED_NEW_PRICE_MULTIPLIER}× the second-hand price.</p>
 </div>;
}