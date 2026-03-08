import { useState, useEffect } from "react";

function MusicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  );
}
function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ── AUTH MODAL ───────────────────────────────────────────────
function AuthModal({ mode, onClose, onToggle }) {
  const isSignup = mode === "signup";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md mx-4 p-10 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#6b7a9e] hover:bg-[#dde4f5] transition-colors border-none cursor-pointer">✕</button>
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 bg-[#1a3a8f] rounded-xl flex items-center justify-center shadow-lg">
            <MusicIcon className="w-5 h-5 text-white"/>
          </div>
          <span className="font-black text-2xl text-[#1a3a8f]" style={{fontFamily:"Nunito, sans-serif"}}>NoteNest</span>
        </div>
        <h2 className="font-black text-3xl text-[#0d1b3e] mb-1" style={{fontFamily:"Nunito, sans-serif"}}>{isSignup ? "Start tracking your progress" : "Welcome back"}</h2>
        <p className="text-[#6b7a9e] text-sm mb-8">{isSignup ? "Free forever. No credit card needed." : "Sign in to your song library."}</p>
        <button className="w-full flex items-center justify-center gap-3 py-3 border-[1.5px] border-[#dde4f5] rounded-xl font-semibold text-sm text-[#0d1b3e] hover:border-[#4a72e8] hover:bg-[#f0f4ff] transition-all mb-4 cursor-pointer bg-white">
          <GoogleIcon/> Continue with Google
        </button>
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#dde4f5]"/>
          <span className="text-xs text-[#6b7a9e] font-semibold whitespace-nowrap">or {isSignup ? "sign up" : "sign in"} with email</span>
          <div className="flex-1 h-px bg-[#dde4f5]"/>
        </div>
        {isSignup && <div className="mb-4"><label className="block text-xs font-bold mb-1.5">Full name</label><input type="text" placeholder="Your name" className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"/></div>}
        <div className="mb-4"><label className="block text-xs font-bold mb-1.5">Email address</label><input type="email" placeholder="you@example.com" className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"/></div>
        <div className="mb-2"><label className="block text-xs font-bold mb-1.5">Password</label><input type="password" placeholder={isSignup ? "Create a password" : "Your password"} className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"/></div>
        <button className="w-full mt-4 py-4 bg-[#1a3a8f] text-white font-black rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer" style={{fontFamily:"Nunito, sans-serif"}}>{isSignup ? "Create free account" : "Sign in"}</button>
        <p className="text-center text-sm text-[#6b7a9e] mt-6">{isSignup ? "Already have an account? " : "No account yet? "}<button onClick={onToggle} className="text-[#1a3a8f] font-bold hover:underline bg-transparent border-none cursor-pointer">{isSignup ? "Sign in" : "Sign up free"}</button></p>
      </div>
    </div>
  );
}

// ── APP PREVIEW ──────────────────────────────────────────────
function SongRowPreview({ name, artist, skills, status, artRef }) {
  const [art, setArt] = useState(null);
  useEffect(() => {
    if (!artRef) return;
    fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(artRef) + "&entity=song&limit=1")
      .then(r => r.json()).then(d => { if (d.results?.[0]) setArt(d.results[0].artworkUrl100.replace("100x100bb","200x200bb")); }).catch(()=>{});
  }, [artRef]);
  return (
    <div className={"flex items-center gap-3 p-3 rounded-2xl border-[1.5px] " + (status === "learned" ? "bg-green-50/60 border-green-200/60" : "bg-[#e8eeff] border-[#1a3a8f]/20")}>
      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#e8eeff] flex items-center justify-center">
        {art ? <img src={art} alt="" className="w-full h-full object-cover"/> : <MusicIcon className="w-4 h-4 text-[#1a3a8f]"/>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate text-[#0d1b3e]">{name}</div>
        <div className="text-xs text-[#6b7a9e]">{artist} · {skills}</div>
      </div>
      {status === "learned"
        ? <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><CheckIcon className="w-3 h-3 text-white"/></div>
        : <span className="text-[10px] font-bold bg-[#1a3a8f] text-white px-2 py-1 rounded-full flex-shrink-0">AI Pick</span>}
    </div>
  );
}

function AppPreview() {
  return (
    <div className="w-[420px] bg-white rounded-3xl border border-[#dde4f5] overflow-hidden shadow-[0_40px_100px_rgba(26,58,143,0.18)]">
      <div className="bg-[#1a3a8f] p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full"/>
        <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full"/>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-white text-base" style={{fontFamily:"Nunito, sans-serif"}}>My Song Library</span>
            <span className="text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-full">14 learned</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Open Chords","Barre Chords","Fingerpicking","Power Chords"].map(s => (
              <span key={s} className="text-xs font-bold bg-white/15 text-white/90 px-3 py-1.5 rounded-full border border-white/10">{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[11px] font-bold tracking-widest uppercase text-[#6b7a9e] mb-3">Recent songs</div>
        <div className="flex flex-col gap-2.5">
          <SongRowPreview name="Wonderwall" artist="Oasis" skills="Open Chords, Strumming" status="learned" artRef="Wonderwall Oasis"/>
          <SongRowPreview name="Come As You Are" artist="Nirvana" skills="Bassline, Groove" status="learned" artRef="Come As You Are Nirvana"/>
          <SongRowPreview name="Hotel California" artist="Eagles" skills="Fingerpicking, Barre Chords" status="rec" artRef="Hotel California Eagles"/>
        </div>
      </div>
    </div>
  );
}

// ── LANDING ──────────────────────────────────────────────────
export default function Landing() {
  const [modal, setModal] = useState(null);
  const openModal = m => setModal(m);
  const closeModal = () => setModal(null);
  const toggleModal = () => setModal(m => m === "signup" ? "signin" : "signup");

  return (
    <div className="min-h-screen bg-[#f0f4ff] text-[#0d1b3e] overflow-x-hidden" style={{fontFamily:"Plus Jakarta Sans, sans-serif"}}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{backgroundImage:"linear-gradient(rgba(26,58,143,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(26,58,143,.035) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-12 py-5 bg-[#f0f4ff]/90 backdrop-blur-xl border-b border-[#dde4f5]">
        <a href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 bg-[#1a3a8f] rounded-xl flex items-center justify-center shadow-lg">
            <MusicIcon className="w-5 h-5 text-white"/>
          </div>
          <span className="font-black text-2xl text-[#1a3a8f]" style={{fontFamily:"Nunito, sans-serif"}}>NoteNest</span>
        </a>
        <div className="flex items-center gap-8">
          {[["#how","How it works"],["#skills","Skills"],["#pricing","Pricing"]].map(([h,l]) => (
            <a key={l} href={h} className="text-[#6b7a9e] text-sm font-semibold hover:text-[#1a3a8f] transition-colors no-underline">{l}</a>
          ))}
          <button onClick={() => openModal("signin")} className="text-[#1a3a8f] text-sm font-bold hover:underline bg-transparent border-none cursor-pointer">Sign in</button>
          <button onClick={() => openModal("signup")} className="bg-[#1a3a8f] text-white font-black text-sm px-6 py-3 rounded-xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer" style={{fontFamily:"Nunito, sans-serif"}}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center px-12 pt-32 pb-20 gap-20" style={{maxWidth:"1400px",margin:"0 auto"}}>
        {/* Left */}
        <div className="flex-[1.1]">
          <div className="inline-flex items-center gap-2 bg-[#e8eeff] border border-[#1a3a8f]/15 text-[#1a3a8f] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 bg-[#4a72e8] rounded-full animate-pulse"/>
            Guitar &amp; Bass Progress Tracker
          </div>

          <h1 className="font-black leading-[1.0] mb-8" style={{fontFamily:"Nunito, sans-serif", fontSize:"clamp(3.5rem,5.5vw,6rem)"}}>
            Stop guessing.<br />
            <span className="text-[#4a72e8] relative inline-block">
              Start progressing.
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[#4a72e8]/12 rounded -z-10"/>
            </span>
          </h1>

          <p className="text-[#6b7a9e] leading-relaxed max-w-xl mb-4" style={{fontSize:"clamp(1rem,1.3vw,1.25rem)"}}>
            NoteNest tracks every song you learn, maps the techniques you're building, and uses AI to tell you exactly what to learn next — so you never waste a practice session again.
          </p>

          <div className="flex flex-wrap gap-3 mb-10 text-sm text-[#6b7a9e]">
            {["No more aimless noodling","Know your real skill level","Always have a next song ready"].map(f => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-2.5 h-2.5 text-white"/>
                </div>
                <span className="font-medium">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-12">
            <button onClick={() => openModal("signup")}
              className="bg-[#1a3a8f] text-white font-black px-10 py-5 rounded-2xl shadow-[0_6px_0_#0f2460,0_10px_30px_rgba(26,58,143,0.3)] hover:-translate-y-1 hover:shadow-[0_9px_0_#0f2460,0_16px_40px_rgba(26,58,143,0.35)] transition-all border-none cursor-pointer"
              style={{fontFamily:"Nunito, sans-serif", fontSize:"1.05rem"}}>
              Track your first song — free
            </button>
            <a href="#how" className="text-[#1a3a8f] font-bold px-6 py-5 rounded-2xl border-2 border-[#dde4f5] bg-white hover:border-[#4a72e8] transition-all no-underline text-sm">
              See how it works
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex">
              {["JM","SK","AL","+"].map((a,i) => (
                <div key={i} className="w-10 h-10 rounded-full border-[3px] border-[#f0f4ff] flex items-center justify-center text-xs font-bold text-[#1a3a8f] -ml-2 first:ml-0"
                  style={{background:["#dde8ff","#ccd9ff","#bbcbff","#aabcff"][i]}}>
                  {a}
                </div>
              ))}
            </div>
            <div>
              <div className="text-amber-400 text-base tracking-wide">★★★★★</div>
              <div className="text-sm text-[#6b7a9e]">Used by <strong className="text-[#0d1b3e]">8,400+</strong> guitar and bass players</div>
            </div>
          </div>
        </div>

        {/* Right — App preview */}
        <div className="flex-1 flex justify-center items-center relative">
          <div className="absolute -top-6 -right-4 bg-white rounded-2xl px-5 py-3 shadow-[0_12px_40px_rgba(26,58,143,0.14)] flex items-center gap-3 z-10 animate-float">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div>
              <div className="text-[11px] text-[#6b7a9e] font-medium">New skill unlocked</div>
              <div className="text-sm font-bold text-[#0d1b3e]">Barre Chords</div>
            </div>
          </div>
          <div className="absolute bottom-16 -left-8 bg-white rounded-2xl px-5 py-3 shadow-[0_12px_40px_rgba(26,58,143,0.14)] flex items-center gap-3 z-10 animate-float2">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-green-600"/>
            </div>
            <div>
              <div className="text-[11px] text-[#6b7a9e] font-medium">AI recommended</div>
              <div className="text-sm font-bold text-[#0d1b3e]">Blackbird — Beatles</div>
            </div>
          </div>
          <AppPreview/>
        </div>
      </section>

      {/* PILLARS */}
      <section className="relative z-10 py-32 px-12" id="features" style={{maxWidth:"1400px",margin:"0 auto"}}>
        <div className="text-center text-xs font-bold tracking-[.14em] uppercase text-[#4a72e8] mb-4">What NoteNest does</div>
        <h2 className="font-black text-center mb-4 leading-tight" style={{fontFamily:"Nunito, sans-serif", fontSize:"clamp(2.2rem,3.5vw,3.5rem)"}}>Three things that make you<br/>a better player</h2>
        <p className="text-center text-[#6b7a9e] max-w-xl mx-auto mb-16" style={{fontSize:"1.05rem"}}>Your song history, skill development, and smart recommendations — all in one place.</p>
        <div className="grid grid-cols-3 gap-8">
          {[
            {num:"01",title:"Track every song you learn",desc:"Add songs to your library as you learn them. Every song you log builds a picture of where you are and how far you've come as a player.",tags:["Song library","Progress history","Setlist builder"],accent:"#16a34a"},
            {num:"02",title:"Map your skills automatically",desc:"Each song is tagged with the techniques it covers — barre chords, fingerpicking, basslines, and more. Your skill map builds itself as your library grows.",tags:["Technique tags","Skill map","Progress bars"],accent:"#4a72e8"},
            {num:"03",title:"AI tells you what to learn next",desc:"The AI looks at your library and surfaces songs at exactly the right difficulty — filling skill gaps, matching your style, and keeping you moving forward.",tags:["Personalised picks","Difficulty matching","Style aware"],accent:"#f0a500"},
          ].map(p => (
            <div key={p.num} className="bg-white border border-[#dde4f5] rounded-3xl p-10 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(26,58,143,0.1)] transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{background:p.accent}}/>
              <div className="absolute top-6 right-8 font-black text-7xl opacity-[.06] leading-none select-none" style={{fontFamily:"Nunito, sans-serif"}}>{p.num}</div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7" style={{background:p.accent+"1a"}}>
                <div className="w-8 h-8" style={{color:p.accent}}>
                  {p.num==="01" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
                  {p.num==="02" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
                  {p.num==="03" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>}
                </div>
              </div>
              <h3 className="font-black text-2xl mb-4" style={{fontFamily:"Nunito, sans-serif"}}>{p.title}</h3>
              <p className="text-[#6b7a9e] leading-relaxed mb-6">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map(t => <span key={t} className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#dde4f5] text-[#6b7a9e]">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-32 px-12 bg-white border-y border-[#dde4f5]" id="how">
        <div className="text-center text-xs font-bold tracking-[.14em] uppercase text-[#4a72e8] mb-4">How it works</div>
        <h2 className="font-black text-center mb-4 leading-tight" style={{fontFamily:"Nunito, sans-serif", fontSize:"clamp(2.2rem,3.5vw,3.5rem)"}}>Simple to start. Powerful over time.</h2>
        <p className="text-center text-[#6b7a9e] max-w-lg mx-auto mb-16" style={{fontSize:"1.05rem"}}>The more songs you log, the smarter NoteNest gets at guiding your progress.</p>
        <div className="grid grid-cols-4 gap-10 max-w-5xl mx-auto relative">
          <div className="absolute top-9 left-[88px] right-[88px] h-0.5" style={{background:"repeating-linear-gradient(90deg,#dde4f5 0,#dde4f5 8px,transparent 8px,transparent 16px)"}}/>
          {[
            {n:1,color:"#16a34a",shadow:"#0d7a30",title:"Add songs you already know",desc:"Start with whatever you can play today — beginner or advanced."},
            {n:2,color:"#1a3a8f",shadow:"#0f2460",title:"Skills get tagged automatically",desc:"Each song is matched to the techniques it covers."},
            {n:3,color:"#4a72e8",shadow:"#2952c4",title:"Get your next recommendation",desc:"AI recommends songs that build on what you know."},
            {n:4,color:"#f0a500",shadow:"#b87d00",title:"Build your setlist",desc:"Pull from your library to create setlists for gigs."},
          ].map(s => (
            <div key={s.n} className="text-center">
              <div className="w-18 h-18 rounded-full font-black text-2xl flex items-center justify-center mx-auto mb-6 text-white relative z-10 w-[4.5rem] h-[4.5rem]" style={{fontFamily:"Nunito, sans-serif",background:s.color,boxShadow:`0 4px 0 ${s.shadow}`}}>{s.n}</div>
              <div className="font-black text-lg mb-2 text-[#0d1b3e]" style={{fontFamily:"Nunito, sans-serif"}}>{s.title}</div>
              <div className="text-sm text-[#6b7a9e] leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SKILLS SPOTLIGHT */}
      <section className="relative z-10 py-32 px-12" id="skills" style={{maxWidth:"1400px",margin:"0 auto"}}>
        <div className="flex items-center gap-24">
          <div className="flex-1">
            <div className="text-xs font-bold tracking-[.14em] uppercase text-[#4a72e8] mb-4">Skill tracking</div>
            <h2 className="font-black leading-tight mb-6" style={{fontFamily:"Nunito, sans-serif", fontSize:"clamp(2.2rem,3.2vw,3.5rem)"}}>See exactly how far<br/>you&apos;ve <span className="text-[#4a72e8]">come</span></h2>
            <p className="text-[#6b7a9e] leading-relaxed max-w-md mb-10" style={{fontSize:"1.05rem"}}>Every song you log builds your skill profile automatically. NoteNest maps your progress across techniques so you always know where you're strong and what to focus on next.</p>
            <button onClick={() => openModal("signup")} className="bg-[#1a3a8f] text-white font-black px-10 py-5 rounded-2xl shadow-[0_6px_0_#0f2460] hover:-translate-y-1 transition-all border-none cursor-pointer" style={{fontFamily:"Nunito, sans-serif", fontSize:"1.05rem"}}>
              Start building your profile
            </button>
          </div>
          <div className="flex-1">
            <div className="bg-white border border-[#dde4f5] rounded-3xl p-8 shadow-[0_16px_60px_rgba(26,58,143,0.1)]">
              <div className="font-bold text-base mb-6 text-[#0d1b3e]" style={{fontFamily:"Nunito, sans-serif"}}>Your skill breakdown</div>
              {[
                {label:"Open Chords",pct:87,cls:"bg-gradient-to-r from-green-600 to-green-400",songs:["Wonderwall","Knockin' on Heaven's Door","+6 more"]},
                {label:"Barre Chords",pct:54,cls:"bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8]",songs:["Hotel California","Sweet Home Chicago"]},
                {label:"Fingerpicking",pct:31,cls:"bg-gradient-to-r from-amber-600 to-amber-400",songs:["Blackbird"]},
                {label:"Bass Grooves",pct:65,cls:"bg-gradient-to-r from-teal-700 to-teal-400",songs:["Come As You Are","Seven Nation Army","+3 more"]},
              ].map(sk => (
                <div key={sk.label} className="mb-6 last:mb-0">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="font-bold text-[#0d1b3e]">{sk.label}</span>
                    <span className="text-[#4a72e8] font-bold">{sk.pct}%</span>
                  </div>
                  <div className="h-2.5 bg-[#e8eeff] rounded-full overflow-hidden mb-2">
                    <div className={"h-full rounded-full " + sk.cls} style={{width:sk.pct+"%"}}/>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {sk.songs.map(s => <span key={s} className="text-xs font-semibold text-[#6b7a9e] bg-[#f0f4ff] px-2.5 py-1 rounded-full border border-[#dde4f5]">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-10 py-32 px-12" id="pricing" style={{maxWidth:"1200px",margin:"0 auto"}}>
        <div className="text-center text-xs font-bold tracking-[.14em] uppercase text-[#4a72e8] mb-4">Pricing</div>
        <h2 className="font-black text-center mb-4" style={{fontFamily:"Nunito, sans-serif", fontSize:"clamp(2.2rem,3.5vw,3.5rem)"}}>Simple, honest pricing</h2>
        <p className="text-center text-[#6b7a9e] mb-16" style={{fontSize:"1.05rem"}}>Start free. Upgrade when you're ready.</p>
        <div className="grid grid-cols-3 gap-8 items-start">
          {[
            {name:"Free",price:"0",period:"Forever free",featured:false,features:["Up to 20 songs in your library","Basic skill tracking","5 AI recommendations per month","1 setlist"],cta:"Get started free"},
            {name:"Pro",price:"7",period:"per month · cancel anytime",featured:true,features:["Unlimited song library","Full skill and technique tracking","Unlimited AI recommendations","Unlimited setlists","Difficulty and style matching","Monthly progress reports"],cta:"Start Pro free for 7 days"},
            {name:"Annual",price:"5",period:"per month · billed $60/year",featured:false,features:["Everything in Pro","Save $24 per year","Early access to new features","Yearly skill progress report"],cta:"Get Annual plan"},
          ].map(plan => (
            <div key={plan.name} className={"rounded-3xl p-10 relative transition-all duration-300 " + (plan.featured ? "bg-[#1a3a8f] shadow-[0_20px_60px_rgba(26,58,143,0.35)] scale-[1.04]" : "bg-white border border-[#dde4f5] hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(26,58,143,0.1)]")}>
              {plan.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f0a500] text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-wider whitespace-nowrap">Most Popular</div>}
              <div className={"text-sm font-black mb-2 " + (plan.featured ? "text-white/60" : "text-[#6b7a9e]")} style={{fontFamily:"Nunito, sans-serif"}}>{plan.name}</div>
              <div className={"font-black leading-none mb-2 " + (plan.featured ? "text-white" : "text-[#0d1b3e]")} style={{fontFamily:"Nunito, sans-serif", fontSize:"4rem"}}>
                {plan.price==="0" ? "$0" : <><sup className="text-2xl align-super font-black">$</sup>{plan.price}</>}
              </div>
              <div className={"text-sm mb-8 " + (plan.featured ? "text-white/50" : "text-[#6b7a9e]")}>{plan.period}</div>
              <div className={"h-px mb-7 " + (plan.featured ? "bg-white/15" : "bg-[#dde4f5]")}/>
              <ul className="flex flex-col gap-4 mb-10">
                {plan.features.map(f => (
                  <li key={f} className={"flex items-center gap-3 font-medium " + (plan.featured ? "text-white/90" : "text-[#0d1b3e]")}>
                    <div className={"w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 " + (plan.featured ? "bg-white/20" : "bg-[#1a3a8f]/10")}>
                      <CheckIcon className={"w-2.5 h-2.5 " + (plan.featured ? "text-white" : "text-[#1a3a8f]")}/>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => openModal("signup")}
                className={"w-full py-4 rounded-2xl font-black cursor-pointer border-none transition-all text-base " + (plan.featured ? "bg-white text-[#1a3a8f] shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5" : "bg-transparent text-[#0d1b3e] hover:border-[#4a72e8] hover:text-[#1a3a8f]")}
                style={{fontFamily:"Nunito, sans-serif", border:plan.featured?"none":"2px solid #dde4f5"}}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <div className="relative z-10 mx-12 mb-24 bg-[#1a3a8f] rounded-3xl p-20 flex items-center justify-between gap-12 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full pointer-events-none"/>
        <div className="absolute -bottom-16 left-1/3 w-56 h-56 bg-white/5 rounded-full pointer-events-none"/>
        <div className="relative z-10">
          <h2 className="font-black text-white mb-3 leading-tight" style={{fontFamily:"Nunito, sans-serif", fontSize:"clamp(2rem,3vw,3rem)"}}>
            Stop wondering what to learn next.<br/>Start knowing.
          </h2>
          <p className="text-white/60 text-lg">Free to start. No credit card required.</p>
        </div>
        <div className="flex gap-4 flex-shrink-0 relative z-10">
          <button onClick={() => openModal("signup")} className="bg-white text-[#1a3a8f] font-black px-10 py-5 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all border-none cursor-pointer text-base" style={{fontFamily:"Nunito, sans-serif"}}>
            Create free account
          </button>
          <button onClick={() => openModal("signin")} className="text-white/80 font-bold px-6 py-5 rounded-2xl border border-white/25 hover:border-white/50 hover:text-white transition-all bg-transparent cursor-pointer">
            Sign in
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 px-12 py-10 border-t border-[#dde4f5] flex items-center justify-between text-[#6b7a9e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a3a8f] rounded-lg flex items-center justify-center">
            <MusicIcon className="w-4 h-4 text-white"/>
          </div>
          <span className="font-black text-xl text-[#1a3a8f]" style={{fontFamily:"Nunito, sans-serif"}}>NoteNest</span>
        </div>
        <div className="text-sm">&copy; 2025 NoteNest. Built for guitar and bass players.</div>
        <div className="flex gap-8">
          {["Privacy","Terms","Contact"].map(l => <a key={l} href="#" className="text-sm text-[#6b7a9e] hover:text-[#1a3a8f] no-underline transition-colors">{l}</a>)}
        </div>
      </footer>

      {modal && <AuthModal mode={modal} onClose={closeModal} onToggle={toggleModal}/>}
    </div>
  );
}