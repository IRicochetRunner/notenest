import { useState, useEffect, useRef } from "react";

// ── ICONS ────────────────────────────────────────────────────
function MusicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function StarIcon({ className, filled, onClick }) {
  return (
    <svg className={className} onClick={onClick} viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
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

// ── SKILL AUTO-TAGGER ────────────────────────────────────────
function inferSkills(song) {
  const title = (song.trackName || "").toLowerCase();
  const artist = (song.artistName || "").toLowerCase();
  const genre = (song.primaryGenreName || "").toLowerCase();
  const skills = [];

  if (["blackbird","dust in the wind","tears in heaven","the boxer","annies song"].some(s => title.includes(s))) skills.push("Fingerpicking");
  if (["stairway","hotel california","wish you were here","landslide"].some(s => title.includes(s))) skills.push("Fingerpicking");
  if (["wonderwall","knockin","brown eyed girl","stand by me","house of the rising sun"].some(s => title.includes(s))) skills.push("Open Chords");
  if (["hotel california","barre","sweet home chicago","la grange"].some(s => title.includes(s))) skills.push("Barre Chords");
  if (["seven nation","smoke on the water","iron man","back in black","highway to hell"].some(s => title.includes(s))) skills.push("Power Chords");
  if (["come as you are","under the bridge","money","another one bites"].some(s => title.includes(s))) skills.push("Bassline");
  if (["stairway","comfortably numb","november rain","hotel california","eruption"].some(s => title.includes(s))) skills.push("Lead Guitar");
  if (["sultans of swing","little wing","red house","pride and joy"].some(s => title.includes(s))) skills.push("Blues Licks");
  if (genre.includes("metal") || genre.includes("hard rock")) { if (!skills.includes("Power Chords")) skills.push("Power Chords"); }
  if (genre.includes("jazz")) skills.push("Jazz Chords");
  if (genre.includes("folk") || genre.includes("country")) { if (!skills.includes("Fingerpicking")) skills.push("Fingerpicking"); if (!skills.includes("Open Chords")) skills.push("Open Chords"); }
  if (skills.length === 0) {
    if (genre.includes("rock") || genre.includes("pop")) skills.push("Open Chords", "Strumming");
    else skills.push("Open Chords");
  }
  return [...new Set(skills)].slice(0, 4);
}

// ── STEP 1: SEARCH ───────────────────────────────────────────
function StepSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [arts, setArts] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(query) + "&entity=song&limit=8&media=music");
        const data = await res.json();
        setResults(data.results || []);
      } catch(e) { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="p-6">
      <div className="text-xs font-bold tracking-widest uppercase text-[#4a72e8] mb-2">Step 1 of 3</div>
      <h2 className="font-black text-2xl text-[#0d1b3e] mb-1" style={{ fontFamily:"Nunito, sans-serif" }}>Find your song</h2>
      <p className="text-sm text-[#6b7a9e] mb-5">Search for any song you have learned to play.</p>

      {/* Search input */}
      <div className={"flex items-center gap-3 border-[1.5px] rounded-2xl bg-[#f0f4ff] transition-all " + (query ? "border-[#4a72e8] ring-4 ring-[#4a72e8]/10" : "border-[#dde4f5]")}>
        <SearchIcon className="w-4 h-4 text-[#6b7a9e] ml-4 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Song name, artist, or both..."
          className="flex-1 px-2 py-3.5 bg-transparent outline-none text-sm text-[#0d1b3e] placeholder:text-[#b0baca]"
          style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}
        />
        {loading && <div className="w-4 h-4 border-2 border-[#dde4f5] border-t-[#1a3a8f] rounded-full animate-spin mr-4 flex-shrink-0" />}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-3 flex flex-col gap-1 max-h-72 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.trackId}
              onClick={() => onSelect(r)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-transparent hover:border-[#dde4f5] hover:bg-[#f0f4ff] transition-all text-left cursor-pointer bg-transparent w-full group"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#e8eeff] flex-shrink-0">
                {r.artworkUrl100
                  ? <img src={r.artworkUrl100} alt={r.trackName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><MusicIcon className="w-5 h-5 text-[#1a3a8f]/30" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[#0d1b3e] truncate">{r.trackName}</div>
                <div className="text-xs text-[#6b7a9e] truncate">{r.artistName} · {r.primaryGenreName}</div>
              </div>
              <div className="text-xs font-bold text-[#4a72e8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">Select →</div>
            </button>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="mt-8 text-center text-[#6b7a9e] text-sm">No results found — try a different search.</div>
      )}

      {!query && (
        <div className="mt-8 text-center">
          <div className="text-4xl mb-3">🎸</div>
          <div className="text-sm text-[#6b7a9e]">Start typing to search millions of songs</div>
        </div>
      )}
    </div>
  );
}

// ── STEP 2: CONFIRM + SKILLS ─────────────────────────────────
function StepConfirm({ song, onBack, onNext }) {
  const [skills, setSkills] = useState(() => inferSkills(song));
  const [customSkill, setCustomSkill] = useState("");
  const art = song.artworkUrl100?.replace("100x100bb","400x400bb");

  const ALL_SKILLS = ["Open Chords","Barre Chords","Power Chords","Fingerpicking","Strumming","Bassline","Lead Guitar","Blues Licks","Jazz Chords","Thumb Independence","Chord Melody","Groove","Riff","Arpeggios","Hybrid Picking"];

  const toggleSkill = (s) => setSkills(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const addCustom = (e) => {
    if (e.key === "Enter" && customSkill.trim()) {
      setSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  return (
    <div className="p-6">
      <div className="text-xs font-bold tracking-widest uppercase text-[#4a72e8] mb-2">Step 2 of 3</div>
      <h2 className="font-black text-2xl text-[#0d1b3e] mb-1" style={{ fontFamily:"Nunito, sans-serif" }}>Confirm your song</h2>
      <p className="text-sm text-[#6b7a9e] mb-5">We auto-tagged the skills — adjust them if needed.</p>

      {/* Song preview */}
      <div className="flex gap-4 items-center p-4 bg-[#f0f4ff] rounded-2xl border border-[#dde4f5] mb-5">
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#e8eeff] shadow-md">
          {art ? <img src={art} alt={song.trackName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><MusicIcon className="w-7 h-7 text-[#1a3a8f]/30" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-lg text-[#0d1b3e] leading-tight truncate" style={{ fontFamily:"Nunito, sans-serif" }}>{song.trackName}</div>
          <div className="text-sm text-[#6b7a9e]">{song.artistName}</div>
          <div className="text-xs text-[#6b7a9e] mt-0.5">{song.primaryGenreName} · {song.releaseDate?.slice(0,4)}</div>
        </div>
        <button onClick={onBack} className="text-xs font-bold text-[#6b7a9e] hover:text-[#1a3a8f] bg-transparent border-none cursor-pointer flex-shrink-0 transition-colors">Change</button>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Skills covered</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {ALL_SKILLS.map((s) => (
            <button key={s} onClick={() => toggleSkill(s)}
              className={"text-xs font-bold px-3 py-1.5 rounded-full border-[1.5px] cursor-pointer transition-all " + (skills.includes(s) ? "bg-[#1a3a8f] border-[#1a3a8f] text-white" : "bg-white border-[#dde4f5] text-[#6b7a9e] hover:border-[#4a72e8]")}>
              {s}
            </button>
          ))}
        </div>
        <input
          type="text" value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyDown={addCustom}
          placeholder="Add a custom skill and press Enter..."
          className="w-full px-4 py-2.5 border-[1.5px] border-[#dde4f5] rounded-xl text-xs bg-[#f0f4ff] outline-none focus:border-[#4a72e8] transition-all"
          style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}
        />
      </div>

      <button onClick={() => onNext(skills)}
        className="w-full py-3.5 bg-[#1a3a8f] text-white font-black rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer text-sm"
        style={{ fontFamily:"Nunito, sans-serif" }}>
        Continue →
      </button>
    </div>
  );
}

// ── STEP 3: RATE + NOTES ─────────────────────────────────────
function StepRate({ song, skills, onBack, onSave }) {
  const [rating, setRating] = useState(0);
  const [progress, setProgress] = useState(50);
  const [notes, setNotes] = useState("");
  const [hovered, setHovered] = useState(0);
  const art = song.artworkUrl100?.replace("100x100bb","400x400bb");

  const progressLabels = ["Just started","Getting there","Pretty solid","Nearly there","Nailed it!"];
  const idx = Math.min(4, Math.floor(progress / 20));

  return (
    <div className="p-6">
      <div className="text-xs font-bold tracking-widest uppercase text-[#4a72e8] mb-2">Step 3 of 3</div>
      <h2 className="font-black text-2xl text-[#0d1b3e] mb-1" style={{ fontFamily:"Nunito, sans-serif" }}>How did it go?</h2>
      <p className="text-sm text-[#6b7a9e] mb-5">Rate your playing and add any notes for later.</p>

      {/* Mini song card */}
      <div className="flex gap-3 items-center mb-5 p-3 bg-[#f0f4ff] rounded-2xl border border-[#dde4f5]">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#e8eeff]">
          {art ? <img src={art} alt={song.trackName} className="w-full h-full object-cover" /> : <MusicIcon className="w-5 h-5 text-[#1a3a8f]/30" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-[#0d1b3e] truncate">{song.trackName}</div>
          <div className="text-xs text-[#6b7a9e] truncate">{song.artistName}</div>
        </div>
        <div className="flex flex-wrap gap-1 max-w-[140px]">
          {skills.slice(0,2).map(s => <span key={s} className="text-[10px] font-bold bg-[#e8eeff] text-[#1a3a8f] px-2 py-0.5 rounded-full">{s}</span>)}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-5">
        <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Your rating</div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <StarIcon key={n}
              className={"w-8 h-8 cursor-pointer transition-colors " + (n <= (hovered || rating) ? "text-amber-400" : "text-[#dde4f5]")}
              filled={n <= (hovered || rating)}
              onClick={() => setRating(n)}
            />
          ))}
          {rating > 0 && <span className="text-sm text-[#6b7a9e] ml-2 self-center">{["","Not there yet","Getting closer","Pretty good","Really solid","Nailed it! 🎸"][rating]}</span>}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[#f0f4ff] rounded-2xl p-4 mb-5">
        <div className="flex justify-between text-xs font-semibold text-[#6b7a9e] mb-2">
          <span className="font-bold text-[#0d1b3e]">How well do you know it?</span>
          <span className={"font-bold " + (progress===100 ? "text-green-600" : "text-[#1a3a8f]")}>{progress}% · {progressLabels[idx]}</span>
        </div>
        <input type="range" min="0" max="100" value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor:"#1a3a8f" }}
        />
      </div>

      {/* Notes */}
      <div className="mb-5">
        <div className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-2">Notes <span className="normal-case font-normal">(optional)</span></div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it go? What needs more work? Tips for next time..."
          rows={3}
          className="w-full px-4 py-3 border-[1.5px] border-[#dde4f5] rounded-2xl text-sm text-[#0d1b3e] bg-[#f0f4ff] outline-none focus:border-[#4a72e8] focus:ring-4 focus:ring-[#4a72e8]/10 transition-all resize-none placeholder:text-[#b0baca] leading-relaxed"
          style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }}
        />
      </div>

      <button
        onClick={() => onSave({ rating, progress, notes })}
        disabled={rating === 0}
        className={"w-full py-3.5 font-black rounded-2xl border-none transition-all text-sm " + (rating > 0 ? "bg-[#1a3a8f] text-white shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0f2460] cursor-pointer" : "bg-[#dde4f5] text-[#6b7a9e] cursor-not-allowed")}
        style={{ fontFamily:"Nunito, sans-serif" }}>
        Add to my library 🎸
      </button>
    </div>
  );
}

// ── SUCCESS SCREEN ───────────────────────────────────────────
function StepSuccess({ song, onClose }) {
  const art = song.artworkUrl100?.replace("100x100bb","400x400bb");
  return (
    <div className="p-8 text-center">
      <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 shadow-xl">
        {art ? <img src={art} alt={song.trackName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#e8eeff] flex items-center justify-center"><MusicIcon className="w-10 h-10 text-[#1a3a8f]/30" /></div>}
      </div>
      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <CheckIcon className="w-6 h-6 text-white" />
      </div>
      <h2 className="font-black text-2xl text-[#0d1b3e] mb-2" style={{ fontFamily:"Nunito, sans-serif" }}>Added to your library!</h2>
      <p className="text-sm text-[#6b7a9e] mb-1"><strong className="text-[#0d1b3e]">{song.trackName}</strong> by {song.artistName}</p>
      <p className="text-xs text-[#6b7a9e] mb-8">Your skill profile has been updated.</p>
      <button onClick={onClose}
        className="w-full py-3.5 bg-[#1a3a8f] text-white font-black rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer text-sm"
        style={{ fontFamily:"Nunito, sans-serif" }}>
        Back to my library
      </button>
    </div>
  );
}

// ── MAIN MODAL ───────────────────────────────────────────────
export default function LogSongModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [song, setSong] = useState(null);
  const [skills, setSkills] = useState([]);

  const handleSelect = (s) => { setSong(s); setStep(2); };
  const handleConfirm = (sk) => { setSkills(sk); setStep(3); };
  const handleSave = ({ rating, progress, notes }) => {
    const newSong = {
      id: Date.now(),
      title: song.trackName,
      artist: song.artistName,
      skills,
      rating,
      progress,
      notes,
      date: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric" }),
      artworkUrl: song.artworkUrl100?.replace("100x100bb","400x400bb"),
    };
    onAdd(newSong);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

        {/* Header */}
        {step < 4 && (
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button onClick={() => setStep(s => s-1)} className="w-8 h-8 rounded-xl bg-[#f0f4ff] border-none cursor-pointer flex items-center justify-center text-[#6b7a9e] hover:bg-[#e8eeff] transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {/* Step dots */}
              <div className="flex gap-1.5 ml-1">
                {[1,2,3].map((n) => (
                  <div key={n} className={"rounded-full transition-all duration-300 " + (n === step ? "w-5 h-2 bg-[#1a3a8f]" : n < step ? "w-2 h-2 bg-green-500" : "w-2 h-2 bg-[#dde4f5]")} />
                ))}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f0f4ff] border-none cursor-pointer flex items-center justify-center text-[#6b7a9e] hover:bg-[#e8eeff] transition-colors text-sm">✕</button>
          </div>
        )}

        {/* Steps */}
        {step === 1 && <StepSearch onSelect={handleSelect} />}
        {step === 2 && song && <StepConfirm song={song} onBack={() => setStep(1)} onNext={handleConfirm} />}
        {step === 3 && song && <StepRate song={song} skills={skills} onBack={() => setStep(2)} onSave={handleSave} />}
        {step === 4 && song && <StepSuccess song={song} onClose={onClose} />}
      </div>
    </div>
  );
}