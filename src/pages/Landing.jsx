import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

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

// ── REAL AUTH MODAL ──────────────────────────────────────────
function AuthModal({ mode, onClose, onToggle }) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (isSignup) {
        const username = (name.trim().split(" ")[0] || "user").toLowerCase().replace(/[^a-z0-9]/g, "");
        const { data, error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { username, full_name: name } }
        });
        if (e) throw e;
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username,
            email,
            created_at: new Date().toISOString(),
          });
          localStorage.setItem("nn_profile", JSON.stringify({ username, name }));
          onClose();
          navigate("/onboarding");
        }
      } else {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        const username = data.user.user_metadata?.username || email.split("@")[0];
        localStorage.setItem("nn_profile", JSON.stringify({ username }));
        onClose();
        navigate("/dashboard");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" }
    });
  }

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

        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-3 border-[1.5px] border-[#dde4f5] rounded-xl font-semibold text-sm text-[#0d1b3e] hover:border-[#4a72e8] hover:bg-[#f0f4ff] transition-all mb-4 cursor-pointer bg-white">
          <GoogleIcon/> Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#dde4f5]"/>
          <span className="text-xs text-[#6b7a9e] font-semibold whitespace-nowrap">or {isSignup ? "sign up" : "sign in"} with email</span>
          <div className="flex-1 h-px bg-[#dde4f5]"/>
        </div>

        {isSignup && (
          <div className="mb-4">
            <label className="block text-xs font-bold mb-1.5 text-[#6b7a9e] uppercase tracking-wider">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
              className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"/>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-xs font-bold mb-1.5 text-[#6b7a9e] uppercase tracking-wider">Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"/>
        </div>
        <div className="mb-2">
          <label className="block text-xs font-bold mb-1.5 text-[#6b7a9e] uppercase tracking-wider">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder={isSignup ? "Create a password" : "Your password"}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"/>
        </div>

        {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
        {success && <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{success}</div>}

        <button onClick={handleSubmit} disabled={loading || !email || !password}
          className="w-full mt-5 py-4 bg-[#1a3a8f] text-white font-black rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{fontFamily:"Nunito, sans-serif"}}>
          {loading ? "Loading..." : isSignup ? "Create free account" : "Sign in"}
        </button>

        <p className="text-center text-sm text-[#6b7a9e] mt-6">
          {isSignup ? "Already have an account? " : "No account yet? "}
          <button onClick={onToggle} className="text-[#1a3a8f] font-bold hover:underline bg-transparent border-none cursor-pointer">
            {isSignup ? "Sign in" : "Sign up free"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ── APP PREVIEW ──────────────────────────────────────────────
function SongRowPreview({ name, artist, skills, status, artRef }) {
  const [art, setArt] = useState(null);
  useEffect(() => {
    if (!artRef) return;
    fetch("/api/itunes?term=" + encodeURIComponent(artRef) + "&limit=1")
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

  // If already logged in, go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/dashboard";
    });
  }, []);

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
            NoteNest tracks every song you learn, maps the techniques you're building, and uses AI to tell you exactly what to learn next.
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
        <div className="flex-1 flex justify-center items-center relative">
          <AppPreview/>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{background:"#eef1fa", padding:"80px 0"}}>
        <div style={{maxWidth:"1100px", margin:"0 auto", padding:"0 48px"}}>
          <div className="text-center text-xs font-bold tracking-[.14em] uppercase text-[#4a72e8] mb-4">How it works</div>
          <h2 className="font-black text-center mb-4 text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif", fontSize:"clamp(2rem,3vw,3rem)"}}>Track your progress like a pro</h2>
          <p className="text-center text-[#6b7a9e] mb-16 text-base">Three simple steps to level up your playing.</p>
          <div className="grid gap-8" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
            {[
              { step:"01", title:"Log a song", desc:"Add any song you're learning or have learned. Rate it, tag your skills, track your progress percentage, and add notes on what to work on.", color:"#1a3a8f" },
              { step:"02", title:"Build your library", desc:"Your song library grows into a visual map of your musical journey. See patterns in what you play, which skills you're developing, and what to tackle next.", color:"#7c3aed" },
              { step:"03", title:"Level up with Packs", desc:"Follow curated learning packs from legends like Flea, Jimi Hendrix, and Bernard Edwards. Tick off songs as you learn them and follow a structured path.", color:"#0891b2" },
            ].map(({step,title,desc,color}) => (
              <div key={step} className="bg-white rounded-3xl p-8 shadow-sm border border-[#dde4f5] relative overflow-hidden">
                <div className="font-black text-7xl select-none pointer-events-none mb-2" style={{color, fontFamily:"Nunito,sans-serif", opacity:0.08, lineHeight:1}}>{step}</div>
                <h3 className="font-black text-xl text-[#0d1b3e] mb-3" style={{fontFamily:"Nunito,sans-serif"}}>{title}</h3>
                <p className="text-[#6b7a9e] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="grid gap-4 mt-10" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
            {[
              { title:"Song diary", desc:"Every song you log builds a full history of your learning journey with dates, ratings, and notes." },
              { title:"Skill breakdown", desc:"See exactly which techniques you're strongest in — built automatically from your song library." },
              { title:"Streak tracking", desc:"Build daily practice habits. Your streak counter keeps you accountable and motivated." },
              { title:"Setlist builder", desc:"Drag and drop songs into setlists for gigs, practice sessions, or jam nights." },
              { title:"Learning packs", desc:"Follow curated song collections from world-class musicians to build real technique." },
              { title:"Song structure", desc:"Map out song sections visually — verse, chorus, bridge — so you never lose your place." },
            ].map(({title,desc}) => (
              <div key={title} className="flex gap-4 items-start bg-white rounded-2xl p-5 border border-[#dde4f5] shadow-sm">
                <div className="w-7 h-7 rounded-xl bg-[#e8eeff] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div className="font-black text-sm text-[#0d1b3e] mb-1" style={{fontFamily:"Nunito,sans-serif"}}>{title}</div>
                  <div className="text-xs text-[#6b7a9e] leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{background:"#fff", padding:"80px 0"}}>
        <div style={{maxWidth:"1100px", margin:"0 auto", padding:"0 48px"}}>
          <div className="text-center text-xs font-bold tracking-[.14em] uppercase text-[#4a72e8] mb-4">Skills</div>
          <h2 className="font-black text-center mb-4 text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif", fontSize:"clamp(2rem,3vw,3rem)"}}>Know exactly what you're learning</h2>
          <p className="text-center text-[#6b7a9e] mb-16 text-base max-w-xl mx-auto">Tag skills when you log a song. NoteNest builds your breakdown automatically — no manual tracking needed.</p>

          <div className="grid gap-6 mb-12" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
            {[
              { label:"Fingerpicking",    pct:78, color:"from-[#1a3a8f] to-[#4a72e8]",   songs:["Blackbird","Hotel California","Wish You Were Here"] },
              { label:"Slap Bass",        pct:65, color:"from-[#7c3aed] to-[#a855f7]",   songs:["Never Too Much","Forget Me Nots","Can't Stop"] },
              { label:"Barre Chords",     pct:54, color:"from-[#0891b2] to-[#22d3ee]",   songs:["Sultans of Swing","Back in Black","No Woman No Cry"] },
              { label:"Groove & Pocket",  pct:45, color:"from-[#d97706] to-[#fbbf24]",   songs:["Good Times","Le Freak","Billie Jean"] },
            ].map(({label,pct,color,songs}) => (
              <div key={label} className="bg-[#f8f9ff] rounded-2xl p-6 border border-[#dde4f5]">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-black text-sm text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>{label}</span>
                  <span className="text-xs font-bold text-[#4a72e8]">{pct}%</span>
                </div>
                <div className="h-2.5 bg-[#e8eeff] rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{width:`${pct}%`}}/>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {songs.map(s => <span key={s} className="text-[10px] font-bold text-[#6b7a9e] bg-white px-2 py-1 rounded-full border border-[#dde4f5]">{s}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8] rounded-3xl p-10 text-center text-white">
            <h3 className="font-black text-2xl mb-3" style={{fontFamily:"Nunito,sans-serif"}}>40+ skills tracked automatically</h3>
            <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">From fingerpicking and slap bass to sweep picking and chord melody — every technique you tag builds your profile.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Fingerpicking","Slap Bass","Power Chords","Chord Melody","Groove","Lead Guitar","Fingerstyle","Barre Chords","Sweep Picking","Blues Lead","Riff","Walking Bass","Thumb Slap","Legato"].map(s => (
                <span key={s} className="text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/20">{s}</span>
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
            {name:"Free",price:"0",period:"Forever free",featured:false,features:["Up to 20 songs","Basic skill tracking","5 AI recommendations/month","1 setlist"],cta:"Get started free"},
            {name:"Pro",price:"7",period:"per month · cancel anytime",featured:true,features:["Unlimited songs","Full skill tracking","Unlimited AI recommendations","Unlimited setlists","Monthly progress reports"],cta:"Start Pro free for 7 days"},
            {name:"Annual",price:"5",period:"per month · $60 billed upfront yearly",featured:false,features:["Everything in Pro","$60 charged once per year","Save $24 vs monthly","Early access to new features","Yearly skill report"],cta:"Get Annual plan"},
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