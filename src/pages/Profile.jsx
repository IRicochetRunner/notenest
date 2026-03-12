// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

// ── ALBUM ART ─────────────────────────────────────────────────
const artCache = {};
function useAlbumArt(title, artist) {
  const [url, setUrl] = useState(artCache[`${title}__${artist}`] || null);
  useEffect(() => {
    const key = `${title}__${artist}`;
    if (artCache[key]) { setUrl(artCache[key]); return; }
    const q = encodeURIComponent(`${title} ${artist}`);
    fetch(`/api/itunes?term=${q}&limit=1`)
      .then(r => r.json()).then(d => {
        const art = d.results?.[0]?.artworkUrl100?.replace("100x100","300x300") || null;
        artCache[key] = art; setUrl(art);
      }).catch(() => {});
  }, [title, artist]);
  return url;
}

// ── STREAK CALC ───────────────────────────────────────────────
function calcStreak(songs) {
  const MONTHS = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const dates = songs
    .map(s => { const [m,d]=(s.date||"").split(" "); return MONTHS[m]!==undefined ? new Date(new Date().getFullYear(),MONTHS[m],+d) : null; })
    .filter(Boolean).map(d => d.toDateString());
  const unique = [...new Set(dates)].sort((a,b)=>new Date(b)-new Date(a));
  let streak=0, check=new Date(); check.setHours(0,0,0,0);
  for (const ds of unique) {
    const d=new Date(ds);
    if (d.toDateString()===check.toDateString()) { streak++; check.setDate(check.getDate()-1); }
    else if (d<check) break;
  }
  return streak;
}

// ── ACHIEVEMENTS ENGINE ───────────────────────────────────────
function computeAchievements(songs) {
  const streak     = calcStreak(songs);
  const mastered   = songs.filter(s=>s.progress===100).length;
  const total      = songs.length;
  const skills     = new Set(songs.flatMap(s=>s.skills||[])).size;
  const rated      = songs.filter(s=>s.rating>0).length;
  const fiveStars  = songs.filter(s=>s.rating===5).length;
  const instruments= new Set(songs.map(s=>s.instrument).filter(Boolean)).size;
  const genres     = new Set(songs.map(s=>s.genre).filter(Boolean)).size;

  return [
    {id:"first_song",  icon:"🎸",color:"#4a72e8",bg:"#e8eeff",label:"First Note",       desc:"Log your first song",           max:1,  val:total,     xp:50  },
    {id:"lib_5",       icon:"📚",color:"#7c3aed",bg:"#f3e8ff",label:"Growing Library",  desc:"Log 5 songs",                   max:5,  val:total,     xp:100 },
    {id:"lib_10",      icon:"🏛️",color:"#1a3a8f",bg:"#dde4f5",label:"Serious Learner",  desc:"Log 10 songs",                  max:10, val:total,     xp:200 },
    {id:"lib_25",      icon:"🌟",color:"#d97706",bg:"#fef3c7",label:"Dedicated",        desc:"Log 25 songs",                  max:25, val:total,     xp:500 },
    {id:"lib_50",      icon:"🏆",color:"#dc2626",bg:"#fee2e2",label:"Legend",           desc:"Log 50 songs",                  max:50, val:total,     xp:1000},
    {id:"first_master",icon:"✨",color:"#16a34a",bg:"#dcfce7",label:"First Master",     desc:"Fully master a song",           max:1,  val:mastered,  xp:100 },
    {id:"master_5",    icon:"💎",color:"#0891b2",bg:"#cffafe",label:"Diamond Hands",    desc:"Master 5 songs",                max:5,  val:mastered,  xp:300 },
    {id:"master_10",   icon:"👑",color:"#d97706",bg:"#fef3c7",label:"Crowned",          desc:"Master 10 songs",               max:10, val:mastered,  xp:750 },
    {id:"streak_3",    icon:"🔥",color:"#ea580c",bg:"#ffedd5",label:"On Fire",          desc:"3-day practice streak",         max:3,  val:streak,    xp:75  },
    {id:"streak_7",    icon:"⚡",color:"#ca8a04",bg:"#fef9c3",label:"Weekly Warrior",   desc:"7-day practice streak",         max:7,  val:streak,    xp:200 },
    {id:"streak_30",   icon:"🌙",color:"#7c3aed",bg:"#f3e8ff",label:"Night Owl",        desc:"30-day practice streak",        max:30, val:streak,    xp:1000},
    {id:"skills_3",    icon:"🎯",color:"#4a72e8",bg:"#e8eeff",label:"Multi-Skilled",    desc:"Track 3 different skills",      max:3,  val:skills,    xp:100 },
    {id:"skills_7",    icon:"🧠",color:"#7c3aed",bg:"#f3e8ff",label:"Skill Master",     desc:"Track 7 different skills",      max:7,  val:skills,    xp:300 },
    {id:"critic",      icon:"⭐",color:"#d97706",bg:"#fef3c7",label:"The Critic",       desc:"Rate 5 songs",                  max:5,  val:rated,     xp:100 },
    {id:"five_stars",  icon:"💫",color:"#d97706",bg:"#fef9c3",label:"Perfectionist",    desc:"Give a song 5 stars",           max:1,  val:fiveStars, xp:150 },
    {id:"multi_inst",  icon:"🎺",color:"#0891b2",bg:"#cffafe",label:"Multi-Instrumentalist",desc:"Log songs on 2+ instruments",max:2, val:instruments,xp:200},
    {id:"genre_3",     icon:"🎨",color:"#16a34a",bg:"#dcfce7",label:"Genre Explorer",   desc:"Log 3 different genres",        max:3,  val:genres,    xp:150 },
  ].map(a=>({...a, earned:a.val>=a.max, pct:Math.min(100,Math.round((a.val/a.max)*100))}));
}

// ── XP LEVELS ─────────────────────────────────────────────────
const XP_LEVELS = [0,100,300,600,1000,1500,2500,4000,6000,9000,15000];
function getXpLevel(xp) {
  let level=1;
  for (let i=1;i<XP_LEVELS.length;i++) { if(xp>=XP_LEVELS[i]) level=i+1; else break; }
  const curr=XP_LEVELS[level-1]||0, next=XP_LEVELS[level]||XP_LEVELS[XP_LEVELS.length-1];
  return {level, pct:Math.min(100,Math.round(((xp-curr)/(next-curr))*100)), next:next-xp};
}

// ── SKILL COLORS ──────────────────────────────────────────────
const SKILL_COLORS = [
  "from-[#1a3a8f] to-[#4a72e8]","from-[#7c3aed] to-[#a855f7]",
  "from-[#0891b2] to-[#06b6d4]","from-[#16a34a] to-[#22c55e]",
  "from-[#d97706] to-[#fbbf24]","from-[#dc2626] to-[#f87171]",
];

// ── SONG CARD ─────────────────────────────────────────────────
function SongCard({ song }) {
  const art = useAlbumArt(song.title, song.artist);
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#dde4f5] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
      <div className="aspect-square w-full overflow-hidden bg-[#e8eeff] relative">
        {art ? <img src={art} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          : <div className="w-full h-full flex items-center justify-center font-black text-4xl text-[#1a3a8f]/30" style={{fontFamily:"Nunito,sans-serif"}}>{song.title[0]}</div>}
        {song.progress===100 && <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">Mastered</div>}
      </div>
      <div className="p-3">
        <div className="font-black text-[#0d1b3e] text-sm truncate" style={{fontFamily:"Nunito,sans-serif"}}>{song.title}</div>
        <div className="text-xs text-[#6b7a9e] truncate mb-2">{song.artist}</div>
        <div className="h-1.5 bg-[#e8eeff] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8] rounded-full" style={{width:`${song.progress||0}%`}}/>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex gap-1 flex-wrap">
            {(song.skills||[]).slice(0,2).map(sk=><span key={sk} className="text-[9px] font-bold bg-[#e8eeff] text-[#1a3a8f] px-1.5 py-0.5 rounded-full">{sk}</span>)}
          </div>
          <span className="text-[9px] text-[#b0baca]">{song.date}</span>
        </div>
      </div>
    </div>
  );
}

// ── ACHIEVEMENT BADGE ─────────────────────────────────────────
function AchievementBadge({ a }) {
  return (
    <div className="relative group flex flex-col items-center gap-1.5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all
        ${a.earned ? "shadow-md group-hover:scale-110" : "opacity-35 grayscale"}`}
        style={{background:a.earned?a.bg:"#f0f4ff"}}>
        {a.icon}
        {a.earned && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
          </div>
        )}
      </div>
      {!a.earned && a.pct>0 && (
        <div className="w-14 h-1 bg-[#e8eeff] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{width:`${a.pct}%`,background:a.color}}/>
        </div>
      )}
      <div className="text-center font-bold text-[10px] text-[#0d1b3e] leading-tight max-w-[56px]">{a.label}</div>
      {/* Tooltip */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#0d1b3e] text-white text-[10px] rounded-xl px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl min-w-max">
        <div className="font-bold mb-0.5">{a.label} {a.earned?"✓":`${a.val}/${a.max}`}</div>
        <div className="text-white/70">{a.desc}</div>
        <div className="text-yellow-300 font-bold">+{a.xp} XP</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0d1b3e]"/>
      </div>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────
function StatCard({ value, label, icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-[#dde4f5] p-3 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{background:bg}}>{icon}</div>
      <div className="font-black text-xl" style={{color,fontFamily:"Nunito,sans-serif"}}>{value}</div>
      <div className="text-[9px] font-bold text-[#6b7a9e] uppercase tracking-wide leading-tight">{label}</div>
    </div>
  );
}

// ── AVATAR UPLOAD ─────────────────────────────────────────────
function AvatarWithUpload({ letter, avatarUrl, isOwner, onUpload }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const handleFile = (e) => {
    const file = e.target.files[0]; if(!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => { localStorage.setItem("nn_avatar",ev.target.result); onUpload(ev.target.result); setUploading(false); };
    reader.readAsDataURL(file);
  };
  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-[#1a3a8f] to-[#4a72e8] flex items-center justify-center">
        {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover"/>
          : <span className="font-black text-4xl text-white" style={{fontFamily:"Nunito,sans-serif"}}>{letter}</span>}
        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/></div>}
      </div>
      {isOwner && (
        <>
          <button onClick={()=>inputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1a3a8f] text-white rounded-full border-2 border-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#4a72e8] transition-colors opacity-0 group-hover:opacity-100 border-none"
            title="Change photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
        </>
      )}
    </div>
  );
}

// ── COPY LINK ─────────────────────────────────────────────────
function CopyLinkButton({ username }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(`${location.origin}/profile/${username}`);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
      className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border border-[#dde4f5] bg-white text-[#1a3a8f] hover:bg-[#e8eeff] transition-all cursor-pointer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
      {copied?"Copied!":"Share profile"}
    </button>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [songs,      setSongs]      = useState([]);
  const [isOwner,    setIsOwner]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("songs");
  const [editingBio, setEditingBio] = useState(false);
  const [bio,        setBio]        = useState("");
  const [tempBio,    setTempBio]    = useState("");
  const [avatarUrl,  setAvatarUrl]  = useState(null);

  useEffect(() => {
    const stored    = localStorage.getItem("nn_profile");
    const storedBio = localStorage.getItem("nn_bio") || "";
    setAvatarUrl(localStorage.getItem("nn_avatar") || null);
    if (stored) {
      const p = JSON.parse(stored);
      setProfile(p); setBio(storedBio);
      const myUsername = p.username||p.name;
      const urlUser    = username?.replace("@","");
      setIsOwner(myUsername?.toLowerCase()===urlUser?.toLowerCase());
    }
    supabase.auth.getUser().then(({data:{user}}) => {
      if (user) {
        supabase.from("songs").select("*").eq("user_id",user.id).order("created_at",{ascending:false})
          .then(({data}) => { if(data) setSongs(data.map(s=>({...s,artworkUrl:s.artwork_url}))); });
      } else {
        const s = localStorage.getItem("nn_songs");
        if (s) setSongs(JSON.parse(s));
      }
    });
  }, [username]);

  const saveBio = async () => {
    localStorage.setItem("nn_bio", tempBio);
    setBio(tempBio); setEditingBio(false);
    const {data:{user}} = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({bio:tempBio}).eq("id",user.id);
  };

  if (!profile) return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1a3a8f] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const displayName  = profile.username||profile.name||"User";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const instrument   = profile.instrument ? profile.instrument.charAt(0).toUpperCase()+profile.instrument.slice(1) : null;
  const level        = profile.level      ? profile.level.charAt(0).toUpperCase()+profile.level.slice(1)           : null;
  const streak       = calcStreak(songs);
  const mastered     = songs.filter(s=>s.progress===100).length;
  const skillCount   = new Set(songs.flatMap(s=>s.skills||[])).size;
  const avgRating    = songs.length ? (songs.reduce((a,s)=>a+(s.rating||0),0)/songs.length).toFixed(1) : "—";
  const achievements = computeAchievements(songs);
  const xp           = achievements.filter(a=>a.earned).reduce((s,a)=>s+a.xp,0);
  const xpInfo       = getXpLevel(xp);
  const earnedCount  = achievements.filter(a=>a.earned).length;
  const skillBreakdown = (() => {
    const map={};
    songs.forEach(sg=>(sg.skills||[]).forEach(sk=>{if(!map[sk])map[sk]={count:0,titles:[]};map[sk].count++;map[sk].titles.push(sg.title);}));
    return Object.entries(map).sort((a,b)=>b[1].count-a[1].count).map(([label,{count,titles}])=>({label,count,titles}));
  })();

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(135deg,#f0f4ff 0%,#e8eeff 100%)"}}>
      {/* Nav */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#dde4f5]/80 bg-white/80 px-6 py-3 flex items-center justify-between">
        <button onClick={()=>navigate("/dashboard")} className="flex items-center gap-2 text-sm font-bold text-[#1a3a8f] bg-transparent border-none cursor-pointer hover:text-[#4a72e8] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1a3a8f] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <span className="font-black text-[#1a3a8f]" style={{fontFamily:"Nunito,sans-serif"}}>NoteNest</span>
        </div>
        {isOwner ? <CopyLinkButton username={username}/> : <div/>}
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-5">

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-3xl border border-[#dde4f5] overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-36 bg-gradient-to-br from-[#1a3a8f] via-[#2d4fa3] to-[#4a72e8] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-28 translate-x-28"/>
            <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/5 rounded-full translate-y-20"/>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 2px 2px,white 1px,transparent 0)",backgroundSize:"24px 24px"}}/>
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <AvatarWithUpload letter={avatarLetter} avatarUrl={avatarUrl} isOwner={isOwner} onUpload={setAvatarUrl}/>
              {isOwner && (
                <button onClick={()=>{setTempBio(bio);setEditingBio(true);}}
                  className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#6b7a9e] bg-[#f0f4ff] border border-[#dde4f5] px-3 py-1.5 rounded-xl cursor-pointer hover:bg-[#e8eeff] transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3 h-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Edit profile
                </button>
              )}
            </div>

            {/* Name + tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="font-black text-2xl text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>@{displayName}</h1>
              {instrument && <span className="text-xs font-bold bg-[#e8eeff] text-[#1a3a8f] px-2.5 py-1 rounded-full">{instrument}</span>}
              {level      && <span className="text-xs font-bold bg-[#f0f4ff] text-[#6b7a9e] px-2.5 py-1 rounded-full border border-[#dde4f5]">{level}</span>}
              {streak>0   && <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">🔥 {streak}-day streak</span>}
            </div>

            {/* XP Level Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#1a3a8f]">Level {xpInfo.level} · {xp.toLocaleString()} XP</span>
                <span className="text-[10px] text-[#b0baca]">{xpInfo.next>0?`${xpInfo.next} XP to next level`:"Max level! 🎉"}</span>
              </div>
              <div className="h-2.5 bg-[#e8eeff] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8] rounded-full transition-all duration-700" style={{width:`${xpInfo.pct}%`}}/>
              </div>
            </div>

            {/* Bio */}
            {editingBio ? (
              <div className="mb-3">
                <textarea value={tempBio} onChange={e=>setTempBio(e.target.value)} rows={3} maxLength={160}
                  placeholder="Tell people about your musical journey..."
                  className="w-full p-3 text-sm rounded-xl border border-[#dde4f5] bg-[#f8f9ff] text-[#0d1b3e] resize-none outline-none focus:border-[#1a3a8f]"/>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-[#b0baca]">{tempBio.length}/160</span>
                  <div className="flex gap-2">
                    <button onClick={()=>setEditingBio(false)} className="text-xs font-bold text-[#6b7a9e] px-3 py-1.5 rounded-xl cursor-pointer bg-transparent border-none">Cancel</button>
                    <button onClick={saveBio} className="text-xs font-bold bg-[#1a3a8f] text-white px-3 py-1.5 rounded-xl cursor-pointer border-none">Save</button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6b7a9e] leading-relaxed mb-3 min-h-[20px]">
                {bio||(isOwner?<span className="italic text-[#b0baca] cursor-pointer hover:text-[#6b7a9e]" onClick={()=>{setTempBio("");setEditingBio(true);}}>Add a bio...</span>:null)}
              </p>
            )}

            {profile.genres?.length>0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.genres.map(g=><span key={g} className="text-[10px] font-bold bg-[#f0f4ff] text-[#6b7a9e] border border-[#dde4f5] px-2.5 py-1 rounded-full">{g}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <StatCard value={songs.length}                          label="Songs logged"  icon="🎵" color="#1a3a8f" bg="#e8eeff"/>
          <StatCard value={skillCount}                            label="Skills"        icon="🎯" color="#7c3aed" bg="#f3e8ff"/>
          <StatCard value={mastered}                              label="Mastered"      icon="✨" color="#16a34a" bg="#dcfce7"/>
          <StatCard value={streak>0?`${streak}d`:"—"}             label="Streak"        icon="🔥" color="#ea580c" bg="#ffedd5"/>
          <StatCard value={avgRating}                             label="Avg rating"    icon="⭐" color="#d97706" bg="#fef3c7"/>
          <StatCard value={`${earnedCount}/${achievements.length}`} label="Badges"      icon="🏆" color="#0891b2" bg="#cffafe"/>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-[#dde4f5] w-fit shadow-sm">
          {[["songs","Songs"],["achievements","Achievements"],["skills","Skills"]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)}
              className={"px-5 py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer transition-all "+(activeTab===id?"bg-[#1a3a8f] text-white shadow-[0_2px_0_#0f2460]":"bg-transparent text-[#6b7a9e] hover:text-[#1a3a8f]")}
              style={{fontFamily:"Nunito,sans-serif"}}>
              {label}
              {id==="achievements"&&earnedCount>0&&<span className="ml-1.5 bg-amber-400 text-white text-[9px] font-black w-4 h-4 rounded-full inline-flex items-center justify-center">{earnedCount}</span>}
            </button>
          ))}
        </div>

        {/* ── SONGS TAB ── */}
        {activeTab==="songs"&&(
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>Library</h2>
              <span className="text-sm text-[#6b7a9e]">{songs.length} songs</span>
            </div>
            {songs.length===0
              ? <div className="bg-white rounded-2xl border border-[#dde4f5] p-12 text-center text-[#6b7a9e]">No songs logged yet.</div>
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{songs.slice(0,12).map(s=><SongCard key={s.id} song={s}/>)}</div>}
          </div>
        )}

        {/* ── ACHIEVEMENTS TAB ── */}
        {activeTab==="achievements"&&(
          <div className="flex flex-col gap-4">
            {/* XP summary */}
            <div className="bg-white rounded-2xl border border-[#dde4f5] p-5 flex items-center justify-between shadow-sm">
              <div>
                <h2 className="font-black text-lg text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>Achievements</h2>
                <p className="text-sm text-[#6b7a9e]">{earnedCount} of {achievements.length} earned</p>
              </div>
              <div className="text-right">
                <div className="font-black text-3xl text-[#d97706]" style={{fontFamily:"Nunito,sans-serif"}}>Lv.{xpInfo.level}</div>
                <div className="text-xs text-[#6b7a9e]">{xp.toLocaleString()} XP total</div>
              </div>
            </div>

            {/* Earned badges grid */}
            {earnedCount>0&&(
              <div className="bg-white rounded-2xl border border-[#dde4f5] p-5 shadow-sm">
                <h3 className="font-black text-sm text-[#0d1b3e] mb-4 uppercase tracking-wider" style={{fontFamily:"Nunito,sans-serif"}}>🏆 Earned ({earnedCount})</h3>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                  {achievements.filter(a=>a.earned).map(a=><AchievementBadge key={a.id} a={a}/>)}
                </div>
              </div>
            )}

            {/* In progress list */}
            <div className="bg-white rounded-2xl border border-[#dde4f5] p-5 shadow-sm">
              <h3 className="font-black text-sm text-[#0d1b3e] mb-4 uppercase tracking-wider" style={{fontFamily:"Nunito,sans-serif"}}>
                ⏳ In Progress ({achievements.filter(a=>!a.earned).length})
              </h3>
              {achievements.filter(a=>!a.earned).length===0
                ? <p className="text-sm text-[#6b7a9e]">All achievements unlocked! 🎉</p>
                : <div className="flex flex-col gap-3">
                    {achievements.filter(a=>!a.earned).map(a=>(
                      <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#f8f9ff] border border-[#dde4f5]">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 opacity-50" style={{background:a.bg}}>{a.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-[#0d1b3e]">{a.label}</span>
                            <span className="text-xs font-bold text-[#6b7a9e]">{a.val}/{a.max}</span>
                          </div>
                          <div className="h-1.5 bg-[#e8eeff] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{width:`${a.pct}%`,background:a.color}}/>
                          </div>
                          <div className="text-[10px] text-[#b0baca] mt-1">{a.desc} · <span className="text-amber-500 font-bold">+{a.xp} XP</span></div>
                        </div>
                      </div>
                    ))}
                  </div>}
            </div>
          </div>
        )}

        {/* ── SKILLS TAB ── */}
        {activeTab==="skills"&&(
          <div>
            <div className="mb-4">
              <h2 className="font-black text-lg text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>Skills breakdown</h2>
              <p className="text-sm text-[#6b7a9e]">Built from your song library</p>
            </div>
            {skillBreakdown.length===0
              ? <div className="bg-white rounded-2xl border border-[#dde4f5] p-12 text-center text-[#6b7a9e]">No skills tracked yet.</div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillBreakdown.map((sk,i)=>(
                    <div key={sk.label} className="bg-white rounded-2xl border border-[#dde4f5] p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>{sk.label}</span>
                        <span className="text-sm font-bold text-[#4a72e8]">{sk.count} song{sk.count!==1?"s":""}</span>
                      </div>
                      <div className="h-2.5 bg-[#e8eeff] rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full bg-gradient-to-r ${SKILL_COLORS[i%SKILL_COLORS.length]}`} style={{width:`${Math.min(100,(sk.count/songs.length)*100)}%`}}/>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sk.titles.slice(0,4).map(t=><span key={t} className="text-[10px] font-semibold text-[#6b7a9e] bg-[#f0f4ff] px-2 py-0.5 rounded-full border border-[#dde4f5]">{t}</span>)}
                        {sk.titles.length>4&&<span className="text-[10px] text-[#b0baca]">+{sk.titles.length-4} more</span>}
                      </div>
                    </div>
                  ))}
                </div>}
          </div>
        )}

        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 bg-[#1a3a8f] rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" className="w-3 h-3"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <span className="font-black text-[#1a3a8f] text-sm" style={{fontFamily:"Nunito,sans-serif"}}>NoteNest</span>
          </div>
          <p className="text-xs text-[#b0baca]">Track your musical journey</p>
        </div>
      </div>
    </div>
  );
}