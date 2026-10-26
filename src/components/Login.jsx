function Login({onLogin,theme,toggleTheme,stats}){
 const [tab,setTab]=useState("student");
 const [f,setF]=useState({name:"",mobile:"",year:"1st year",pass:"",user:""});
 const [err,setErr]=useState("");
 const set=k=>e=>{setErr("");setF({...f,[k]:e.target.value})};
 const go=e=>{
  e.preventDefault();
  if(tab==="admin"){
   // DEMO ONLY: this check runs in the browser. Real admin login must be checked by the backend.
   if(f.user==="admin"&&f.pass==="admin123")onLogin({name:"Admin",role:"admin"});
   else setErr("Wrong admin ID or password.");
   return}
  if(f.name.trim().length<2)return setErr("Enter your full name.");
  if(!/^\d{10}$/.test(f.mobile.replace(/\s/g,"")))return setErr("Enter a 10-digit mobile number.");
  onLogin({name:f.name.trim(),mobile:f.mobile,year:f.year,role:"student"});
 };
 return <div className="lp">
  <header className="lp-nav"><div>
   <span className="logo">ReUse Campus</span>
   <nav className="lp-links" aria-label="Page sections"><a href="#top">Home</a><a href="#why">Why Reuse</a><a href="#steps">How It Works</a><a href="#deals">Deals</a></nav>
   <div className="row" style={{flexWrap:"nowrap"}}><button type="button" className="theme-toggle login-theme" onClick={toggleTheme} aria-label="Toggle theme">{theme==="dark"?"☀":"☾"}</button><a className="btn" href="#login">Log in / Sign up</a></div>
  </div></header>
  <section id="top" className="lp-hero">
   <div>
    <h1>Unleashing the Power of <span className="hl">Sharing</span></h1>
    <p>Transforming campus life with a simple, trusted way to buy, rent and give away what you no longer need.</p>
    <div className="row" style={{marginTop:26}}><a className="btn" href="#login">Get Started with ReUse</a><a className="btn alt" href="#steps">Discover How It Works</a></div>
   </div>
   <div className="orb" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
  </section>
  <section id="why" className="center">
   <h2>Why <span className="hl">ReUse?</span></h2>
   <p>Campus life is full of things used for one semester. Here’s why sharing them matters.</p>
   <div className="feat">
    {[["📦","Affordable","Books, drafters and gear at student-friendly prices."],["🤝","Community-first","Built for your own campus, with reporting and admin moderation."],["🔍","Transparent","Clear condition, price and owner on every item."],["⚡","Efficient","Post in seconds, chat and finish the deal fast."]].map(([ic,t,d])=><div className="card" key={t}><div className="ic">{ic}</div><h3>{t}</h3><p>{d}</p></div>)}
   </div>
  </section>
  <section id="steps" className="center">
   <h2>How it <span className="hl">works</span></h2>
   <p>Three simple steps from “I don’t need this” to “someone is using it”.</p>
   <div className="feat" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
    {[["1","Post it","Add a title, category, condition and a handover spot on campus."],["2","Connect","A student taps “I’m interested” and you chat about the details."],["3","Hand over","Meet at a public campus spot, finish the deal and mark it done."]].map(([n,t,d])=><div className="card" key={n}><div className="ic" style={{fontFamily:"Oswald,sans-serif",fontWeight:600}}>{n}</div><h3>{t}</h3><p>{d}</p></div>)}
   </div>
  </section>
  <section id="impact" className="why">
   <div>
    <h2>Why Reuse <span className="hl">Matters</span></h2>
    <p>By passing things on instead of throwing them away, students save money, cut waste and build a more sustainable campus together.</p>
    <a className="btn" href="#login" style={{marginTop:20}}>Join your campus</a>
   </div>
   <div className="cubes" aria-hidden="true">
    <span style={{left:"8%",top:"20%"}}>☁</span><span style={{left:"40%",top:"4%"}}>📚</span><span style={{left:"58%",top:"36%"}}>🎒</span><span style={{left:"30%",top:"46%"}}>🧮</span><span style={{left:"46%",top:"72%"}}>♻</span>
   </div>
  </section>
  {stats&&<section id="numbers" className="center">
   <h2>Our campus <span className="hl">so far</span></h2>
   <p>Live numbers from ReUse Campus on this device.</p>
   <div style={{marginTop:28,textAlign:"left"}}><ImpactStrip s={stats}/></div>
  </section>}
  <section id="deals" className="center">
   <h2>Deal <span className="hl">Types</span></h2>
   <p>Choose how you want to exchange. Everything on ReUse Campus is free to list.</p>
   <div className="price-grid">
    {[["Buy","₹ Fair price","Pick up what seniors no longer need.",["Browse by category","Chat with the seller","Meet on campus"]],["Rent","₹ Per day","Borrow for the exam or project only.",["Short-term use","Return when done","Save big","Move-in / out deals"],1],["Give Free","₹ 0","Donate items to juniors who need them.",["Zero waste","Quick handover","Help your campus"]]].map(([t,p,d,f,pop])=><div key={t} className={"card pc"+(pop?" pop":"")} style={{textAlign:"left"}}>
     {pop&&<span className="ribbon">Best for exams</span>}<small>{t}</small><div className="big">{p}</div><div className="mute">{d}</div>
     <ul>{f.map(x=><li key={x}>{x}</li>)}</ul></div>)}
   </div>
  </section>
  <div id="login"><form className="card login" onSubmit={go}>
  <p className="eyebrow">YOUR CAMPUS. SHARED BETTER.</p>
  <h1>Share more.<br/>Waste less.</h1>
  <p className="mute">Buy, rent or give away what you don’t need on campus.</p>
  <div className="row" role="tablist" aria-label="Login type">
   <button type="button" role="tab" aria-selected={tab==="student"} className={"chip"+(tab==="student"?" on":"")} onClick={()=>{setTab("student");setErr("")}}>Student login / sign up</button>
   <button type="button" role="tab" aria-selected={tab==="admin"} className={"chip"+(tab==="admin"?" on":"")} onClick={()=>{setTab("admin");setErr("")}}>Admin login</button>
  </div>
  {tab==="student"?<>
   <label htmlFor="l-name">Full name</label><input id="l-name" value={f.name} onChange={set("name")} autoComplete="name"/>
   <label htmlFor="l-mobile">Mobile number</label><input id="l-mobile" value={f.mobile} onChange={set("mobile")} inputMode="numeric" autoComplete="tel" placeholder="10 digits"/>
   <label htmlFor="l-year">Present year</label><select id="l-year" value={f.year} onChange={set("year")}>{["1st year","2nd year","3rd year","4th year"].map(y=><option key={y}>{y}</option>)}</select>
  </>:<>
   <label htmlFor="l-user">Admin ID</label><input id="l-user" value={f.user} onChange={set("user")} autoComplete="username"/>
   <label htmlFor="l-pass">Password</label><input id="l-pass" type="password" value={f.pass} onChange={set("pass")} autoComplete="current-password"/>
  </>}
  {err&&<p style={{color:"var(--coral)"}} role="alert">{err}</p>}
  <button className="btn" style={{width:"100%",marginTop:14}}>{tab==="admin"?"Log in":"Log in / Sign up"}</button>
  {tab==="student"&&<p className="mute" style={{marginBottom:0}}>New here? Just fill in your details. Your account is created automatically the first time.</p>}
  <p className="mute">Your name and year are visible on your listings. Your mobile number is shared only after you accept a request.</p>
 </form></div>
  <div className="lp-foot">© ReUse Campus · Share more. Waste less. Save together.</div>
 </div>;
}
