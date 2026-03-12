import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../supabase";
import AuthModal from "../components/AuthModal";
import LogSongModal from "./LogSongModal";
import SetlistBuilder from "./SetlistBuilder";

// Module-level flag — survives re-renders, resets on true page reload
let _dashboardMounted = false;

// ── PRO FLAG — now loaded from Supabase profiles ──
// IS_PRO is kept as a fallback only during local dev, set to true to test
const IS_PRO_DEV_OVERRIDE = false;

// ── PRO GATE COMPONENT ───────────────────────────────────────
function ProGate({ title, description, features, onUpgrade }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-amber-500">
          <path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z"/>
        </svg>
      </div>
      <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-black px-3 py-1 rounded-full mb-3">
        PRO FEATURE
      </div>
      <h3 className="font-black text-2xl text-[#0d1b3e] mb-2" style={{fontFamily:"Nunito,sans-serif"}}>{title}</h3>
      <p className="text-sm text-[#6b7a9e] mb-6 max-w-sm leading-relaxed">{description}</p>
      <div className="bg-[#f0f4ff] rounded-2xl p-4 w-full max-w-sm mb-6 text-left">
        {features.map(f => (
          <div key={f} className="flex items-center gap-2.5 py-1.5">
            <div className="w-4 h-4 bg-[#1a3a8f] rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" className="w-2 h-2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="text-xs font-bold text-[#0d1b3e]">{f}</span>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} className="w-full max-w-sm bg-[#1a3a8f] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer text-sm"
        style={{fontFamily:"Nunito,sans-serif"}}>
        Upgrade to Pro — $7/mo
      </button>
      <p className="text-xs text-[#b0baca] mt-3">Cancel anytime · $60/yr saves 37%</p>
    </div>
  );
}
import SongStructureDiagram from "../components/SongStructureDiagram";
import Packs from "../components/Packs";

// ── ICONS ────────────────────────────────────────────────────
function MusicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function StarIcon({ className, filled, onClick }) {
  return (
    <svg className={className} onClick={onClick} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function GridIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}
function ListIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function StructureIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="8" height="11" rx="1"/><rect x="10" y="16" width="4" height="5" rx="1"/>
    </svg>
  );
}
function TrophyIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M11 3H4v5c0 2.757 1.74 5.12 4.2 6.027L7.5 17H6a1 1 0 000 2h12a1 1 0 000-2h-1.5l-.7-2.973C18.26 13.12 20 10.757 20 8V3h-7zm7 5c0 2.206-1.794 4-4 4h-.126C13.566 11.447 13.109 11 13 11h-2c-.109 0-.566.447-.874 1H10c-2.206 0-4-1.794-4-4V5h12v3zM7 3V2a1 1 0 012 0v1H7zm8 0V2a1 1 0 012 0v1h-2z"/></svg>;
}
function FlameIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-1 .23-1.97.75-2.73 1.5-2.25 2.25-2.48 5.77-.72 8.31.13.19.14.44 0 .63-.14.2-.4.27-.61.17-.87-.42-1.62-1.17-2.1-2.07C7.33 12.37 7.29 13.56 7.8 14.6c.74 1.53 2.18 2.6 3.77 2.89C13.63 17.9 15.58 17.72 17 16.76c.67-.45 1.23-1.1 1.5-1.87.27-.76.23-1.6-.05-2.34-.34-.87-.83-1.6-1.79-1.35zm-4 8.05c-1.44.44-3.06.06-4.1-1.02-1.1-1.1-1.23-2.72-.7-4.1.47-.81.92-1.64.9-2.57-.02-.94-.35-1.83-.86-2.6C8.2 8.04 8.5 7 8.97 6.09c-.6.97-.77 2.13-.64 3.23.12.98.51 1.91 1.09 2.7.44.6.88 1.16.88 1.97 0 .46-.22.88-.58 1.17-.6.5-1.47.53-2.07.04-.22-.18-.5-.24-.76-.14-.26.1-.44.34-.44.62v.13c0 2.21 1.79 4 4 4h.1c1.65-.01 3.1-.94 3.76-2.36.4-.84.42-1.81.05-2.66-.23-.55-.63-1-1.15-1.3.36.67.52 1.45.33 2.21-.2.76-.7 1.44-1.38 1.84z"/></svg>;
}
function BookOpenIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 2H9C7.35 2 6 3.35 6 5v2H5C3.35 7 2 8.35 2 10v11c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-2h1c1.65 0 3-1.35 3-3V5c0-1.65-1.35-3-3-3zM4 10c0-.55.45-1 1-1h1v8H5c-.37 0-.72.08-1 .22V10zm14 10H6v-1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v1zm3-4c0 .55-.45 1-1 1h-1V9c0-1.65-1.35-3-3-3H8V5c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v11z"/></svg>;
}
function TargetIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-3-5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/></svg>;
}
function SparkleIcon({ className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/></svg>;
}
function GuitarIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>;
}
function CameraIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}
function ZapIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function LockIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

// ── DATA ─────────────────────────────────────────────────────
const INIT_SONGS = [
  { id:1, title:"Wonderwall",              artist:"Oasis",             skills:["Open Chords","Strumming"],            rating:5, progress:95,  date:"Feb 28", notes:"Classic opener. Nailed the strumming pattern finally.", parts:["Intro","Verse","Chorus"], structure:[{id:"i1",type:"Intro"},{id:"v1",type:"Verse"},{id:"c1",type:"Chorus"},{id:"v2",type:"Verse"},{id:"c2",type:"Chorus"},{id:"o1",type:"Outro"}] },
  { id:2, title:"Come As You Are",         artist:"Nirvana",           skills:["Bassline","Groove"],                  rating:4, progress:80,  date:"Feb 25", notes:"Bass groove is super fun once it clicks." },
  { id:3, title:"Hotel California",        artist:"Eagles",            skills:["Fingerpicking","Barre Chords"],       rating:4, progress:65,  date:"Feb 20", notes:"Intro still needs work but the chorus is solid." },
  { id:4, title:"Blackbird",              artist:"The Beatles",        skills:["Fingerpicking","Thumb Independence"], rating:5, progress:90,  date:"Feb 15", notes:"Hardest thing I have learned so far. Worth it." },
  { id:5, title:"Seven Nation Army",       artist:"The White Stripes", skills:["Riff","Power Chords"],               rating:3, progress:100, date:"Feb 10", notes:"Simple but sounds great live." },
  { id:6, title:"Wish You Were Here",      artist:"Pink Floyd",        skills:["Fingerpicking","Open Chords"],        rating:5, progress:85,  date:"Feb 5",  notes:"My favourite song to play by far." },
  { id:7, title:"Stairway to Heaven",      artist:"Led Zeppelin",      skills:["Fingerpicking","Barre Chords","Lead"],rating:4, progress:50,  date:"Jan 30", notes:"Still working on the solo section." },
  { id:8, title:"Knockin on Heavens Door", artist:"Bob Dylan",         skills:["Open Chords","Strumming"],            rating:3, progress:100, date:"Jan 25", notes:"Great beginner song to add to the repertoire." },
];

const AI_REC = { title:"Tears in Heaven", artist:"Eric Clapton", level:"Intermediate", reason:"Based on your fingerpicking skills and love of emotional ballads", skills:["Fingerpicking","Chord Melody"] };

function SkillsTab({ songs, onSelectSong }) {
  const skillData = buildSkillData(songs);
  const [activeSkill, setActiveSkill] = useState(null);
  const active = skillData.find(s => s.label === activeSkill);

  if (skillData.length === 0) return (
    <div className="text-center py-16 text-[#6b7a9e] text-sm">
      No skills logged yet — add skills when logging songs to see your breakdown.
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="flex flex-col gap-3 lg:w-80 flex-shrink-0">
        {skillData.map((sk) => (
          <div key={sk.label}
            onClick={() => setActiveSkill(activeSkill === sk.label ? null : sk.label)}
            className={"bg-white rounded-2xl border p-5 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md " +
              (activeSkill === sk.label ? "border-[#4a72e8] ring-2 ring-[#4a72e8]/20" : "border-[#dde4f5]")}>
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span className="font-bold text-[#0d1b3e]">{sk.label}</span>
              <span className="text-[#4a72e8] font-bold">{sk.pct}% · {sk.songs.length} song{sk.songs.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="h-3 bg-[#e8eeff] rounded-full overflow-hidden">
              <div className={"h-full rounded-full bg-gradient-to-r "+sk.color} style={{ width:sk.pct+"%" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1">
        {active ? (
          <div className="bg-white rounded-2xl border border-[#dde4f5] p-5 shadow-sm">
            <h3 className="font-black text-lg text-[#0d1b3e] mb-1" style={{fontFamily:"Nunito,sans-serif"}}>{active.label}</h3>
            <p className="text-xs text-[#6b7a9e] mb-4">{active.songs.length} song{active.songs.length !== 1 ? "s" : ""} in your library build this skill</p>
            <div className="flex flex-col gap-2">
              {active.songs.map(s => (
                <div key={s.id}
                  onClick={() => onSelectSong(s)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#dde4f5] hover:border-[#4a72e8] hover:bg-[#f8f9ff] cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <AlbumArt song={s} className="w-full h-full object-cover" fallbackClassName="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#0d1b3e] truncate">{s.title}</div>
                    <div className="text-xs text-[#6b7a9e] truncate">{s.artist}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => <StarIcon key={n} className={"w-3 h-3 "+(n<=s.rating?"text-amber-400":"text-[#dde4f5]")} filled={n<=s.rating} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-48 flex items-center justify-center rounded-2xl border-2 border-dashed border-[#dde4f5] text-[#6b7a9e] text-sm p-12 text-center">
            Click a skill to see which songs in your library build it
          </div>
        )}
      </div>
    </div>
  );
}

const SKILL_COLORS = [
  "from-[#1a3a8f] to-[#4a72e8]",
  "from-green-600 to-green-400",
  "from-teal-700 to-teal-400",
  "from-amber-600 to-amber-400",
  "from-purple-700 to-purple-400",
  "from-rose-600 to-rose-400",
  "from-cyan-700 to-cyan-400",
  "from-orange-600 to-orange-400",
];

function buildSkillData(songs) {
  const map = {};
  songs.forEach(song => {
    (song.skills || []).forEach(skill => {
      if (!map[skill]) map[skill] = [];
      map[skill].push(song);
    });
  });
  const total = songs.length || 1;
  return Object.entries(map)
    .map(([label, skillSongs], i) => ({
      label,
      songs: skillSongs,
      pct: Math.round((skillSongs.length / total) * 100),
      color: SKILL_COLORS[i % SKILL_COLORS.length],
    }))
    .sort((a, b) => b.songs.length - a.songs.length);
}

// ── ALBUM ART CACHE (module-level so it persists across re-renders) ──────────
const artCache = {};

function useAlbumArt(query) {
  const [art, setArt] = useState(() => artCache[query] || null);

  useEffect(() => {
    if (!query) return;
    if (artCache[query]) { setArt(artCache[query]); return; }

    // Use iTunes search with a small delay to avoid rate limiting
    const timer = setTimeout(async () => {
      try {
        // Try proxy first (works on Vercel), fall back to direct (works locally)
        let results = [];
        try {
          const res = await fetch(`/api/itunes?term=${encodeURIComponent(query)}&limit=3`);
          if (res.ok) { const d = await res.json(); results = d.results || []; }
        } catch(e) {}
        if (!results.length) {
          const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=3&media=music`);
          const d = await res.json(); results = d.results || [];
        }
        const result = results.find(r => r.artworkUrl100) || results[0];
        if (result?.artworkUrl100) {
          const url = result.artworkUrl100.replace("100x100bb", "600x600bb");
          artCache[query] = url;
          setArt(url);
        }
      } catch(e) {}
    }, Math.random() * 500 + 100);

    return () => clearTimeout(timer);
  }, [query]);

  return art;
}

// ── ALBUM ART IMAGE with fallback ────────────────────────────
function AlbumArt({ song, className, fallbackClassName }) {
  const stored = song.artwork_url || song.artworkUrl || null;
  const fetched = useAlbumArt(stored ? null : (song.title + " " + song.artist));
  const art = stored || fetched;
  const [failed, setFailed] = useState(false);

  if (art && !failed) {
    return (
      <img
        src={art}
        alt={song.title}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }
  // Colourful placeholder using first letter + a deterministic colour
  const colors = ["#1a3a8f","#7c3aed","#0f766e","#b45309","#be123c","#1d4ed8","#065f46"];
  const bg = colors[song.id % colors.length];
  return (
    <div
      className={fallbackClassName || className}
      style={{ background: `linear-gradient(135deg, ${bg}dd, ${bg}88)`, display:"flex", alignItems:"center", justifyContent:"center" }}
    >
      <span style={{ fontSize:"1.5rem", fontWeight:900, color:"rgba(255,255,255,.7)", fontFamily:"Nunito,sans-serif", userSelect:"none" }}>
        {song.title[0]}
      </span>
    </div>
  );
}

// ── STAR RATING ──────────────────────────────────────────────
function StarRating({ value, onChange, size = "w-5 h-5" }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <StarIcon key={n} className={size + " cursor-pointer transition-colors " + (n <= (hovered || value) ? "text-amber-400" : "text-[#dde4f5]")}
          filled={n <= (hovered || value)} onClick={() => onChange && onChange(n)} />
      ))}
    </div>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────────────
function ProgressBar({ value, onChange }) {
  const labels = ["Just started","Getting there","Pretty solid","Nearly there","Nailed it!"];
  const idx = Math.min(4, Math.floor(value / 20));
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-[#6b7a9e] mb-1.5">
        <span>Progress</span>
        <span className={"font-bold " + (value === 100 ? "text-green-600" : "text-[#1a3a8f]")}>{value}% · {labels[idx]}</span>
      </div>
      <input type="range" min="0" max="100" value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor:"#1a3a8f" }} />
    </div>
  );
}

// ── SONG PARTS ───────────────────────────────────────────────
const PART_COLORS = {
  Intro:       { bg:"bg-violet-500", light:"bg-violet-100", text:"text-violet-700", border:"border-violet-300", hex:"#8b5cf6" },
  Verse:       { bg:"bg-blue-500",   light:"bg-blue-100",   text:"text-blue-700",   border:"border-blue-300",   hex:"#3b82f6" },
  "Pre-chorus":{ bg:"bg-cyan-500",   light:"bg-cyan-100",   text:"text-cyan-700",   border:"border-cyan-300",   hex:"#06b6d4" },
  Chorus:      { bg:"bg-[#1a3a8f]",  light:"bg-indigo-100", text:"text-indigo-700", border:"border-indigo-300", hex:"#1a3a8f" },
  Bridge:      { bg:"bg-amber-500",  light:"bg-amber-100",  text:"text-amber-700",  border:"border-amber-300",  hex:"#f59e0b" },
  Outro:       { bg:"bg-rose-500",   light:"bg-rose-100",   text:"text-rose-700",   border:"border-rose-300",   hex:"#ef4444" },
};
const DEFAULT_PARTS = ["Intro","Verse","Pre-chorus","Chorus","Bridge","Outro"];

// shared hex lookup (mirrors SongStructureDiagram's getPartColor)
const PART_HEX_LOOKUP = {
  Intro: "#8b5cf6", Verse: "#3b82f6", "Pre-chorus": "#06b6d4",
  Chorus: "#1a3a8f", Bridge: "#f59e0b", Outro: "#ef4444",
  Solo: "#10b981", Riff: "#ec4899",
};
function resolveHex(label) {
  if (PART_HEX_LOOKUP[label]) return PART_HEX_LOOKUP[label];
  const k = Object.keys(PART_HEX_LOOKUP).find(k => label?.toLowerCase().startsWith(k.toLowerCase()));
  return k ? PART_HEX_LOOKUP[k] : "#4a72e8";
}

function PartsBar({ song }) {
  const structure = song?.structure || [];
  const parts     = song?.parts || [];
  const segments  = structure.length > 0
    ? structure
    : parts.map((p, i) => ({ id: i, type: typeof p === "string" ? p : p.label }));
  if (segments.length === 0) return <div className="w-24 h-2 bg-[#e8eeff] rounded-full opacity-40" />;
  const learnedSet = new Set(parts.map(p => typeof p === "string" ? p : p.label));
  return (
    <div className="flex gap-px w-28 h-2.5 rounded-full overflow-hidden">
      {segments.map((seg, i) => {
        const type    = seg.type || seg.label || seg;
        const learned = learnedSet.has(type);
        return <div key={seg.id ?? i} className="flex-1 h-full rounded-sm"
          style={{ background: learned ? resolveHex(type) : "#e8eeff" }} />;
      })}
    </div>
  );
}

function SongPartsTracker({ parts, structure, onUpdate }) {
  const [customInput, setCustomInput] = useState("");
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const learnedSet = new Set(parts || []);
  const strukt = structure && structure.length > 0 ? structure : [];

  const toggleLearned = (type) => {
    const next = new Set(learnedSet);
    if (next.has(type)) next.delete(type); else next.add(type);
    onUpdate({ parts: Array.from(next), structure: strukt });
  };
  const addToStructure = (type) => {
    onUpdate({ parts: Array.from(learnedSet), structure: [...strukt, { id: type+"-"+Date.now(), type }] });
  };
  const removeFromStructure = (id) => {
    onUpdate({ parts: Array.from(learnedSet), structure: strukt.filter(s => s.id !== id) });
  };
  const addCustomPart = () => {
    const name = customInput.trim();
    if (!name) return;
    if (!PART_COLORS[name]) PART_COLORS[name] = { bg:"bg-slate-500", light:"bg-slate-100", text:"text-slate-700", border:"border-slate-300", hex:"#64748b" };
    addToStructure(name);
    setCustomInput("");
  };
  const onDrop = () => {
    if (dragIdx === null || dragOver === null || dragIdx === dragOver) { setDragIdx(null); setDragOver(null); return; }
    const arr = [...strukt];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(dragOver, 0, moved);
    onUpdate({ parts: Array.from(learnedSet), structure: arr });
    setDragIdx(null); setDragOver(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider">Song parts</div>
        <span className="text-xs font-bold text-[#4a72e8]">{DEFAULT_PARTS.filter(p => learnedSet.has(p)).length} of {DEFAULT_PARTS.length} learned</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.keys(PART_COLORS).map(part => {
          const learned = learnedSet.has(part);
          const color = PART_COLORS[part];
          return (
            <button key={part} onClick={() => toggleLearned(part)}
              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[1.5px] text-xs font-bold cursor-pointer transition-all " +
                (learned ? color.bg+" border-transparent text-white shadow-sm" : color.light+" "+color.border+" "+color.text+" opacity-70 hover:opacity-100")}>
              {learned && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              {part}
            </button>
          );
        })}
      </div>
      <div className="bg-[#f0f4ff] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider">Song structure</div>
          <span className="text-[10px] text-[#6b7a9e]">drag to reorder · click to remove</span>
        </div>
        <div className="flex flex-wrap gap-2 min-h-12 mb-3 p-2 rounded-xl border-2 border-dashed border-[#dde4f5] bg-white"
          onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          {strukt.length === 0 && <div className="text-xs text-[#b0baca] self-center mx-auto">Add parts below to map out the song structure</div>}
          {strukt.map((seg, i) => {
            const learned = learnedSet.has(seg.type);
            const color = PART_COLORS[seg.type] || PART_COLORS["Outro"];
            return (
              <div key={seg.id} draggable onDragStart={() => setDragIdx(i)} onDragEnter={() => setDragOver(i)}
                className={"flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black cursor-grab active:cursor-grabbing transition-all select-none border-[1.5px] " +
                  (learned ? color.bg+" text-white border-transparent shadow-md" : "bg-white "+color.border+" "+color.text+" opacity-50") +
                  (dragOver === i ? " scale-110 shadow-lg" : "")}>
                <span className="text-[10px] opacity-60 mr-0.5">⠿</span>
                {seg.type}
                <button onClick={() => removeFromStructure(seg.id)}
                  className="ml-1 opacity-60 hover:opacity-100 bg-transparent border-none cursor-pointer text-inherit leading-none transition-opacity">×</button>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Object.keys(PART_COLORS).map(part => {
            const color = PART_COLORS[part];
            return (
              <button key={part} onClick={() => addToStructure(part)}
                className={"text-[11px] font-bold px-2.5 py-1 rounded-lg border border-dashed cursor-pointer transition-all "+color.light+" "+color.border+" "+color.text+" hover:opacity-100 opacity-70"}>
                + {part}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustomPart()}
            placeholder="Add custom part (e.g. Solo, Riff)..."
            className="flex-1 px-3 py-2 border border-[#dde4f5] rounded-xl text-xs bg-white outline-none focus:border-[#4a72e8] transition-all"
            style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }} />
          <button onClick={addCustomPart}
            className="px-3 py-2 bg-[#1a3a8f] text-white text-xs font-bold rounded-xl border-none cursor-pointer hover:bg-[#4a72e8] transition-colors">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AI REC CARD ──────────────────────────────────────────────
function AIRecCard() {  return (
    <div className="bg-white rounded-3xl border border-[#dde4f5] p-6 shadow-sm h-full flex flex-col">
      <div className="text-xs font-bold tracking-widest uppercase text-[#4a72e8] mb-4">AI Pick For You</div>
      <div className="flex gap-4 items-start mb-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#e8eeff] flex-shrink-0 shadow-md">
          <AlbumArt song={{ id:99, title:AI_REC.title, artist:AI_REC.artist }}
            className="w-full h-full object-cover"
            fallbackClassName="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-xl text-[#0d1b3e] leading-tight mb-1" style={{ fontFamily:"Nunito, sans-serif" }}>{AI_REC.title}</div>
          <div className="text-sm text-[#6b7a9e] mb-2">{AI_REC.artist}</div>
          <span className="text-xs font-bold bg-[#e8eeff] text-[#1a3a8f] px-2.5 py-1 rounded-full">{AI_REC.level}</span>
        </div>
      </div>
      <p className="text-sm text-[#6b7a9e] mb-4 leading-relaxed flex-1">{AI_REC.reason}</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {AI_REC.skills.map((s) => <span key={s} className="text-xs font-bold border border-[#dde4f5] text-[#6b7a9e] px-2.5 py-1 rounded-full">{s}</span>)}
      </div>
      <button className="w-full py-3 bg-[#1a3a8f] text-white font-black rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer text-sm" style={{ fontFamily:"Nunito, sans-serif" }}>
        Add to library
      </button>
    </div>
  );
}

// ── SONG GRID CARD ───────────────────────────────────────────
function SongGridCard({ song, onClick, onStructureClick, onDelete }) {
  const [ctxMenu, setCtxMenu] = useState(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [ctxMenu]);

  return (
    <div className="group flex flex-col relative" onContextMenu={handleContextMenu}>
      {/* Right-click context menu */}
      {ctxMenu && (
        <div
          className="fixed z-50 bg-white border border-[#dde4f5] rounded-2xl shadow-xl py-1 min-w-[160px]"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { onClick(song); setCtxMenu(null); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0d1b3e] hover:bg-[#f0f4ff] transition-colors bg-transparent border-none cursor-pointer">
            Edit song
          </button>
          <button onClick={() => { onStructureClick(song); setCtxMenu(null); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0d1b3e] hover:bg-[#f0f4ff] transition-colors bg-transparent border-none cursor-pointer">
            View structure
          </button>
          <div className="border-t border-[#dde4f5] my-1" />
          <button onClick={() => { onDelete(song); setCtxMenu(null); }}
            className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer">
            Delete from library
          </button>
        </div>
      )}

      {/* Album art square */}
      <div
        onClick={() => onClick(song)}
        className="relative aspect-square rounded-2xl overflow-hidden bg-[#e8eeff] mb-2 shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        <AlbumArt song={song} className="w-full h-full object-cover" fallbackClassName="w-full h-full" />

        {/* Delete button on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(song); }}
          className="absolute top-2 right-2 z-20 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border-none cursor-pointer"
          title="Delete"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 z-10">
          <StarIcon className="w-3 h-3 text-amber-400" filled />{song.rating}
        </div>
        {song.progress === 100 && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow z-10">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-[#1a3a8f]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-3 pointer-events-none">
          <div className="text-white font-black text-sm text-center leading-tight" style={{ fontFamily:"Nunito, sans-serif" }}>{song.title}</div>
          <div className="text-white/70 text-xs">{song.artist}</div>
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {song.skills.slice(0,2).map((s) => <span key={s} className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{s}</span>)}
          </div>
          <div className="w-full mt-1">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: song.progress+"%" }} />
            </div>
            <div className="text-white/60 text-[10px] text-center mt-1">{song.progress}% mastered</div>
          </div>
        </div>
      </div>

      <div className="text-sm font-bold text-[#0d1b3e] truncate cursor-pointer" onClick={() => onClick(song)}>{song.title}</div>
      <div className="text-xs text-[#6b7a9e] truncate mb-2" onClick={() => onClick(song)}>{song.artist}</div>
      <button
        onClick={() => onStructureClick(song)}
        className="w-full flex items-center justify-center gap-1.5 bg-[#e8eeff] hover:bg-[#1a3a8f] text-[#1a3a8f] hover:text-white text-[11px] font-bold py-1.5 rounded-xl border border-[#dde4f5] hover:border-[#1a3a8f] cursor-pointer transition-all"
      >
        <StructureIcon className="w-3 h-3" />
        Structure
      </button>
    </div>
  );
}

// ── SONG ROW (LIST VIEW) ─────────────────────────────────────
function SongRow({ song, onClick, onStructureClick, onDelete }) {
  const [ctxMenu, setCtxMenu] = useState(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [ctxMenu]);
  const keyColor = {
    "A":"bg-red-100 text-red-700","A#":"bg-orange-100 text-orange-700","Bb":"bg-orange-100 text-orange-700",
    "B":"bg-amber-100 text-amber-700","C":"bg-yellow-100 text-yellow-700","C#":"bg-lime-100 text-lime-700",
    "Db":"bg-lime-100 text-lime-700","D":"bg-green-100 text-green-700","D#":"bg-teal-100 text-teal-700",
    "Eb":"bg-teal-100 text-teal-700","E":"bg-cyan-100 text-cyan-700","F":"bg-blue-100 text-blue-700",
    "F#":"bg-indigo-100 text-indigo-700","Gb":"bg-indigo-100 text-indigo-700","G":"bg-violet-100 text-violet-700",
    "G#":"bg-purple-100 text-purple-700","Ab":"bg-purple-100 text-purple-700",
  };
  const kc = song.key ? (keyColor[song.key.replace(/m$/,"")] || "bg-[#e8eeff] text-[#1a3a8f]") : null;

  return (
    <div onContextMenu={handleContextMenu} className="relative flex items-center w-full px-4 py-3.5 rounded-2xl hover:bg-[#f0f4ff] transition-colors cursor-pointer group border border-transparent hover:border-[#dde4f5]" style={{gap:"12px"}}>

      {/* Right-click context menu */}
      {ctxMenu && (
        <div
          className="fixed z-50 bg-white border border-[#dde4f5] rounded-2xl shadow-xl py-1 min-w-[160px]"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { onClick(song); setCtxMenu(null); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0d1b3e] hover:bg-[#f0f4ff] transition-colors bg-transparent border-none cursor-pointer">
            Edit song
          </button>
          <button onClick={() => { onStructureClick(song); setCtxMenu(null); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0d1b3e] hover:bg-[#f0f4ff] transition-colors bg-transparent border-none cursor-pointer">
            View structure
          </button>
          <div className="border-t border-[#dde4f5] my-1" />
          <button onClick={() => { onDelete(song); setCtxMenu(null); }}
            className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer">
            Delete from library
          </button>
        </div>
      )}

      {/* Album art */}
      <div onClick={() => onClick(song)} style={{width:"48px",height:"48px",flexShrink:0}} className="rounded-xl overflow-hidden bg-[#e8eeff] shadow-md">
        <AlbumArt song={song} className="w-full h-full object-cover" fallbackClassName="w-full h-full" />
      </div>

      {/* Title + artist — takes all remaining space */}
      <div onClick={() => onClick(song)} style={{flex:"1 1 0",minWidth:0,maxWidth:"200px"}}>
        <div className="font-black text-sm text-[#0d1b3e] truncate mb-0.5" style={{ fontFamily:"Nunito,sans-serif" }}>{song.title}</div>
        <div className="text-xs text-[#6b7a9e] truncate">{song.artist}</div>
      </div>

      {/* Skills */}
      <div onClick={() => onClick(song)} style={{width:"120px",flexShrink:0}} className="hidden sm:flex flex-wrap gap-1">
        {song.skills.slice(0,2).map((s) => <span key={s} className="text-[10px] font-bold bg-[#e8eeff] text-[#1a3a8f] px-2 py-0.5 rounded-full">{s}</span>)}
        {song.skills.length > 2 && <span className="text-[10px] font-bold text-[#6b7a9e]">+{song.skills.length - 2}</span>}
      </div>

      {/* Instrument */}
      <div onClick={() => onClick(song)} style={{width:"72px",flexShrink:0}} className="hidden lg:flex items-center">
        {song.instrument
          ? <span className="text-[10px] font-bold bg-[#f0f4ff] text-[#1a3a8f] px-2 py-0.5 rounded-full border border-[#dde4f5]">{song.instrument}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* Key */}
      <div onClick={() => onClick(song)} style={{width:"48px",flexShrink:0}} className="hidden lg:flex justify-center">
        {song.key ? <span className={"text-xs font-black px-2 py-0.5 rounded-lg " + kc}>{song.key}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* BPM */}
      <div onClick={() => onClick(song)} style={{width:"56px",flexShrink:0}} className="hidden lg:flex justify-center">
        {song.bpm ? <span className="text-xs font-bold text-[#0d1b3e]">{song.bpm}<span className="text-[#6b7a9e] font-medium"> bpm</span></span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* Tuning / Capo */}
      <div onClick={() => onClick(song)} style={{width:"72px",flexShrink:0}} className="hidden xl:flex flex-col gap-0.5">
        {song.tuning ? <span className="text-xs font-bold text-[#0d1b3e]">{song.tuning}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
        {song.capo > 0 && <span className="text-[10px] text-[#6b7a9e] font-medium">Capo {song.capo}</span>}
      </div>

      {/* Genre */}
      <div onClick={() => onClick(song)} style={{width:"68px",flexShrink:0}} className="hidden xl:flex items-center">
        {song.genre ? <span className="text-[10px] font-bold bg-[#f0f4ff] text-[#6b7a9e] px-2 py-0.5 rounded-full truncate">{song.genre}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* Length */}
      <div onClick={() => onClick(song)} style={{width:"44px",flexShrink:0}} className="hidden xl:flex justify-center">
        {song.duration ? <span className="text-xs font-bold text-[#0d1b3e]">{Math.floor(song.duration)}:{String(Math.round((song.duration%1)*60)).padStart(2,"00")}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* Progress */}
      <div onClick={() => onClick(song)} style={{width:"88px",flexShrink:0}} className="hidden md:block">
        <div className="flex justify-between text-[10px] font-semibold text-[#6b7a9e] mb-1">
          <span className="font-bold text-[#0d1b3e]">{song.progress}%</span>
          {song.progress === 100 && <span className="text-green-600 font-bold">✓</span>}
        </div>
        <div className="h-1.5 bg-[#e8eeff] rounded-full overflow-hidden">
          <div className={"h-full rounded-full transition-all "+(song.progress===100?"bg-green-500":"bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8]")} style={{ width:song.progress+"%" }} />
        </div>
      </div>

      {/* Difficulty */}
      <div onClick={() => onClick(song)} style={{width:"88px",flexShrink:0}} className="flex items-center gap-0.5 justify-center">
        {song.rating > 0
          ? [1,2,3,4,5].map((n) => (
              <svg key={n} viewBox="0 0 24 24" style={{width:"14px",height:"14px"}} fill={n <= song.rating ? "#f59e0b" : "none"} stroke={n <= song.rating ? "#f59e0b" : "#dde4f5"} strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>
        }
      </div>

      {/* Date added */}
      <div onClick={() => onClick(song)} style={{width:"52px",flexShrink:0}} className="hidden lg:block text-right">
        <span className="text-xs text-[#6b7a9e] font-medium">{song.date}</span>
      </div>

      {/* Structure button */}
      <button
        onClick={(e) => { e.stopPropagation(); onStructureClick(song); }}
        style={{width:"32px",height:"32px",flexShrink:0}}
        className="flex items-center justify-center bg-[#e8eeff] hover:bg-[#1a3a8f] text-[#1a3a8f] hover:text-white rounded-xl border border-[#dde4f5] cursor-pointer transition-all opacity-0 group-hover:opacity-100"
        title="View structure"
      >
        <StructureIcon className="w-3.5 h-3.5" />
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(song); }}
        style={{width:"32px",height:"32px",flexShrink:0}}
        className="flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-xl border border-red-100 hover:border-red-500 cursor-pointer transition-all opacity-0 group-hover:opacity-100"
        title="Delete"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>
  );
}

// ── MINI SONG MAP (used inside SongModal) ────────────────────
const PART_HEX_MAP = {
  Intro: "#8b5cf6", Verse: "#3b82f6", "Pre-chorus": "#06b6d4",
  Chorus: "#1a3a8f", Bridge: "#f59e0b", Outro: "#ef4444",
  Solo: "#10b981", Riff: "#ec4899",
};
function getHex(label) {
  if (PART_HEX_MAP[label]) return PART_HEX_MAP[label];
  const k = Object.keys(PART_HEX_MAP).find(k => label?.toLowerCase().startsWith(k.toLowerCase()));
  return k ? PART_HEX_MAP[k] : "#4a72e8";
}

function MiniSongMap({ song, onOpenStructure }) {
  const structure = song.structure || [];
  const learnedSet = new Set(song.parts || []);

  // Build display segments from structure, fall back to parts string[]
  const segments = structure.length > 0
    ? structure
    : (song.parts || []).map((p, i) => ({ id: i, type: p }));

  if (segments.length === 0) {
    return (
      <div className="bg-[#f0f4ff] rounded-2xl p-4 flex items-center justify-between">
        <span className="text-sm text-[#b0baca]">No structure mapped yet</span>
        <button onClick={onOpenStructure}
          className="text-xs font-bold text-[#1a3a8f] bg-[#e8eeff] px-3 py-1.5 rounded-xl border border-[#dde4f5] cursor-pointer hover:bg-[#dde4f5] transition-colors">
          Open Structure Map
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f4ff] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider">Song Structure</span>
        <button onClick={onOpenStructure}
          className="text-xs font-bold text-[#1a3a8f] bg-white px-3 py-1.5 rounded-xl border border-[#dde4f5] cursor-pointer hover:border-[#4a72e8] transition-colors">
          Edit Structure ↗
        </button>
      </div>

      {/* Timeline bar */}
      <div className="flex h-9 rounded-xl overflow-hidden gap-0.5 mb-3">
        {segments.map((seg, i) => {
          const learned = learnedSet.has(seg.type);
          const hex = getHex(seg.type);
          return (
            <div key={seg.id ?? i}
              title={`${seg.type}${learned ? " · learned" : " · not learned"}`}
              className="flex-1 flex items-center justify-center rounded-sm transition-all"
              style={{
                background: learned ? hex : `${hex}33`,
                border: learned ? "none" : `1.5px dashed ${hex}66`,
                minWidth: 6,
              }}>
              {segments.length <= 10 && (
                <span style={{ fontSize: 9, fontWeight: 800, color: learned ? "rgba(255,255,255,.9)" : `${hex}cc`, whiteSpace: "nowrap", pointerEvents: "none" }}>
                  {seg.type.length > 6 ? seg.type.slice(0, 5) + "…" : seg.type}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend chips */}
      <div className="flex flex-wrap gap-1.5">
        {segments.map((seg, i) => {
          const learned = learnedSet.has(seg.type);
          const hex = getHex(seg.type);
          return (
            <span key={seg.id ?? i}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
              style={{ background: learned ? `${hex}18` : "#e8eeff", color: learned ? hex : "#b0baca" }}>
              <span style={{ width: 6, height: 6, borderRadius: 2, background: learned ? hex : "#c8d0e0", display: "inline-block", flexShrink: 0 }} />
              {seg.type}
              {learned && <span style={{ fontSize: 9 }}>✓</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── STREAMING LINKS ──────────────────────────────────────────
function StreamingLinks({ song }) {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  const links = [
    {
      name: "Spotify",
      url: `https://open.spotify.com/search/${q}`,
      bg: "#1DB954", text: "#fff", border: "#1DB954",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      ),
    },
    {
      name: "Apple Music",
      url: `https://music.apple.com/search?term=${q}`,
      bg: "#fc3c44", text: "#fff", border: "#fc3c44",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
        </svg>
      ),
    },
    {
      name: "YouTube Music",
      url: `https://music.youtube.com/search?q=${q}`,
      bg: "#FF0000", text: "#fff", border: "#FF0000",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
        </svg>
      ),
    },
    {
      name: "Genius",
      url: `https://genius.com/search?q=${q}`,
      bg: "#ffff64", text: "#111", border: "#e6e600",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12C24 5.373 18.628 0 12 0zm3.37 15.48c-.742.901-1.89 1.43-3.37 1.43-2.722 0-4.8-2.017-4.8-4.91 0-2.862 2.078-4.91 4.8-4.91 1.327 0 2.385.436 3.14 1.205l-1.128 1.161c-.496-.511-1.157-.794-2.012-.794-1.72 0-2.943 1.307-2.943 3.338 0 2.032 1.222 3.339 2.943 3.339.906 0 1.663-.3 2.19-.857.436-.452.665-1.073.755-1.886H12v-1.497h4.77c.052.285.082.585.082.916 0 1.513-.482 2.739-1.482 3.465z"/>
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-3">Listen on</div>
      <div className="grid grid-cols-4 gap-3">
        {links.map(l => (
          <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all no-underline group"
            style={{ background: "#fff", borderColor: l.bg + "33" }}
            onMouseEnter={e => { e.currentTarget.style.background = l.bg; e.currentTarget.style.borderColor = l.bg; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${l.bg}44`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = l.bg + "33"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <span style={{ color: l.bg, transition: "color .15s" }} className="group-hover:!text-white">{l.icon}</span>
            <span className="text-[11px] font-bold text-[#6b7a9e] text-center leading-tight group-hover:text-white transition-colors">{l.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── SONG DETAIL MODAL ────────────────────────────────────────
function SongModal({ song, onClose, onUpdate, onOpenStructure }) {
  const [rating,   setRating]   = useState(song.rating);
  const [progress, setProgress] = useState(song.progress);
  const [notes,    setNotes]    = useState(song.notes || "");
  const [key,      setKey]      = useState(song.key || "");
  const [bpm,      setBpm]      = useState(song.bpm || "");
  const [tuning,   setTuning]   = useState(song.tuning || "");
  const [capo,     setCapo]     = useState(song.capo || 0);
  const [instrument, setInstrument] = useState(song.instrument || "Guitar");
  const [attachments, setAttachments] = useState(song.attachments || []);
  const [uploading, setUploading] = useState(false);
  const attachInputRef = useRef();
  const [saved,    setSaved]    = useState(false);

  const INSTRUMENTS = ["Guitar","Bass","Ukulele","Banjo","Mandolin","Piano","Drums","Other"];
  const KEYS = ["","C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B","Cm","C#m","Dm","D#m","Ebm","Em","Fm","F#m","Gm","G#m","Am","A#m","Bbm","Bm"];

  const isPro = IS_PRO;
  const attachLimit = isPro ? Infinity : 1;

  const handleAttachFiles = (e) => {
    const files = Array.from(e.target.files);
    const remaining = attachLimit - attachments.length;
    if (remaining <= 0) return;
    const allowed = files.slice(0, remaining);
    setUploading(true);
    const readers = allowed.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: ev.target.result,
        addedAt: new Date().toISOString(),
      });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(newFiles => {
      setAttachments(prev => [...prev, ...newFiles]);
      setUploading(false);
    });
    e.target.value = "";
  };

  const removeAttachment = (i) => setAttachments(prev => prev.filter((_,idx) => idx !== i));

  const save = () => {
    onUpdate({ ...song, rating, progress, notes, key, bpm: bpm ? parseInt(bpm) : null, tuning, capo: capo ? parseInt(capo) : 0, instrument, attachments });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Art header */}
        <div className="relative h-52 flex-shrink-0">
          <div className="w-full h-full">
            <AlbumArt song={song} className="w-full h-full object-cover" fallbackClassName="w-full h-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/30 transition-colors text-sm">✕</button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="font-black text-2xl text-white mb-0.5 leading-tight" style={{ fontFamily:"Nunito, sans-serif" }}>{song.title}</div>
            <div className="text-white/70 text-sm">{song.artist} · {song.date}</div>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Streaming links */}
          <StreamingLinks song={song} />

          {/* Skills */}
          <div>
            <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Skills covered</div>
            <div className="flex flex-wrap gap-2">
              {song.skills.map((s) => <span key={s} className="text-xs font-bold bg-[#e8eeff] text-[#1a3a8f] px-3 py-1.5 rounded-full">{s}</span>)}
            </div>
          </div>

          {/* Song details — Key, BPM, Tuning, Capo */}
          <div>
            <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-3">Song details</div>
            <div className="grid grid-cols-2 gap-3">
              {/* Key */}
              <div>
                <label className="text-xs font-bold text-[#0d1b3e] mb-1 block">Key</label>
                <select value={key} onChange={e => setKey(e.target.value)}
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all cursor-pointer"
                  style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}>
                  {KEYS.map(k => <option key={k} value={k}>{k || "— Select key"}</option>)}
                </select>
              </div>
              {/* BPM */}
              <div>
                <label className="text-xs font-bold text-[#0d1b3e] mb-1 block">BPM</label>
                <input type="number" min="40" max="300" value={bpm} onChange={e => setBpm(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"
                  style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }} />
              </div>
              {/* Tuning */}
              <div>
                <label className="text-xs font-bold text-[#0d1b3e] mb-1 block">Tuning</label>
                <select value={tuning} onChange={e => setTuning(e.target.value)}
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all cursor-pointer"
                  style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}>
                  {["","Standard (EADGBe)","Drop D","Open G","Open D","Open E","Open A","DADGAD","Half Step Down","Full Step Down","Drop C","Drop B"].map(t => (
                    <option key={t} value={t}>{t || "— Select tuning"}</option>
                  ))}
                </select>
              </div>
              {/* Capo */}
              <div>
                <label className="text-xs font-bold text-[#0d1b3e] mb-1 block">Capo</label>
                <select value={capo} onChange={e => setCapo(e.target.value)}
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all cursor-pointer"
                  style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}>
                  {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <option key={n} value={n}>{n === 0 ? "No capo" : `Fret ${n}`}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Instrument */}
            <div className="mt-3">
              <label className="text-xs font-bold text-[#0d1b3e] mb-2 block">Instrument</label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS.map(i => (
                  <button key={i} onClick={() => setInstrument(i)}
                    className={"text-xs font-bold px-3 py-1.5 rounded-full border-[1.5px] cursor-pointer transition-all " +
                      (instrument === i ? "bg-[#1a3a8f] border-[#1a3a8f] text-white" : "bg-white border-[#dde4f5] text-[#6b7a9e] hover:border-[#4a72e8]")}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Your rating</div>
            <StarRating value={rating} onChange={setRating} size="w-7 h-7" />
          </div>

          {/* Progress */}
          <div className="bg-[#f0f4ff] rounded-2xl p-4">
            <ProgressBar value={progress} onChange={setProgress} />
          </div>

          {/* Open Structure button */}
          {IS_PRO ? (
            <button
              onClick={() => { onClose(); onOpenStructure(song); }}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#dde4f5] rounded-2xl text-sm font-bold text-[#1a3a8f] hover:border-[#4a72e8] hover:bg-[#f0f4ff] transition-all cursor-pointer bg-transparent"
              style={{ fontFamily:"Nunito, sans-serif" }}
            >
              <StructureIcon className="w-4 h-4" />
              View / Edit Song Structure
            </button>
          ) : (
            <div className="w-full flex items-center justify-between gap-3 py-3 px-4 border-2 border-dashed border-[#dde4f5] rounded-2xl bg-[#fafbff]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#b0baca]">
                <StructureIcon className="w-4 h-4" />
                Song Structure Diagram
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full flex-shrink-0">PRO</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Your notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? What needs more work?"
              rows={4}
              className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-2xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] focus:ring-4 focus:ring-[#4a72e8]/10 transition-all resize-none leading-relaxed placeholder:text-[#b0baca]"
              style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }} />
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider">Attachments</div>
                {!isPro && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Free: {attachments.length}/{attachLimit}
                  </span>
                )}
              </div>
              <button onClick={() => attachments.length < attachLimit && attachInputRef.current?.click()}
                disabled={uploading || attachments.length >= attachLimit}
                className={"flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer transition-all " + (attachments.length >= attachLimit ? "text-[#b0baca] bg-[#f0f4ff] cursor-not-allowed" : "text-[#1a3a8f] bg-[#e8eeff] hover:bg-[#dde4f5]")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                </svg>
                {uploading ? "Uploading…" : attachments.length >= attachLimit ? "Limit reached" : "Add file"}
              </button>
              <input ref={attachInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.txt,.mp3,.wav"
                className="hidden" onChange={handleAttachFiles}/>
            </div>
            {!isPro && attachments.length >= attachLimit && (
              <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                <span className="text-xs text-amber-700 font-bold">Free plan allows 1 attachment per song</span>
                <button onClick={handleUpgrade} className="text-xs font-black text-[#1a3a8f] bg-white border border-[#dde4f5] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#e8eeff] transition-all border-none">Upgrade to Pro</button>
              </div>
            )}

            {attachments.length === 0 ? (
              <button onClick={() => attachInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-[#dde4f5] rounded-2xl flex flex-col items-center gap-2 text-[#b0baca] hover:border-[#4a72e8] hover:text-[#4a72e8] hover:bg-[#f0f4ff] transition-all cursor-pointer bg-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-7 h-7">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span className="text-xs font-bold">Photos, videos, PDFs, audio…</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {attachments.map((a, i) => {
                  const isImage = a.type?.startsWith("image/");
                  const isVideo = a.type?.startsWith("video/");
                  const isAudio = a.type?.startsWith("audio/");
                  const sizeMB  = (a.size / 1024 / 1024).toFixed(1);
                  return (
                    <div key={i} className="bg-[#f0f4ff] rounded-xl border border-[#dde4f5] overflow-hidden">
                      {/* Image preview */}
                      {isImage && (
                        <img src={a.dataUrl} alt={a.name} className="w-full max-h-48 object-cover"/>
                      )}
                      {/* Video preview */}
                      {isVideo && (
                        <video src={a.dataUrl} controls className="w-full max-h-48 bg-black"/>
                      )}
                      {/* Audio preview */}
                      {isAudio && (
                        <div className="px-3 pt-3">
                          <audio src={a.dataUrl} controls className="w-full h-8"/>
                        </div>
                      )}
                      {/* File info row */}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <div className="flex-shrink-0">
                          {isImage ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#4a72e8" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          ) : isVideo ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                          ) : isAudio ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#6b7a9e" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#0d1b3e] truncate">{a.name}</div>
                          <div className="text-[10px] text-[#b0baca]">{sizeMB} MB</div>
                        </div>
                        <button onClick={() => removeAttachment(i)}
                          className="w-6 h-6 rounded-full bg-white border border-[#dde4f5] flex items-center justify-center text-[#6b7a9e] hover:text-red-500 hover:border-red-300 transition-all cursor-pointer flex-shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3 h-3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Add more */}
                {attachments.length < attachLimit && (
                <button onClick={() => attachInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#dde4f5] rounded-xl text-xs font-bold text-[#6b7a9e] hover:border-[#4a72e8] hover:text-[#4a72e8] hover:bg-[#f0f4ff] transition-all cursor-pointer bg-transparent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add more
                </button>
                )}
              </div>
            )}
          </div>

          {/* Save */}
          <button onClick={save}
            className={"w-full py-3.5 font-black rounded-2xl border-none cursor-pointer transition-all text-sm "+(saved?"bg-green-500 text-white shadow-[0_4px_0_#15803d]":"bg-[#1a3a8f] text-white shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0f2460]")}
            style={{ fontFamily:"Nunito, sans-serif" }}>
            {saved ? "✓ Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE PANEL ────────────────────────────────────────────
function computeAchievements(songs) {
  const streak=calcStreak(songs), mastered=songs.filter(s=>s.progress===100).length,
    total=songs.length, skills=new Set(songs.flatMap(s=>s.skills||[])).size,
    rated=songs.filter(s=>s.rating>0).length, fiveStars=songs.filter(s=>s.rating===5).length,
    instruments=new Set(songs.map(s=>s.instrument).filter(Boolean)).size,
    genres=new Set(songs.map(s=>s.genre).filter(Boolean)).size;
  return [
    {id:"first_song", Icon:BookOpenIcon, color:"#4a72e8", bg:"#e8eeff", label:"First Note",      desc:"Log your first song",          max:1,  val:total,      xp:50  },
    {id:"lib_5",      Icon:BookOpenIcon, color:"#7c3aed", bg:"#f3e8ff", label:"Growing Library", desc:"Log 5 songs",                  max:5,  val:total,      xp:100 },
    {id:"lib_10",     Icon:BookOpenIcon, color:"#1a3a8f", bg:"#dde4f5", label:"Serious Learner", desc:"Log 10 songs",                 max:10, val:total,      xp:200 },
    {id:"lib_25",     Icon:BookOpenIcon, color:"#d97706", bg:"#fef3c7", label:"Dedicated",       desc:"Log 25 songs",                 max:25, val:total,      xp:500 },
    {id:"lib_50",     Icon:TrophyIcon,   color:"#dc2626", bg:"#fee2e2", label:"Legend",          desc:"Log 50 songs",                 max:50, val:total,      xp:1000},
    {id:"first_master",Icon:SparkleIcon, color:"#16a34a", bg:"#dcfce7", label:"First Master",   desc:"Fully master a song",          max:1,  val:mastered,   xp:100 },
    {id:"master_5",   Icon:SparkleIcon,  color:"#0891b2", bg:"#cffafe", label:"Diamond Hands",  desc:"Master 5 songs",               max:5,  val:mastered,   xp:300 },
    {id:"master_10",  Icon:TrophyIcon,   color:"#d97706", bg:"#fef3c7", label:"Crowned",        desc:"Master 10 songs",              max:10, val:mastered,   xp:750 },
    {id:"streak_3",   Icon:FlameIcon,    color:"#ea580c", bg:"#ffedd5", label:"On Fire",        desc:"3-day practice streak",        max:3,  val:streak,     xp:75  },
    {id:"streak_7",   Icon:ZapIcon,      color:"#ca8a04", bg:"#fef9c3", label:"Weekly Warrior", desc:"7-day practice streak",        max:7,  val:streak,     xp:200 },
    {id:"streak_30",  Icon:ZapIcon,      color:"#7c3aed", bg:"#f3e8ff", label:"Night Owl",      desc:"30-day practice streak",       max:30, val:streak,     xp:1000},
    {id:"skills_3",   Icon:TargetIcon,   color:"#4a72e8", bg:"#e8eeff", label:"Multi-Skilled",  desc:"Track 3 different skills",     max:3,  val:skills,     xp:100 },
    {id:"skills_7",   Icon:TargetIcon,   color:"#7c3aed", bg:"#f3e8ff", label:"Skill Master",   desc:"Track 7 different skills",     max:7,  val:skills,     xp:300 },
    {id:"critic",     Icon:StarIcon,     color:"#d97706", bg:"#fef3c7", label:"The Critic",     desc:"Rate 5 songs",                 max:5,  val:rated,      xp:100 },
    {id:"five_stars", Icon:StarIcon,     color:"#d97706", bg:"#fef9c3", label:"Perfectionist",  desc:"Give a song 5 stars",          max:1,  val:fiveStars,  xp:150 },
    {id:"multi_inst", Icon:GuitarIcon,   color:"#0891b2", bg:"#cffafe", label:"Multi-Inst.",    desc:"Log songs on 2+ instruments",  max:2,  val:instruments,xp:200 },
    {id:"genre_3",    Icon:TargetIcon,   color:"#16a34a", bg:"#dcfce7", label:"Genre Explorer", desc:"Log 3 different genres",       max:3,  val:genres,     xp:150 },
  ].map(a=>({...a, earned:a.val>=a.max, pct:Math.min(100,Math.round((a.val/a.max)*100))}));
}

const XP_LEVELS=[0,100,300,600,1000,1500,2500,4000,6000,9000,15000];
function getXpLevel(xp){
  let level=1;
  for(let i=1;i<XP_LEVELS.length;i++){if(xp>=XP_LEVELS[i])level=i+1;else break;}
  const curr=XP_LEVELS[level-1]||0,next=XP_LEVELS[level]||XP_LEVELS[XP_LEVELS.length-1];
  return{level,pct:Math.min(100,Math.round(((xp-curr)/(next-curr))*100)),nextXp:next-xp};
}

function ProfilePanel({ user, songs, onClose, onOpenSettings, onAvatarChange }) {
  const [tab, setTab] = useState("overview");
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("nn_avatar")||null);
  const inputRef = useRef();
  const stored = (() => { try{return JSON.parse(localStorage.getItem("nn_profile")||"{}");}catch{return{};} })();
  const bio = localStorage.getItem("nn_bio")||"";

  const displayName = user?.user_metadata?.username || stored.username || stored.name || "User";
  const instrument  = stored.instrument ? stored.instrument.charAt(0).toUpperCase()+stored.instrument.slice(1) : null;
  const level       = stored.level      ? stored.level.charAt(0).toUpperCase()+stored.level.slice(1)           : null;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const streak      = calcStreak(songs);
  const mastered    = songs.filter(s=>s.progress===100).length;
  const skillCount  = new Set(songs.flatMap(s=>s.skills||[])).size;
  const avgRating   = songs.length ? (songs.reduce((a,s)=>a+(s.rating||0),0)/songs.length).toFixed(1) : "—";
  const achievements = computeAchievements(songs);
  const xp          = achievements.filter(a=>a.earned).reduce((s,a)=>s+a.xp,0);
  const xpInfo      = getXpLevel(xp);
  const earnedCount = achievements.filter(a=>a.earned).length;

  const skillBreakdown = (() => {
    const map={};
    songs.forEach(sg=>(sg.skills||[]).forEach(sk=>{if(!map[sk])map[sk]={count:0,titles:[]};map[sk].count++;map[sk].titles.push(sg.title);}));
    return Object.entries(map).sort((a,b)=>b[1].count-a[1].count).map(([label,{count,titles}])=>({label,count,titles}));
  })();

  const handleAvatarFile = (e) => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{localStorage.setItem("nn_avatar",ev.target.result);setAvatarUrl(ev.target.result);onAvatarChange?.(ev.target.result);};
    reader.readAsDataURL(file);
  };

  const SKILL_COLORS=["#1a3a8f","#7c3aed","#0891b2","#16a34a","#d97706","#dc2626"];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-[#0d1b3e]/40 backdrop-blur-sm" onClick={onClose}/>

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col"
        style={{animation:"slideInRight 0.28s cubic-bezier(0.22,1,0.36,1)"}}>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a3a8f] to-[#4a72e8] px-5 pt-5 pb-0 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 2px 2px,white 1px,transparent 0)",backgroundSize:"20px 20px"}}/>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16"/>

          {/* Close + settings */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border-none cursor-pointer transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <button onClick={onOpenSettings} className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border-none cursor-pointer transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              Edit profile
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex items-end gap-4 relative z-10 mb-4">
            <div className="relative group flex-shrink-0">
              <div className="w-18 h-18 rounded-2xl border-3 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center" style={{width:72,height:72}}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover"/>
                  : <span className="font-black text-3xl text-white" style={{fontFamily:"Nunito,sans-serif"}}>{avatarLetter}</span>}
              </div>
              <button onClick={()=>inputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer border-none opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon className="w-3 h-3 text-[#1a3a8f]"/>
              </button>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile}/>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="font-black text-white text-xl truncate" style={{fontFamily:"Nunito,sans-serif"}}>@{displayName}</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {instrument && <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{instrument}</span>}
                {level      && <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{level}</span>}
                {streak>0   && <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><FlameIcon className="w-2.5 h-2.5"/>{streak}d streak</span>}
              </div>
              {bio && <p className="text-white/70 text-xs mt-1.5 line-clamp-2">{bio}</p>}
            </div>
          </div>

          {/* XP bar */}
          <div className="relative z-10 mb-0 pb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/90 text-xs font-bold">Level {xpInfo.level} · {xp.toLocaleString()} XP</span>
              <span className="text-white/50 text-[10px]">{xpInfo.nextXp>0?`${xpInfo.nextXp} to next`:"Max!"}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{width:`${xpInfo.pct}%`}}/>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex relative z-10 -mx-5 px-5 gap-0 border-t border-white/10 mt-0">
            {[["overview","Overview"],["achievements","Badges"],["skills","Skills"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                className={"flex-1 py-3 text-xs font-bold border-none cursor-pointer transition-all border-b-2 "+
                  (tab===id?"text-white border-white bg-transparent":"text-white/50 border-transparent bg-transparent hover:text-white/80")}
                style={{fontFamily:"Nunito,sans-serif"}}>
                {label}
                {id==="achievements"&&earnedCount>0&&<span className="ml-1 bg-[#dde4f5] text-[#6b7a9e] text-[8px] font-black w-3.5 h-3.5 rounded-full inline-flex items-center justify-center">!</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9ff]">

          {/* ── OVERVIEW ── */}
          {tab==="overview"&&(
            <div className="p-4 flex flex-col gap-4">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {val:songs.length,                              label:"Songs",     color:"#1a3a8f"},
                  {val:skillCount,                                label:"Skills",    color:"#7c3aed"},
                  {val:mastered,                                  label:"Mastered",  color:"#16a34a"},
                  {val:streak>0?`${streak}d`:"—",                label:"Streak",    color:"#ea580c"},
                  {val:avgRating,                                 label:"Avg rating",color:"#d97706"},
                  {val:`${earnedCount}/${achievements.length}`,   label:"Badges",    color:"#0891b2"},
                ].map(({val,label,color})=>(
                  <div key={label} className="bg-white rounded-2xl border border-[#dde4f5] p-4 flex flex-col items-center text-center gap-1 shadow-sm">
                    <div className="font-black text-2xl leading-none" style={{color,fontFamily:"Nunito,sans-serif"}}>{val}</div>
                    <div className="text-[10px] font-bold text-[#6b7a9e] uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>

              {/* Recent songs */}
              {songs.length>0&&(
                <div>
                  <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Recent songs</div>
                  <div className="flex flex-col gap-2">
                    {songs.slice(0,5).map(s=>(
                      <div key={s.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#dde4f5] p-3 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-[#e8eeff] flex-shrink-0 overflow-hidden">
                          {(s.artwork_url||s.artworkUrl)
                            ? <img src={s.artwork_url||s.artworkUrl} alt="" className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center font-black text-sm text-[#1a3a8f]/40">{s.title[0]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-[#0d1b3e] truncate">{s.title}</div>
                          <div className="text-[10px] text-[#6b7a9e] truncate">{s.artist}</div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-10 h-1.5 bg-[#e8eeff] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a3a8f] rounded-full" style={{width:`${s.progress||0}%`}}/>
                          </div>
                          <div className="text-[9px] text-[#b0baca] text-right mt-0.5">{s.progress||0}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BADGES ── */}
          {tab==="achievements"&&(
            <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#f0f4ff] border-2 border-dashed border-[#dde4f5] flex items-center justify-center mb-5">
                <TrophyIcon className="w-9 h-9 text-[#c0cadf]"/>
              </div>
              <div className="font-black text-xl text-[#0d1b3e] mb-2" style={{fontFamily:"Nunito,sans-serif"}}>Coming Soon</div>
              <p className="text-sm text-[#6b7a9e] leading-relaxed max-w-[220px]">
                Badges and achievements are on their way. Keep logging songs to be ready when they drop.
              </p>
            </div>
          )}

          {/* ── SKILLS ── */}
          {tab==="skills"&&(
            <div className="p-4">
              <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-3">Skills breakdown</div>
              {skillBreakdown.length===0
                ? <div className="text-sm text-[#6b7a9e] text-center py-10">No skills tracked yet.</div>
                : <div className="flex flex-col gap-3">
                    {skillBreakdown.map((sk,i)=>(
                      <div key={sk.label} className="bg-white rounded-xl border border-[#dde4f5] p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-[#0d1b3e]">{sk.label}</span>
                          <span className="text-xs font-bold" style={{color:SKILL_COLORS[i%SKILL_COLORS.length]}}>{sk.count} song{sk.count!==1?"s":""}</span>
                        </div>
                        <div className="h-2 bg-[#e8eeff] rounded-full overflow-hidden mb-2">
                          <div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,(sk.count/songs.length)*100)}%`,background:SKILL_COLORS[i%SKILL_COLORS.length]}}/>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sk.titles.slice(0,3).map(t=><span key={t} className="text-[9px] text-[#6b7a9e] bg-[#f0f4ff] px-2 py-0.5 rounded-full border border-[#dde4f5]">{t}</span>)}
                          {sk.titles.length>3&&<span className="text-[9px] text-[#b0baca]">+{sk.titles.length-3}</span>}
                        </div>
                      </div>
                    ))}
                  </div>}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── SETTINGS MODAL ───────────────────────────────────────────
function SettingsModal({ user, onClose, onSaved }) {
  const stored = (() => { try { return JSON.parse(localStorage.getItem("nn_profile") || "{}"); } catch { return {}; } })();
  const [username,   setUsername]   = useState(user?.user_metadata?.username || stored.username || "");
  const [bio,        setBio]        = useState(localStorage.getItem("nn_bio") || "");
  const [instrument, setInstrument] = useState(stored.instrument || "guitar");
  const [level,      setLevel]      = useState(stored.level || "beginner");
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState("");

  const INSTRUMENTS = ["Guitar","Bass","Ukulele","Banjo","Mandolin","Piano","Drums","Other"];
  const LEVELS      = ["Beginner","Intermediate","Advanced","Professional"];

  const handleSave = async () => {
    if (username.trim().length < 3) { setError("Username must be at least 3 characters."); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError("Username can only contain letters, numbers, and underscores."); return; }
    setSaving(true); setError("");
    try {
      // Update Supabase profile
      await supabase.from("profiles").update({
        username: username.trim(),
        bio: bio.trim(),
        instrument: instrument.toLowerCase(),
        level: level.toLowerCase(),
      }).eq("id", user.id);

      // Update auth metadata
      await supabase.auth.updateUser({ data: { username: username.trim() } });

      // Update localStorage
      const profile = { ...stored, username: username.trim(), instrument: instrument.toLowerCase(), level: level.toLowerCase() };
      localStorage.setItem("nn_profile", JSON.stringify(profile));
      localStorage.setItem("nn_bio", bio.trim());

      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved({ username: username.trim(), instrument, level, bio }); onClose(); }, 1200);
    } catch(e) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#dde4f5]">
          <div>
            <h2 className="font-black text-xl text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>Profile settings</h2>
            <p className="text-xs text-[#6b7a9e] mt-0.5">{user?.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#6b7a9e] hover:bg-[#e8eeff] border-none cursor-pointer text-sm">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-4">

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-1">
            <div className="w-16 h-16 bg-[#1a3a8f] rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0" style={{fontFamily:"Nunito,sans-serif"}}>
              {username.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className="text-sm font-bold text-[#0d1b3e]">@{username || "username"}</div>
              <div className="text-xs text-[#6b7a9e]">{instrument} · {level}</div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-bold text-[#0d1b3e] uppercase tracking-wider mb-1.5 block">Username</label>
            <div className="flex items-center border-[1.5px] border-[#dde4f5] rounded-xl bg-[#f0f4ff] focus-within:border-[#4a72e8] transition-all overflow-hidden">
              <span className="pl-3 text-sm text-[#6b7a9e] font-bold">@</span>
              <input value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g,""))}
                className="flex-1 px-2 py-2.5 bg-transparent outline-none text-sm text-[#0d1b3e]"
                placeholder="your_username"
                style={{fontFamily:"Plus Jakarta Sans,sans-serif"}} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-[#0d1b3e] uppercase tracking-wider mb-1.5 block">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="Tell people about your musical journey..."
              className="w-full px-3 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all resize-none placeholder:text-[#b0baca]"
              style={{fontFamily:"Plus Jakarta Sans,sans-serif"}} />
          </div>

          {/* Instrument + Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#0d1b3e] uppercase tracking-wider mb-1.5 block">Instrument</label>
              <select value={instrument} onChange={e => setInstrument(e.target.value)}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all cursor-pointer"
                style={{fontFamily:"Plus Jakarta Sans,sans-serif"}}>
                {INSTRUMENTS.map(i => <option key={i} value={i.toLowerCase()}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#0d1b3e] uppercase tracking-wider mb-1.5 block">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all cursor-pointer"
                style={{fontFamily:"Plus Jakarta Sans,sans-serif"}}>
                {LEVELS.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className={"w-full py-3.5 font-black rounded-2xl border-none cursor-pointer transition-all text-sm mt-1 " +
              (saved ? "bg-green-500 text-white shadow-[0_4px_0_#15803d]" :
               saving ? "bg-[#dde4f5] text-[#6b7a9e] cursor-not-allowed" :
               "bg-[#1a3a8f] text-white shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0f2460]")}
            style={{fontFamily:"Nunito,sans-serif"}}>
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ACTIVITY ART ─────────────────────────────────────────────
function ActivityArt({ song }) {
  return (
    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#e8eeff] flex-shrink-0">
      <AlbumArt song={song} className="w-full h-full object-cover" fallbackClassName="w-full h-full" />
    </div>
  );
}

// ── PROFILE HELPERS ──────────────────────────────────────────
function getUsername() {
  try { return JSON.parse(localStorage.getItem("nn_profile") || "{}").username || ""; } catch { return ""; }
}

// Parse "Feb 28", "Jan 30" etc → Date object (assumes current year, roll back if future)
function parseSongDate(str) {
  if (!str) return null;
  const now = new Date();
  const d = new Date(`${str} ${now.getFullYear()}`);
  if (isNaN(d)) return null;
  if (d > now) d.setFullYear(now.getFullYear() - 1);
  return d;
}

// Calculate streak: how many consecutive recent days have at least one song added
function calcStreak(songs) {
  if (!songs.length) return 0;
  const days = new Set(
    songs.map(s => {
      const d = parseSongDate(s.date);
      return d ? d.toDateString() : null;
    }).filter(Boolean)
  );
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break; // gap found
    }
  }
  return streak;
}

function countUniqueSkills(songs) {
  const s = new Set();
  songs.forEach(song => (song.skills || []).forEach(sk => s.add(sk)));
  return s.size;
}

// ── MAIN ─────────────────────────────────────────────────────
export default function Dashboard({ darkMode, setDarkMode }) {
  const [tab, setTab] = useState("library");
  const [view, setView] = useState("grid");
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [structureSong, setStructureSong] = useState(null);

  // Prevent StrictMode / hot-reload duplicate mounts from showing double UI
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    return () => { setReady(false); };
  }, []);
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterRating, setFilterRating] = useState(0);
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(IS_PRO_DEV_OVERRIDE);
  const IS_PRO = isPro;

  async function handleUpgrade(plan = "monthly") {
    const priceId = plan === "annual"
      ? "price_1TA28sRvo6SdBTINe0u6jkdx"
      : "price_1TA289Rvo6SdBTINrbtmTyS7";
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user?.id, email: user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error: " + (data.error || "No URL returned"));
      }
    } catch (e) {
      console.error("Checkout error:", e);
      alert("Checkout failed — check console for details");
    }
  }
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dark = darkMode;

  // ── AUTH + DATA LOADING ──────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadSongs(session.user.id);
        // Load pro status from Supabase
        supabase.from("profiles").select("is_pro").eq("id", session.user.id).single()
          .then(({ data }) => { if (data?.is_pro) setIsPro(true); });
        // Handle redirect back from Stripe
        if (window.location.search.includes("pro=success")) {
          setIsPro(true);
          window.history.replaceState({}, "", "/dashboard");
        }
      } else {
        window.location.href = "/";
      }
    });
  }, []);

  async function loadSongs(userId) {
    setLoadingSongs(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSongs(data);
      // Enrich songs missing metadata in the background
      enrichSongs(data, userId);
    } else setSongs(INIT_SONGS);
    setLoadingSongs(false);
  }

  async function enrichSongs(songs, userId) {
    const missing = songs.filter(s => !s.genre && !s.duration);
    if (!missing.length) return;
    const updates = {};
    for (const song of missing) {
      try {
        const query = encodeURIComponent(`${song.title} ${song.artist}`);
        let results = [];
        try {
          const r = await fetch(`/api/itunes?term=${query}&limit=1`);
          if (r.ok) { const d = await r.json(); results = d.results || []; }
        } catch(e) {}
        if (!results.length) {
          try {
            const r = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1&media=music`);
            const d = await r.json(); results = d.results || [];
          } catch(e) {}
        }
        const match = results[0];
        if (!match) continue;
        const u = {
          genre: match.primaryGenreName || null,
          duration: match.trackTimeMillis ? parseFloat((match.trackTimeMillis / 60000).toFixed(2)) : null,
          artwork_url: match.artworkUrl100?.replace("100x100bb", "600x600bb") || song.artwork_url || null,
        };
        await supabase.from("songs").update(u).eq("id", song.id);
        updates[song.id] = u;
        await new Promise(r => setTimeout(r, 300));
      } catch(e) {}
    }
    // Single batched state update instead of one per song
    if (Object.keys(updates).length > 0) {
      setSongs(prev => prev.map(s => updates[s.id] ? { ...s, ...updates[s.id], artworkUrl: updates[s.id].artwork_url } : s));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // Profile — pulled from Supabase user or localStorage fallback
  const username   = user?.user_metadata?.username || getUsername() || "there";
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  const avatarLetter = username.charAt(0).toUpperCase() || "?";
  const [navAvatarUrl, setNavAvatarUrl] = useState(() => localStorage.getItem("nn_avatar") || null);
  // Keep nav avatar in sync when profile panel updates it
  useEffect(() => {
    const onStorage = () => setNavAvatarUrl(localStorage.getItem("nn_avatar") || null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const streak     = calcStreak(songs);
  const skillCount = countUniqueSkills(songs);
  const mastered   = songs.filter(s => s.progress === 100).length;

  const allSkills = useMemo(() => {
    const s = new Set();
    songs.forEach(song => song.skills.forEach(sk => s.add(sk)));
    return ["All", ...Array.from(s).sort()];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter(s => {
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase());
      const matchSkill = filterSkill === "All" || s.skills.includes(filterSkill);
      const matchRating = filterRating === 0 || s.rating >= filterRating;
      return matchSearch && matchSkill && matchRating;
    });
  }, [songs, search, filterSkill, filterRating]);

  const [confirmDelete, setConfirmDelete] = useState(null); // song to delete

  const deleteSong = async (song) => {
    setSongs(prev => prev.filter(s => s.id !== song.id));
    setConfirmDelete(null);
    if (selected?.id === song.id) setSelected(null);
    if (user) {
      await supabase.from("songs").delete().eq("id", song.id).eq("user_id", user.id);
    }
  };

  const addSong = async (newSong) => {
    if (user) {
      const { data, error } = await supabase.from("songs").insert({
        user_id: user.id,
        title: newSong.title,
        artist: newSong.artist,
        skills: newSong.skills || [],
        rating: newSong.rating || 0,
        progress: newSong.progress || 0,
        notes: newSong.notes || "",
        date: newSong.date || new Date().toLocaleDateString("en-US", { month:"short", day:"numeric" }),
        parts: newSong.parts || [],
        structure: newSong.structure || [],
        genre: newSong.genre || null,
        duration: newSong.duration || null,
        artwork_url: newSong.artworkUrl || null,
        instrument: newSong.instrument || null,
      }).select().single();
      if (!error && data) setSongs(prev => [{ ...data, artworkUrl: data.artwork_url }, ...prev]);
    } else {
      setSongs(prev => [{ ...newSong, id: Date.now() }, ...prev]);
    }
  };

  const updateSong = async (updated) => {
    setSongs(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelected(updated);
    if (user) {
      await supabase.from("songs").update({
        title: updated.title, artist: updated.artist,
        skills: updated.skills || [], rating: updated.rating || 0,
        progress: updated.progress || 0, notes: updated.notes || "",
        parts: updated.parts || [], structure: updated.structure || [],
        key: updated.key || null, bpm: updated.bpm || null,
        tuning: updated.tuning || null, capo: updated.capo || 0,
        instrument: updated.instrument || null,
        attachments: updated.attachments || [],
      }).eq("id", updated.id).eq("user_id", user.id);
    }
  };

  const handleStructureSave = async (updatedSong) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    setStructureSong(null);
    if (user) {
      await supabase.from("songs").update({
        parts: updatedSong.parts || [],
        structure: updatedSong.structure || [],
      }).eq("id", updatedSong.id).eq("user_id", user.id);
    }
  };

  const bg   = dark ? "bg-[#0d1b3e]" : "bg-[#f0f4ff]";
  const text = dark ? "text-white" : "text-[#0d1b3e]";
  const muted= dark ? "text-white/50" : "text-[#6b7a9e]";
  const navBg= dark ? "bg-[#0d1b3e]/90 border-white/10" : "bg-[#f0f4ff]/90 border-[#dde4f5]";

  if (!ready) return null;

  return (
    <div className={"min-h-screen transition-colors duration-300 "+bg} style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage:"linear-gradient(rgba(26,58,143,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,58,143,.03) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />

      {/* NAV */}
      <nav className={"sticky top-0 z-40 backdrop-blur-xl border-b px-8 py-5 flex items-center justify-between transition-colors duration-300 "+navBg}>
        <a href="/" className={"flex items-center gap-3 no-underline "+(dark?"text-white":"text-[#1a3a8f]")}>
          <div className="w-10 h-10 bg-[#1a3a8f] rounded-xl flex items-center justify-center shadow-md">
            <MusicIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl" style={{ fontFamily:"Nunito, sans-serif" }}>NoteNest</span>
        </a>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowLog(true)} className="flex items-center gap-2 bg-[#1a3a8f] text-white font-black px-6 py-3 rounded-xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer text-sm" style={{ fontFamily:"Nunito, sans-serif" }}>
            <PlusIcon className="w-4 h-4" /> Log a song
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setShowProfile(true)} title="View profile"
                className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer group">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#dde4f5] group-hover:border-[#4a72e8] transition-all shadow-sm flex-shrink-0 bg-[#1a3a8f] flex items-center justify-center">
                  {navAvatarUrl
                    ? <img src={navAvatarUrl} alt="avatar" className="w-full h-full object-cover"/>
                    : <span className="font-black text-lg text-white" style={{fontFamily:"Nunito,sans-serif"}}>{avatarLetter}</span>}
                </div>
                <span className={"text-sm font-bold transition-colors hidden md:block " + (dark ? "text-white/80 group-hover:text-white" : "text-[#0d1b3e] group-hover:text-[#4a72e8]")}
                  style={{fontFamily:"Nunito,sans-serif"}}>
                  @{username}
                </span>
              </button>
              <button onClick={() => setShowSettings(true)} title="Settings"
                className={"w-9 h-9 rounded-full flex items-center justify-center transition-all bg-transparent border-none cursor-pointer " + (dark ? "text-white/50 hover:text-white hover:bg-white/10" : "text-[#6b7a9e] hover:text-[#1a3a8f] hover:bg-[#e8eeff]")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              </button>
              <button onClick={handleSignOut} className={"text-sm font-bold bg-transparent border-none cursor-pointer transition-colors " + (dark ? "text-white/50 hover:text-white" : "text-[#6b7a9e] hover:text-[#1a3a8f]")}>Sign out</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-sm font-bold text-[#1a3a8f] bg-[#e8eeff] px-4 py-2.5 rounded-xl border-none cursor-pointer hover:bg-[#1a3a8f] hover:text-white transition-all">
              Sign in
            </button>
          )}
        </div>
      </nav>

      <div className="relative z-10 px-10 py-8">
        {/* TOP ROW */}
        <div className="grid grid-cols-[1fr_380px] gap-6 mb-8">
          <div className="bg-[#1a3a8f] rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 right-24 w-40 h-40 bg-white/5 rounded-full translate-y-12" />
            <div className="relative z-10">
              {streak > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white/80 text-sm font-bold">{streak}-day streak</span>
                </div>
              )}
              <h1 className="font-black text-4xl text-white mb-2 leading-tight" style={{ fontFamily:"Nunito, sans-serif" }}>Welcome back, {displayName}</h1>
              <p className="text-white/60 mb-8">You have <strong className="text-white">{songs.length} songs</strong> in your library. Keep it up.</p>
              <div className="flex gap-10">
                {[[songs.length,"Songs logged"],[skillCount,"Skills tracked"],[mastered,"Fully mastered"]].map(([n,l]) => (
                  <div key={l}>
                    <div className="font-black text-3xl text-white" style={{ fontFamily:"Nunito, sans-serif" }}>{n}</div>
                    <div className="text-white/55 text-sm">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <AIRecCard />
        </div>

        {/* FREE TIER AD BANNER */}
        {!IS_PRO && (
          <div className="mb-5 bg-white border border-[#dde4f5] rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f0f4ff] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4a72e8" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>
              </div>
              <div>
                <span className="text-xs font-bold text-[#0d1b3e]">You're on the Free plan</span>
                <span className="text-xs text-[#6b7a9e] ml-2">· 1 attachment per song · 9 Pro packs locked</span>
              </div>
            </div>
            <button onClick={handleUpgrade} className="flex-shrink-0 bg-[#1a3a8f] text-white font-black text-xs px-4 py-2 rounded-xl border-none cursor-pointer hover:bg-[#4a72e8] transition-all" style={{fontFamily:"Nunito,sans-serif"}}>
              Upgrade to Pro $7/mo
            </button>
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-[#dde4f5] w-fit shadow-sm">
            {[["library","Library"],["activity","Activity"],["skills","Skills"],["setlists","Setlists"],["packs","Packs"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={"px-6 py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer transition-all "+(tab===id?"bg-[#1a3a8f] text-white shadow-[0_2px_0_#0f2460]":"bg-transparent text-[#6b7a9e] hover:text-[#1a3a8f]")}
                style={{ fontFamily:"Nunito, sans-serif" }}>
                {label}
              </button>
            ))}
          </div>
          {tab === "library" && (
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-[#dde4f5] shadow-sm">
              <button onClick={() => setView("grid")} className={"p-2 rounded-lg border-none cursor-pointer transition-all "+(view==="grid"?"bg-[#1a3a8f] text-white":"bg-transparent text-[#6b7a9e] hover:text-[#1a3a8f]")}>
                <GridIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setView("list")} className={"p-2 rounded-lg border-none cursor-pointer transition-all "+(view==="list"?"bg-[#1a3a8f] text-white":"bg-transparent text-[#6b7a9e] hover:text-[#1a3a8f]")}>
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* LIBRARY TAB */}
        {tab === "library" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={"font-black text-2xl "+text} style={{ fontFamily:"Nunito, sans-serif" }}>Your library</h2>
                <p className={"text-sm "+muted}>{filteredSongs.length} of {songs.length} songs{search||filterSkill!=="All"||filterRating>0?" · filtered":" · click any song to edit"}</p>
              </div>
              <button onClick={() => setShowLog(true)} className="flex items-center gap-2 text-sm font-bold text-[#1a3a8f] border border-[#dde4f5] bg-white px-4 py-2 rounded-xl hover:border-[#1a3a8f] transition-colors cursor-pointer">
                <PlusIcon className="w-4 h-4" /> Add song
              </button>
            </div>

            {/* Search + Filter */}
            <div className={"flex flex-wrap items-center gap-3 p-3 rounded-2xl border mb-5 "+(dark?"bg-white/5 border-white/10":"bg-white border-[#dde4f5]")}>
              <div className={"flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border "+(dark?"bg-white/10 border-white/15":"bg-[#f0f4ff] border-[#dde4f5]")}>
                <svg className={"w-4 h-4 flex-shrink-0 "+muted} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search songs or artists..."
                  className={"flex-1 bg-transparent outline-none text-sm "+(dark?"text-white placeholder:text-white/30":"text-[#0d1b3e] placeholder:text-[#b0baca]")}
                  style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }} />
                {search && <button onClick={() => setSearch("")} className={"bg-transparent border-none cursor-pointer text-sm "+muted}>✕</button>}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={"text-xs font-bold "+muted}>Skill:</span>
                {allSkills.slice(0,6).map(sk => (
                  <button key={sk} onClick={() => setFilterSkill(sk)}
                    className={"text-xs font-bold px-2.5 py-1.5 rounded-xl border-none cursor-pointer transition-all "+(filterSkill===sk?"bg-[#1a3a8f] text-white":(dark?"bg-white/10 text-white/60 hover:bg-white/20":"bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff]"))}>
                    {sk}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={"text-xs font-bold "+muted}>Min rating:</span>
                {[0,3,4,5].map(r => (
                  <button key={r} onClick={() => setFilterRating(r)}
                    className={"text-xs font-bold px-2.5 py-1.5 rounded-xl border-none cursor-pointer transition-all "+(filterRating===r?"bg-[#1a3a8f] text-white":(dark?"bg-white/10 text-white/60 hover:bg-white/20":"bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff]"))}>
                    {r === 0 ? "Any" : r+"+ stars"}
                  </button>
                ))}
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-11 gap-5">
                {filteredSongs.map((s) => (
                  <SongGridCard key={s.id} song={s} onClick={setSelected} onStructureClick={setStructureSong} onDelete={setConfirmDelete} />
                ))}
                <div className="group cursor-pointer">
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-[#dde4f5] flex flex-col items-center justify-center gap-2 hover:border-[#4a72e8] hover:bg-[#f0f4ff] transition-all">
                    <PlusIcon className="w-8 h-8 text-[#dde4f5] group-hover:text-[#4a72e8] transition-colors" />
                    <span className="text-xs text-[#dde4f5] group-hover:text-[#4a72e8] font-bold transition-colors">Add</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#dde4f5] p-3 shadow-sm">
                <div className="flex items-center w-full px-4 pb-3 mb-1 border-b border-[#dde4f5] text-[10px] font-bold text-[#6b7a9e] uppercase tracking-wider" style={{gap:"12px"}}>
                  <div style={{width:"48px",flexShrink:0}} />
                  <div style={{flex:"1 1 0",minWidth:0,maxWidth:"200px"}}>Song</div>
                  <div style={{width:"120px",flexShrink:0}} className="hidden sm:block">Skills</div>
                  <div style={{width:"72px",flexShrink:0}} className="hidden lg:block">Instrument</div>
                  <div style={{width:"48px",flexShrink:0}} className="hidden lg:block text-center">Key</div>
                  <div style={{width:"56px",flexShrink:0}} className="hidden lg:block text-center">BPM</div>
                  <div style={{width:"72px",flexShrink:0}} className="hidden xl:block">Tuning/Capo</div>
                  <div style={{width:"68px",flexShrink:0}} className="hidden xl:block">Genre</div>
                  <div style={{width:"44px",flexShrink:0}} className="hidden xl:block text-center">Length</div>
                  <div style={{width:"88px",flexShrink:0}} className="hidden md:block">Progress</div>
                  <div style={{width:"88px",flexShrink:0}} className="text-center">Difficulty</div>
                  <div style={{width:"52px",flexShrink:0}} className="hidden lg:block text-right">Added</div>
                  <div style={{width:"76px",flexShrink:0}} />
                </div>
                {filteredSongs.map((s) => (
                  <SongRow key={s.id} song={s} onClick={setSelected} onStructureClick={setStructureSong} onDelete={setConfirmDelete} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-black text-2xl text-[#0d1b3e]" style={{ fontFamily:"Nunito, sans-serif" }}>Song diary</h2>
                <p className="text-[#6b7a9e] text-sm">{IS_PRO ? "Your full learning history" : "Last 7 days — upgrade for full history"}</p>
              </div>
              {!IS_PRO && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  Full history is Pro
                </span>
              )}
            </div>
            {(() => {
              const cutoff = IS_PRO ? null : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              const visibleSongs = IS_PRO ? songs : songs.filter(s => {
                const d = parseSongDate(s.date);
                return d && d >= cutoff;
              });
              return visibleSongs.length === 0 ? (
                IS_PRO ? (
                  <div className="text-center py-16 text-[#6b7a9e] text-sm">No songs logged yet.</div>
                ) : (
                  <ProGate onUpgrade={handleUpgrade}
                    title="Full Activity History"
                    description="You have no songs logged in the last 7 days. Upgrade to Pro to see your complete learning diary."
                    features={["Complete history of every song you've practiced","See your progress over time","Filter by date, skill, or rating","Full learning timeline"]}
                  />
                )
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {visibleSongs.map((s) => (
                      <div key={s.id} onClick={() => setSelected(s)} className="bg-white rounded-2xl border border-[#dde4f5] p-4 flex gap-4 cursor-pointer hover:border-[#4a72e8] hover:shadow-sm transition-all">
                        <ActivityArt song={s} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <span className="font-bold text-sm text-[#0d1b3e]">{s.title}</span>
                              <span className="text-sm text-[#6b7a9e]"> · {s.artist}</span>
                            </div>
                            <span className="text-xs text-[#6b7a9e] flex-shrink-0">{s.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1,2,3,4,5].map((n) => <StarIcon key={n} className={"w-3.5 h-3.5 "+(n<=s.rating?"text-amber-400":"text-[#dde4f5]")} filled={n<=s.rating} />)}
                            <span className="text-xs text-[#6b7a9e] ml-1">{s.progress}% mastered</span>
                          </div>
                          {s.notes && <p className="text-xs text-[#6b7a9e] leading-relaxed italic line-clamp-2">"{s.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!IS_PRO && songs.length > visibleSongs.length && (
                    <div className="mt-6 bg-gradient-to-r from-[#f0f4ff] to-[#e8eeff] rounded-2xl p-5 flex items-center justify-between gap-4 border border-[#dde4f5]">
                      <div>
                        <div className="font-black text-sm text-[#0d1b3e]" style={{fontFamily:"Nunito,sans-serif"}}>+{songs.length - visibleSongs.length} more songs hidden</div>
                        <div className="text-xs text-[#6b7a9e]">Upgrade Pro to see your full history</div>
                      </div>
                      <button className="bg-[#1a3a8f] text-white font-black text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer hover:bg-[#4a72e8] transition-all flex-shrink-0" style={{fontFamily:"Nunito,sans-serif"}}>
                        Upgrade $7/mo →
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* SKILLS TAB */}
        {tab === "skills" && (
          <div>
            <div className="mb-5">
              <h2 className="font-black text-2xl text-[#0d1b3e]" style={{ fontFamily:"Nunito, sans-serif" }}>Skill breakdown</h2>
              <p className="text-[#6b7a9e] text-sm">Built from your song library · click a skill to see songs</p>
            </div>
            {!IS_PRO ? (
              <ProGate onUpgrade={handleUpgrade}
                title="Skills Breakdown"
                description="See exactly which techniques you're strongest in and which need more work — built from your song library."
                features={["Full skill breakdown with progress bars","Click any skill to see matching songs","Identify your weakest areas","Track improvement over time"]}
              />
            ) : (
              <SkillsTab songs={songs} onSelectSong={setSelected} />
            )}
          </div>
        )}

        {/* SETLISTS TAB */}
        {tab === "setlists" && (
          <div key="setlists-tab">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className={"font-black text-2xl "+text} style={{ fontFamily:"Nunito, sans-serif" }}>Setlist builder</h2>
                <p className={"text-sm "+muted}>{IS_PRO ? "Build setlists from your song library" : "Free plan: 3 setlists · Upgrade for unlimited"}</p>
              </div>
              {!IS_PRO && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  Unlimited setlists is Pro
                </span>
              )}
            </div>
            <SetlistBuilder key="setlist-builder" songs={songs} dark={dark} isPro={IS_PRO} />
          </div>
        )}

        {/* PACKS TAB */}
        {tab === "packs" && (
          <div>
            <div className="mb-6">
              <h2 className="font-black text-2xl text-[#0d1b3e]" style={{ fontFamily:"Nunito, sans-serif" }}>Learning Packs</h2>
              <p className="text-sm text-[#6b7a9e]">Curated song collections to guide your learning journey</p>
            </div>
            <Packs songs={songs} onAddSong={addSong} isPro={IS_PRO} />
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {selected && <SongModal song={selected} onClose={() => setSelected(null)} onUpdate={updateSong} onOpenStructure={setStructureSong} />}
      {showLog   && <LogSongModal onClose={() => setShowLog(false)} onAdd={addSong} />}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4"
          onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <h3 className="font-black text-xl text-[#0d1b3e] text-center mb-1" style={{ fontFamily:"Nunito,sans-serif" }}>Remove song?</h3>
            <p className="text-sm text-[#6b7a9e] text-center mb-6">
              <strong className="text-[#0d1b3e]">{confirmDelete.title}</strong> by {confirmDelete.artist} will be permanently removed from your library.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 bg-[#f0f4ff] text-[#0d1b3e] font-bold rounded-2xl border-none cursor-pointer hover:bg-[#e8eeff] transition-colors text-sm">
                Cancel
              </button>
              <button onClick={() => deleteSong(confirmDelete)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl border-none cursor-pointer transition-colors text-sm shadow-[0_4px_0_#dc2626]"
                style={{ fontFamily:"Nunito,sans-serif" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showAuth  && <AuthModal onClose={() => setShowAuth(false)} onAuth={setUser} />}
      {showProfile && user && <ProfilePanel user={user} songs={songs} onClose={() => setShowProfile(false)} onAvatarChange={setNavAvatarUrl} onOpenSettings={() => { setShowProfile(false); setShowSettings(true); }} />}
      {showSettings && user && <SettingsModal user={user} onClose={() => setShowSettings(false)} onSaved={(p) => {
        setUser(prev => ({ ...prev, user_metadata: { ...prev?.user_metadata, username: p.username } }));
      }} />}

      {/* Song Structure Diagram */}
      {structureSong && (
        <SongStructureDiagram
          song={structureSong}
          onClose={() => setStructureSong(null)}
          onSave={handleStructureSave}
        />
      )}
    </div>
  );
}