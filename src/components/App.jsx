function App(){
  const [apiListings, setApiListings] = useState([]);
 const [theme,toggleTheme]=useTheme();
 const [db,setDb]=useState(load);
 const [me,setMe]=useState(null);
 const [page,setPage]=useState("home");
 const [chatKey,setChatKey]=useState(null);
 const [toast,setToast]=useState("");
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
 const say=t=>{setToast(t);setTimeout(()=>setToast(""),2600)};
 const upd=f=>setDb(d=>f(JSON.parse(JSON.stringify(d))));
 const mine=me?db.notifs.filter(n=>n.to===me.name):[];
 const unread=mine.filter(n=>!n.read).length;

 if(!me)return <Login theme={theme} toggleTheme={toggleTheme} onLogin={u=>{setMe(u);setPage(u.role==="admin"?"admin":"home")}}/>;

 const interest=l=>{
  const key=l.id+"|"+me.name;
  upd(d=>{
   d.notifs.unshift({id:Date.now(),to:l.owner.name,text:me.name+" ("+me.year+") is interested in “"+l.title+"”",key,read:false});
   if(!d.chats[key])d.chats[key]=[{from:"sys",text:me.name+" started a chat about “"+l.title+"” ("+money(l)+")"}];
   const x=d.listings.find(i=>i.id===l.id);if(x.status==="available")x.status="requested";
   return d});
  setChatKey(key);setPage("chats");say("Seller notified");
 };
 const search=q=>{
  const w=q.trim().toLowerCase();if(!w)return;
  upd(d=>{d.searches[w]=(d.searches[w]||0)+1;return d});
 };
 const nav=(p,l)=><button className={"nb"+(page===p?" on":"")} onClick={()=>setPage(p)} aria-current={page===p?"page":undefined}>{l}</button>;
 return <>
  <header className="nav"><div className="wrap">
   <span className="logo">ReUse Campus</span>
   <nav className="nav-links" aria-label="Main navigation">
    {me.role==="admin"?nav("admin","Admin panel"): <>{nav("home","Home")}{nav("moves","Move-in / out")}{nav("add","Post item")}{nav("chats","Chats")}{nav("notifs",<>Alerts{unread>0&&<span className="badge">{unread}</span>}</>)}</>}
   </nav>
   <div className="nav-actions">
    <button className="theme-toggle" onClick={toggleTheme} aria-label={theme==="dark"?"Switch to light mode":"Switch to dark mode"} title={theme==="dark"?"Switch to light mode":"Switch to dark mode"}>{theme==="dark"?"☀":"☾"}<span className="theme-label">{theme==="dark"?"Light":"Dark"}</span></button>
    <button className="nb" onClick={()=>setMe(null)}><span className="logout-label">Log out </span>({me.name.split(" ")[0]})</button>
   </div>
  </div></header>
  <div className="wrap">
   {page==="home"&&<Browse db={db} me={me} onInterest={interest} onSearch={search} say={say} upd={upd}/>}
   {page==="moves"&&<Browse db={db} me={me} onInterest={interest} onSearch={search} say={say} upd={upd} moveOnly/>}
   {page==="add"&&<Add me={me} upd={upd} done={()=>{setPage("home");say("Item posted")}}/>}
   {page==="chats"&&<Chats db={db} me={me} upd={upd} k={chatKey} setK={setChatKey}/>}
   {page==="notifs"&&<Notifs list={mine} upd={upd} open={k=>{setChatKey(k);setPage("chats")}}/>}
   {page==="admin"&&<Admin db={db} upd={upd} say={say}/>}
  </div>
  {toast&&<div className="toast" role="status">{toast}</div>}
 </>;
}
