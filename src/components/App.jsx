// Remember the logged-in user across page refreshes (browser-only for now; the backend/JWT will replace this)
const SESSION_KEY="reuse_me";
function savedMe(){try{const u=JSON.parse(localStorage.getItem(SESSION_KEY));return u&&u.name&&u.role?u:null}catch(e){return null}}

function App(){
  const [apiListings, setApiListings] = useState([]);
 const [theme,toggleTheme]=useTheme();
 const [db,setDb]=useState(load);
 const [me,setMe]=useState(savedMe);
 const [page,setPage]=useState(()=>{const u=savedMe();return u&&u.role==="admin"?"admin":"home"});
 const [chatKey,setChatKey]=useState(null);
 const [editItem,setEditItem]=useState(null);
 const [toast,setToast]=useState("");
 const [menu,setMenu]=useState(false);
 useEffect(() => {
  fetch("https://reuse-campus.onrender.com/api/listings")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load listings");
      return res.json();
    })
    .then((data) => {
      setApiListings(data.listings || data.data || []);
    })
    .catch((err) => console.error("Listings API:", err));
}, []);
 useEffect(()=>{try{localStorage.setItem("reuse_v2",JSON.stringify(db))}catch(e){}},[db]);
 // close the account menu when clicking anywhere else
 useEffect(()=>{
  if(!menu)return;
  const h=e=>{if(!e.target.closest(".menu-wrap"))setMenu(false)};
  const k=e=>{if(e.key==="Escape")setMenu(false)};
  document.addEventListener("click",h);document.addEventListener("keydown",k);
  return()=>{document.removeEventListener("click",h);document.removeEventListener("keydown",k)};
 },[menu]);
 const say=t=>{setToast(t);setTimeout(()=>setToast(""),2600)};
 const upd=f=>setDb(d=>f(JSON.parse(JSON.stringify(d))));
 const mine=me?db.notifs.filter(n=>n.to===me.name):[];
 const unread=mine.filter(n=>!n.read).length;

 const loginAs=u=>{setMe(u);setPage(u.role==="admin"?"admin":"home");try{localStorage.setItem(SESSION_KEY,JSON.stringify(u))}catch(e){}};
 const logout=()=>{setMenu(false);setMe(null);setPage("home");setChatKey(null);try{localStorage.removeItem(SESSION_KEY)}catch(e){}window.scrollTo(0,0);if(location.hash)history.replaceState(null,"",location.pathname+location.search)};

 if(!me)return <Login theme={theme} toggleTheme={toggleTheme} onLogin={loginAs} stats={impact(db)}/>;

 const interest=l=>{
  const key=l.id+"|"+me.name;
  const ex=(db.requests||{})[key]||(db.chats[key]?{state:"pending"}:null);
  if(ex){setChatKey(key);setPage("chats");say(ex.state==="declined"?"The seller declined this request":"You already asked about this item");return}
  upd(d=>{
   d.requests=d.requests||{};
   d.requests[key]={state:"pending",at:Date.now(),buyer:{name:me.name,year:me.year,mobile:me.mobile}};
   d.notifs.unshift({id:Date.now(),to:l.owner.name,text:me.name+" ("+me.year+") is interested in “"+l.title+"”",key,read:false,kind:"interest"});
   d.chats[key]=[{from:"sys",text:me.name+" started a chat about “"+l.title+"” ("+money(l)+"). Contact details are shared if the seller accepts."}];
   const x=d.listings.find(i=>i.id===l.id);if(x.status==="available")x.status="requested";
   return d});
  setChatKey(key);setPage("chats");say("Seller notified");
 };
 // seller accepts or declines a buyer's request
 const respond=(key,decision)=>{
  upd(d=>{
   d.requests=d.requests||{};
   const [id,buyer]=key.split("|");
   const l=d.listings.find(i=>i.id==id);if(!l)return d;
   d.requests[key]={...(d.requests[key]||{}),state:decision};
   if(d.chats[key])d.chats[key].push({from:"sys",text:decision==="accepted"?"Seller accepted. Contact details are now shared in this chat.":"Seller declined this request."});
   d.notifs.unshift({id:Date.now(),to:buyer,text:l.owner.name+(decision==="accepted"?" accepted":" declined")+" your request for “"+l.title+"”",key,read:false,kind:"response"});
   // if nobody is waiting on this item any more, make it available again
   const active=Object.keys(d.requests).some(k2=>k2!==key&&k2.split("|")[0]==id&&["pending","accepted"].includes(d.requests[k2].state));
   if(decision==="declined"&&!active&&l.status==="requested")l.status="available";
   return d});
  say(decision==="accepted"?"Request accepted":"Request declined");
 };
 const search=q=>{
  const w=q.trim().toLowerCase();if(!w)return;
  upd(d=>{d.searches[w]=(d.searches[w]||0)+1;return d});
 };
 // cls lets one button (Post item) be styled as the main call-to-action
 const nav=(p,l,cls)=><button className={"nb"+(cls?" "+cls:"")+(page===p?" on":"")} onClick={()=>setPage(p)} aria-current={page===p?"page":undefined}>{l}</button>;
 return <>
  <header className={"nav"+(me.role==="admin"?"":" nav-tabs")}><div className="wrap">
   <span className="logo">ReUse Campus</span>
   <nav className="nav-links" aria-label="Main navigation">
    {me.role==="admin"?nav("admin","Admin panel"): <>{nav("home","Home")}{nav("moves","Hostel exchange")}{nav("chats","Chats")}{nav("notifs",<>Alerts{unread>0&&<span className="badge">{unread}</span>}</>)}{nav("add","+ Post item","cta")}</>}
   </nav>
   <div className="nav-actions">
    <button className="theme-toggle" onClick={toggleTheme} aria-label={theme==="dark"?"Switch to light mode":"Switch to dark mode"} title={theme==="dark"?"Switch to light mode":"Switch to dark mode"}>{theme==="dark"?"☀":"☾"}<span className="theme-label">{theme==="dark"?"Light":"Dark"}</span></button>
    <div className="menu-wrap">
     <button className="avatar" onClick={()=>setMenu(m=>!m)} aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu" title={me.name}>{(me.name||"?")[0].toUpperCase()}</button>
     {menu&&<div className="menu" role="menu">
      <div className="menu-head"><b>{me.name}</b>{me.year&&<span className="mute">{me.year}</span>}</div>
      {me.role!=="admin"&&<button className="menu-item" role="menuitem" onClick={()=>{setMenu(false);setPage("mine")}}>My listings</button>}
      <button className="menu-item" role="menuitem" onClick={logout}>Log out</button>
     </div>}
    </div>
   </div>
  </div></header>
  <div className="wrap">
   {page==="home"&&<Browse db={db} me={me} onInterest={interest} onSearch={search} say={say} upd={upd}/>}
   {page==="moves"&&<Browse db={db} me={me} onInterest={interest} onSearch={search} say={say} upd={upd} moveOnly/>}
   {page==="add"&&<Add me={me} upd={upd} done={()=>{setPage("home");say("Item posted")}}/>}
   {page==="mine"&&<MyListings db={db} me={me} upd={upd} say={say} onEdit={l=>{setEditItem(l);setPage("edit")}} onPost={()=>setPage("add")}/>}
   {page==="edit"&&editItem&&<Add key={editItem.id} me={me} upd={upd} edit={editItem} done={()=>{setEditItem(null);setPage("mine");say("Listing updated")}} onCancel={()=>{setEditItem(null);setPage("mine")}}/>}
   {page==="chats"&&<Chats db={db} me={me} upd={upd} k={chatKey} setK={setChatKey} respond={respond}/>}
   {page==="notifs"&&<Notifs list={mine} upd={upd} requests={db.requests||{}} respond={respond} open={k=>{setChatKey(k);setPage("chats")}}/>}
   {page==="admin"&&<Admin db={db} upd={upd} say={say}/>}
  </div>
  {me.role!=="admin"&&<nav className="tabbar" aria-label="Quick navigation">
   {[["home","🏠","Home"],["moves","🏘","Exchange"],["add","＋","Post"],["chats","💬","Chats"],["notifs","🔔","Alerts"]].map(([p,ic,l])=>
    <button key={p} className={"tab"+(p==="add"?" tab-post":"")+(page===p?" on":"")} onClick={()=>setPage(p)} aria-current={page===p?"page":undefined}>
     <span className="tab-ic" aria-hidden="true">{ic}{p==="notifs"&&unread>0&&<span className="badge">{unread}</span>}</span><span>{l}</span>
    </button>)}
  </nav>}
  {toast&&<div className="toast" role="status">{toast}</div>}
 </>;
}
