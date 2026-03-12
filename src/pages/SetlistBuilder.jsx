import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../supabase";
import AuthModal from "../components/AuthModal";
import LogSongModal from "./LogSongModal";
import SetlistBuilder from "./SetlistBuilder";
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

const SKILL_DATA = [
  { label:"Open Chords",    pct:88, color:"from-[#1a3a8f] to-[#4a72e8]", songs:["Wonderwall","Wish You Were Here","Knockin on Heavens Door"] },
  { label:"Fingerpicking",  pct:72, color:"from-green-600 to-green-400",  songs:["Blackbird","Hotel California","Wish You Were Here","Stairway to Heaven"] },
  { label:"Bassline/Groove",pct:65, color:"from-teal-700 to-teal-400",    songs:["Come As You Are"] },
  { label:"Barre Chords",   pct:54, color:"from-amber-600 to-amber-400",  songs:["Hotel California","Stairway to Heaven"] },
  { label:"Power Chords",   pct:40, color:"from-purple-700 to-purple-400",songs:["Seven Nation Army"] },
  { label:"Lead Guitar",    pct:28, color:"from-rose-600 to-rose-400",    songs:["Stairway to Heaven"] },
];

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
  const art = useAlbumArt(song.title + " " + song.artist);
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
function AIRecCard() {
  return (
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
function SongGridCard({ song, onClick, onStructureClick }) {
  return (
    <div className="group flex flex-col">
      {/* Album art square — clicking opens edit modal */}
      <div
        onClick={() => onClick(song)}
        className="relative aspect-square rounded-2xl overflow-hidden bg-[#e8eeff] mb-2 shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        <AlbumArt song={song} className="w-full h-full object-cover" fallbackClassName="w-full h-full" />

        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 z-10">
          <StarIcon className="w-3 h-3 text-amber-400" filled />{song.rating}
        </div>
        {song.progress === 100 && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow z-10">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Hover overlay — purely decorative, no click blocker */}
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

      {/* Song info */}
      <div className="text-sm font-bold text-[#0d1b3e] truncate cursor-pointer" onClick={() => onClick(song)}>{song.title}</div>
      <div className="text-xs text-[#6b7a9e] truncate mb-2" onClick={() => onClick(song)}>{song.artist}</div>

      {/* Structure button — always visible below the card */}
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
function SongRow({ song, onClick, onStructureClick }) {
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
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#f0f4ff] transition-colors cursor-pointer group border border-transparent hover:border-[#dde4f5]">
      {/* Album art */}
      <div onClick={() => onClick(song)} className="w-14 h-14 rounded-2xl overflow-hidden bg-[#e8eeff] flex-shrink-0 shadow-md">
        <AlbumArt song={song} className="w-full h-full object-cover" fallbackClassName="w-full h-full" />
      </div>

      {/* Title + artist */}
      <div onClick={() => onClick(song)} className="w-44 flex-shrink-0 min-w-0">
        <div className="font-black text-sm text-[#0d1b3e] truncate mb-0.5" style={{ fontFamily:"Nunito,sans-serif" }}>{song.title}</div>
        <div className="text-xs text-[#6b7a9e] truncate">{song.artist}</div>
      </div>

      {/* Skills */}
      <div onClick={() => onClick(song)} className="hidden sm:flex flex-wrap gap-1 w-36 flex-shrink-0">
        {song.skills.slice(0,2).map((s) => <span key={s} className="text-[10px] font-bold bg-[#e8eeff] text-[#1a3a8f] px-2 py-0.5 rounded-full">{s}</span>)}
        {song.skills.length > 2 && <span className="text-[10px] font-bold text-[#6b7a9e]">+{song.skills.length - 2}</span>}
      </div>

      {/* Key */}
      <div onClick={() => onClick(song)} className="hidden lg:flex w-16 flex-shrink-0 justify-center">
        {song.key
          ? <span className={"text-xs font-black px-2.5 py-1 rounded-lg " + kc}>{song.key}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* BPM */}
      <div onClick={() => onClick(song)} className="hidden lg:flex w-16 flex-shrink-0 justify-center">
        {song.bpm
          ? <span className="text-xs font-bold text-[#0d1b3e]">{song.bpm} <span className="text-[#6b7a9e] font-medium">bpm</span></span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* Tuning + Capo */}
      <div onClick={() => onClick(song)} className="hidden xl:flex flex-col gap-0.5 w-28 flex-shrink-0">
        {song.tuning
          ? <span className="text-xs font-bold text-[#0d1b3e]">{song.tuning}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
        {song.capo > 0
          ? <span className="text-[10px] text-[#6b7a9e] font-medium">Capo {song.capo}</span>
          : null}
      </div>

      {/* Genre */}
      <div onClick={() => onClick(song)} className="hidden xl:block w-24 flex-shrink-0">
        {song.genre
          ? <span className="text-xs font-bold bg-[#f0f4ff] text-[#6b7a9e] px-2.5 py-1 rounded-full">{song.genre}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* Duration */}
      <div onClick={() => onClick(song)} className="hidden xl:block w-16 flex-shrink-0 text-center">
        {song.duration
          ? <span className="text-xs font-bold text-[#0d1b3e]">{Math.floor(song.duration)}:{String(Math.round((song.duration%1)*60)).padStart(2,"0")}</span>
          : <span className="text-xs text-[#dde4f5] font-bold">—</span>}
      </div>

      {/* Progress */}
      <div onClick={() => onClick(song)} className="w-24 flex-shrink-0 hidden md:block">
        <div className="flex justify-between text-[10px] font-semibold text-[#6b7a9e] mb-1">
          <span className="font-bold text-[#0d1b3e]">{song.progress}%</span>
          {song.progress === 100 && <span className="text-green-600 font-bold">✓</span>}
        </div>
        <div className="h-1.5 bg-[#e8eeff] rounded-full overflow-hidden">
          <div className={"h-full rounded-full transition-all "+(song.progress===100?"bg-green-500":"bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8]")} style={{ width:song.progress+"%" }} />
        </div>
      </div>

      {/* Stars */}
      <div onClick={() => onClick(song)} className="flex items-center gap-0.5 flex-shrink-0">
        {[1,2,3,4,5].map((n) => <StarIcon key={n} className={"w-3.5 h-3.5 "+(n<=song.rating?"text-amber-400":"text-[#dde4f5]")} filled={n<=song.rating} />)}
      </div>

      {/* Date added */}
      <div onClick={() => onClick(song)} className="text-xs text-[#6b7a9e] flex-shrink-0 hidden lg:block w-14 text-right font-medium">{song.date}</div>

      {/* Structure button */}
      <button
        onClick={(e) => { e.stopPropagation(); onStructureClick(song); }}
        className="flex-shrink-0 flex items-center gap-1.5 bg-[#e8eeff] hover:bg-[#1a3a8f] text-[#1a3a8f] hover:text-white text-[11px] font-bold px-3 py-2 rounded-xl border border-[#dde4f5] cursor-pointer transition-all opacity-0 group-hover:opacity-100"
      >
        <StructureIcon className="w-3 h-3" />
        Structure
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
  const [saved,    setSaved]    = useState(false);

  const save = () => {
    onUpdate({ ...song, rating, progress, notes });
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
          <button
            onClick={() => { onClose(); onOpenStructure(song); }}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#dde4f5] rounded-2xl text-sm font-bold text-[#1a3a8f] hover:border-[#4a72e8] hover:bg-[#f0f4ff] transition-all cursor-pointer bg-transparent"
            style={{ fontFamily:"Nunito, sans-serif" }}
          >
            <StructureIcon className="w-4 h-4" />
            View / Edit Song Structure
          </button>

          {/* Notes */}
          <div>
            <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Your notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? What needs more work?"
              rows={4}
              className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-2xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] focus:ring-4 focus:ring-[#4a72e8]/10 transition-all resize-none leading-relaxed placeholder:text-[#b0baca]"
              style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }} />
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
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterRating, setFilterRating] = useState(0);
  const [user, setUser] = useState(null);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const dark = darkMode;

  // ── AUTH + DATA LOADING ──────────────────────────────────
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadSongs(session.user.id);
      else { window.location.href = "/"; }
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadSongs(session.user.id);
      else { setSongs(INIT_SONGS); setLoadingSongs(false); }
    });
    return () => subscription.unsubscribe();
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
    for (const song of missing) {
      try {
        const query = encodeURIComponent(`${song.title} ${song.artist}`);
        let results = [];
        try {
          const r = await fetch(`/api/itunes?term=${query}&limit=1`);
          if (r.ok) { const d = await r.json(); results = d.results || []; }
        } catch(e) {}
        if (!results.length) {
          const r = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1&media=music`);
          const d = await r.json(); results = d.results || [];
        }
        const match = results[0];
        if (!match) continue;
        const updates = {
          genre: match.primaryGenreName || null,
          duration: match.trackTimeMillis ? parseFloat((match.trackTimeMillis / 60000).toFixed(2)) : null,
          artworkUrl: match.artworkUrl100?.replace("100x100bb", "600x600bb") || song.artworkUrl || null,
        };
        await supabase.from("songs").update(updates).eq("id", song.id);
        setSongs(prev => prev.map(s => s.id === song.id ? { ...s, ...updates } : s));
        // Small delay to avoid hammering iTunes
        await new Promise(r => setTimeout(r, 300));
      } catch(e) {}
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
      }).select().single();
      if (!error && data) setSongs(prev => [data, ...prev]);
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

  return (
    <div className={"min-h-screen transition-colors duration-300 "+bg} style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage:"linear-gradient(rgba(26,58,143,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,58,143,.03) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />

      {/* NAV */}
      <nav className={"sticky top-0 z-40 backdrop-blur-xl border-b px-8 py-4 flex items-center justify-between transition-colors duration-300 "+navBg}>
        <a href="/" className={"flex items-center gap-2.5 no-underline "+(dark?"text-white":"text-[#1a3a8f]")}>
          <div className="w-8 h-8 bg-[#1a3a8f] rounded-xl flex items-center justify-center shadow-md">
            <MusicIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl" style={{ fontFamily:"Nunito, sans-serif" }}>NoteNest</span>
        </a>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowLog(true)} className="flex items-center gap-2 bg-[#1a3a8f] text-white font-black px-5 py-2.5 rounded-xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer text-sm" style={{ fontFamily:"Nunito, sans-serif" }}>
            <PlusIcon className="w-4 h-4" /> Log a song
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <a href={`/profile/@${username}`} title="View profile" className="w-9 h-9 bg-[#1a3a8f] rounded-full flex items-center justify-center text-white font-black text-sm cursor-pointer no-underline hover:bg-[#4a72e8] transition-colors">{avatarLetter}</a>
              <button onClick={handleSignOut} className="text-xs font-bold text-[#6b7a9e] hover:text-[#1a3a8f] bg-transparent border-none cursor-pointer transition-colors">Sign out</button>
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
                  <SongGridCard key={s.id} song={s} onClick={setSelected} onStructureClick={setStructureSong} />
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
                <div className="flex items-center gap-4 px-4 pb-3 mb-1 border-b border-[#dde4f5] text-[10px] font-bold text-[#6b7a9e] uppercase tracking-wider">
                  <div className="w-14 flex-shrink-0" />
                  <div className="w-44 flex-shrink-0">Song</div>
                  <div className="hidden sm:block w-36 flex-shrink-0">Skills</div>
                  <div className="hidden lg:block w-16 flex-shrink-0 text-center">Key</div>
                  <div className="hidden lg:block w-16 flex-shrink-0 text-center">BPM</div>
                  <div className="hidden xl:block w-28 flex-shrink-0">Tuning / Capo</div>
                  <div className="hidden xl:block w-24 flex-shrink-0">Genre</div>
                  <div className="hidden xl:block w-16 flex-shrink-0 text-center">Length</div>
                  <div className="hidden md:block w-24 flex-shrink-0">Progress</div>
                  <div className="flex-shrink-0 w-24 text-center">Rating</div>
                  <div className="hidden lg:block w-14 flex-shrink-0 text-right">Added</div>
                  <div className="w-24 flex-shrink-0" />
                </div>
                {filteredSongs.map((s) => (
                  <SongRow key={s.id} song={s} onClick={setSelected} onStructureClick={setStructureSong} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div>
            <div className="mb-5">
              <h2 className="font-black text-2xl text-[#0d1b3e]" style={{ fontFamily:"Nunito, sans-serif" }}>Song diary</h2>
              <p className="text-[#6b7a9e] text-sm">Your learning history</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {songs.map((s) => (
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
          </div>
        )}

        {/* SKILLS TAB */}
        {tab === "skills" && (
          <div>
            <div className="mb-5">
              <h2 className="font-black text-2xl text-[#0d1b3e]" style={{ fontFamily:"Nunito, sans-serif" }}>Skill breakdown</h2>
              <p className="text-[#6b7a9e] text-sm">Built automatically from your song library</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {SKILL_DATA.map((sk) => (
                <div key={sk.label} className="bg-white rounded-2xl border border-[#dde4f5] p-5 shadow-sm">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="font-bold text-[#0d1b3e]">{sk.label}</span>
                    <span className="text-[#4a72e8] font-bold">{sk.pct}%</span>
                  </div>
                  <div className="h-3 bg-[#e8eeff] rounded-full overflow-hidden mb-2">
                    <div className={"h-full rounded-full bg-gradient-to-r "+sk.color} style={{ width:sk.pct+"%" }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sk.songs.map((s) => <span key={s} className="text-xs font-semibold text-[#6b7a9e] bg-[#f0f4ff] px-2.5 py-1 rounded-full border border-[#dde4f5]">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETLISTS TAB */}
        {tab === "setlists" && (
          <div>
            <div className="mb-5">
              <h2 className={"font-black text-2xl "+text} style={{ fontFamily:"Nunito, sans-serif" }}>Setlist builder</h2>
              <p className={"text-sm "+muted}>Build setlists from your song library</p>
            </div>
            <SetlistBuilder songs={songs} dark={dark} />
          </div>
        )}

        {/* PACKS TAB */}
        {tab === "packs" && (
          <div>
            <div className="mb-6">
              <h2 className="font-black text-2xl text-[#0d1b3e]" style={{ fontFamily:"Nunito, sans-serif" }}>Learning Packs</h2>
              <p className="text-sm text-[#6b7a9e]">Curated song collections to guide your learning journey</p>
            </div>
            <Packs songs={songs} onAddSong={addSong} />
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {selected && <SongModal song={selected} onClose={() => setSelected(null)} onUpdate={updateSong} onOpenStructure={setStructureSong} />}
      {showLog   && <LogSongModal onClose={() => setShowLog(false)} onAdd={addSong} />}
      {showAuth  && <AuthModal onClose={() => setShowAuth(false)} onAuth={setUser} />}

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