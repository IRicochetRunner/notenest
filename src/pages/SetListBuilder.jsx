import { useState, useMemo } from "react";

// ── ICONS ────────────────────────────────────────────────────
function MusicIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
}
function PlusIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function TrashIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function CheckIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ListIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function CalendarIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ClockIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function MapPinIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function ChevronRight({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function ChevronLeft({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
}

// ── CONSTANTS ─────────────────────────────────────────────────
const KEYS = ["A","A#/Bb","B","C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab"];
const KEY_COLORS = { "A":"bg-red-100 text-red-700","A#/Bb":"bg-orange-100 text-orange-700","B":"bg-amber-100 text-amber-700","C":"bg-yellow-100 text-yellow-700","C#/Db":"bg-lime-100 text-lime-700","D":"bg-green-100 text-green-700","D#/Eb":"bg-teal-100 text-teal-700","E":"bg-cyan-100 text-cyan-700","F":"bg-blue-100 text-blue-700","F#/Gb":"bg-indigo-100 text-indigo-700","G":"bg-violet-100 text-violet-700","G#/Ab":"bg-purple-100 text-purple-700" };
const KEY_COLORS_DARK = { "A":"bg-red-900/40 text-red-300","A#/Bb":"bg-orange-900/40 text-orange-300","B":"bg-amber-900/40 text-amber-300","C":"bg-yellow-900/40 text-yellow-300","C#/Db":"bg-lime-900/40 text-lime-300","D":"bg-green-900/40 text-green-300","D#/Eb":"bg-teal-900/40 text-teal-300","E":"bg-cyan-900/40 text-cyan-300","F":"bg-blue-900/40 text-blue-300","F#/Gb":"bg-indigo-900/40 text-indigo-300","G":"bg-violet-900/40 text-violet-300","G#/Ab":"bg-purple-900/40 text-purple-300" };

function fmtDuration(mins) {
  if (!mins) return "--:--";
  return Math.floor(mins) + ":" + String(Math.round((mins % 1) * 60)).padStart(2,"0");
}
function totalDuration(songs) {
  const t = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const h = Math.floor(t / 60);
  const m = Math.floor(t % 60);
  const sec = Math.round((t % 1) * 60);
  if (h > 0) return h + "h " + m + "m";
  return m + "m " + sec + "s";
}

// ── ALBUM ART ─────────────────────────────────────────────────
function AlbumThumb({ title, artist }) {
  const [art, setArt] = useState(null);
  useState(() => {
    fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(title + " " + artist) + "&entity=song&limit=1")
      .then(r => r.json()).then(d => { if (d.results?.[0]) setArt(d.results[0].artworkUrl100.replace("100x100bb","200x200bb")); }).catch(()=>{});
  });
  return (
    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#e8eeff] flex-shrink-0">
      {art ? <img src={art} alt={title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><MusicIcon className="w-4 h-4 text-[#1a3a8f]/30"/></div>}
    </div>
  );
}

// ── SONG ROW IN SETLIST ───────────────────────────────────────
function SetlistSongRow({ song, index, total, onRemove, onMoveUp, onMoveDown, onUpdate, dark }) {
  const [editKey, setEditKey] = useState(false);
  const [editDur, setEditDur] = useState(false);
  const [durInput, setDurInput] = useState(song.duration ? String(song.duration) : "");

  const kc = dark ? (KEY_COLORS_DARK[song.key] || "bg-white/10 text-white/60") : (KEY_COLORS[song.key] || "bg-[#e8eeff] text-[#1a3a8f]");

  const saveDuration = () => {
    const v = parseFloat(durInput);
    if (!isNaN(v) && v > 0) onUpdate({ ...song, duration: v });
    setEditDur(false);
  };

  return (
    <div className={"flex items-center gap-3 p-3 rounded-2xl border transition-all group " + (dark ? "border-white/10 hover:bg-white/5" : "border-[#dde4f5] hover:bg-[#f8f9ff]")}>
      {/* Number */}
      <div className={"text-xs font-black w-5 text-center flex-shrink-0 " + (dark ? "text-white/30" : "text-[#6b7a9e]")}>{index + 1}</div>

      {/* Up/down */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button onClick={onMoveUp} disabled={index===0} className={"w-5 h-4 flex items-center justify-center rounded border-none cursor-pointer text-[10px] transition-colors " + (index===0 ? "opacity-20 cursor-not-allowed bg-transparent" : (dark ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-[#e8eeff] text-[#1a3a8f] hover:bg-[#dde4f5]"))}>▲</button>
        <button onClick={onMoveDown} disabled={index===total-1} className={"w-5 h-4 flex items-center justify-center rounded border-none cursor-pointer text-[10px] transition-colors " + (index===total-1 ? "opacity-20 cursor-not-allowed bg-transparent" : (dark ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-[#e8eeff] text-[#1a3a8f] hover:bg-[#dde4f5]"))}>▼</button>
      </div>

      {/* Art */}
      <AlbumThumb title={song.title} artist={song.artist} />

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <div className={"font-bold text-sm truncate " + (dark ? "text-white" : "text-[#0d1b3e]")}>{song.title}</div>
        <div className={"text-xs truncate " + (dark ? "text-white/50" : "text-[#6b7a9e]")}>{song.artist}</div>
      </div>

      {/* Key badge */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setEditKey(v => !v)}
          className={"text-xs font-black px-2.5 py-1.5 rounded-xl border-none cursor-pointer transition-all " + kc}>
          {song.key || "Key?"}
        </button>
        {editKey && (
          <div className={"absolute top-full right-0 mt-1 p-2 rounded-2xl border shadow-xl z-20 grid grid-cols-4 gap-1 w-44 " + (dark ? "bg-[#0d1b3e] border-white/10" : "bg-white border-[#dde4f5]")}>
            {KEYS.map(k => (
              <button key={k} onClick={() => { onUpdate({...song, key: k}); setEditKey(false); }}
                className={"text-[10px] font-bold px-1.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors " + (song.key===k ? "bg-[#1a3a8f] text-white" : (dark ? "bg-white/10 text-white/70 hover:bg-white/20" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff]"))}>
                {k}
              </button>
            ))}
            <button onClick={() => { onUpdate({...song, key: null}); setEditKey(false); }}
              className={"col-span-4 text-[10px] font-bold px-2 py-1.5 rounded-lg border-none cursor-pointer mt-1 " + (dark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-[#f8f8f8] text-[#aaa] hover:bg-[#f0f4ff]")}>
              Clear key
            </button>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="flex-shrink-0 w-16 text-center">
        {editDur ? (
          <input autoFocus type="number" value={durInput} min="0.5" max="30" step="0.5"
            onChange={e => setDurInput(e.target.value)}
            onBlur={saveDuration}
            onKeyDown={e => { if (e.key==="Enter") saveDuration(); if (e.key==="Escape") setEditDur(false); }}
            className={"w-full text-center text-xs font-bold border rounded-lg px-1 py-1 outline-none " + (dark ? "bg-white/10 border-white/20 text-white" : "bg-[#f0f4ff] border-[#4a72e8] text-[#0d1b3e]")}
            style={{ fontFamily:"Plus Jakarta Sans, sans-serif" }} />
        ) : (
          <button onClick={() => { setDurInput(song.duration ? String(song.duration) : ""); setEditDur(true); }}
            className={"text-xs font-bold flex items-center gap-1 px-2 py-1.5 rounded-xl border-none cursor-pointer w-full justify-center transition-colors " + (dark ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff]")}>
            <ClockIcon className="w-3 h-3" />
            {song.duration ? fmtDuration(song.duration) : "--:--"}
          </button>
        )}
      </div>

      {/* Remove */}
      <button onClick={onRemove} className={"w-7 h-7 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 " + (dark ? "bg-white/10 text-white/50 hover:bg-rose-500/30 hover:text-rose-300" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-rose-50 hover:text-rose-500")}>
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── SONG PICKER MODAL ────────────────────────────────────────
function SongPickerModal({ songs, existingIds, onAdd, onClose, dark }) {
  const [search, setSearch] = useState("");
  const filtered = songs.filter(s => !existingIds.includes(s.id) && (s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={"rounded-3xl w-full max-w-md shadow-2xl overflow-hidden " + (dark ? "bg-[#0d1b3e] border border-white/10" : "bg-white")}>
        <div className={"p-5 border-b " + (dark ? "border-white/10" : "border-[#dde4f5]")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={"font-black text-lg " + (dark ? "text-white" : "text-[#0d1b3e]")} style={{fontFamily:"Nunito, sans-serif"}}>Add song to setlist</h3>
            <button onClick={onClose} className={"w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer text-sm " + (dark ? "bg-white/10 text-white/60" : "bg-[#f0f4ff] text-[#6b7a9e]")}>x</button>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your library..." autoFocus
            className={"w-full px-4 py-2.5 border-[1.5px] rounded-xl text-sm outline-none " + (dark ? "bg-white/10 border-white/20 text-white placeholder:text-white/30" : "bg-[#f0f4ff] border-[#dde4f5] text-[#0d1b3e]")}
            style={{fontFamily:"Plus Jakarta Sans, sans-serif"}} />
        </div>
        <div className="overflow-y-auto max-h-80 p-3 flex flex-col gap-1">
          {filtered.length===0 && <div className={"text-sm text-center py-8 " + (dark ? "text-white/40" : "text-[#6b7a9e]")}>No songs to add</div>}
          {filtered.map(s => (
            <button key={s.id} onClick={() => onAdd(s)}
              className={"flex items-center gap-3 p-3 rounded-xl text-left w-full border-none cursor-pointer transition-all " + (dark ? "bg-transparent hover:bg-white/10" : "bg-transparent hover:bg-[#f0f4ff]")}>
              <AlbumThumb title={s.title} artist={s.artist} />
              <div className="flex-1 min-w-0">
                <div className={"font-bold text-sm truncate " + (dark ? "text-white" : "text-[#0d1b3e]")}>{s.title}</div>
                <div className={"text-xs " + (dark ? "text-white/50" : "text-[#6b7a9e]")}>{s.artist}</div>
              </div>
              <PlusIcon className={"w-4 h-4 flex-shrink-0 " + (dark ? "text-white/40" : "text-[#6b7a9e]")} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── GIG MODAL ────────────────────────────────────────────────
function GigModal({ gig, onSave, onClose, dark }) {
  const [name, setName] = useState(gig?.name || "");
  const [venue, setVenue] = useState(gig?.venue || "");
  const [date, setDate] = useState(gig?.date || "");
  const [notes, setNotes] = useState(gig?.notes || "");

  const inputCls = "w-full px-4 py-3 border-[1.5px] rounded-2xl text-sm outline-none transition-all " + (dark ? "bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40" : "bg-[#f0f4ff] border-[#dde4f5] text-[#0d1b3e] focus:border-[#4a72e8] focus:ring-4 focus:ring-[#4a72e8]/10");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={"rounded-3xl w-full max-w-md shadow-2xl overflow-hidden " + (dark ? "bg-[#0d1b3e] border border-white/10" : "bg-white")}>
        <div className={"flex items-center justify-between p-6 border-b " + (dark ? "border-white/10" : "border-[#dde4f5]")}>
          <h3 className={"font-black text-xl " + (dark ? "text-white" : "text-[#0d1b3e]")} style={{fontFamily:"Nunito, sans-serif"}}>{gig ? "Edit gig" : "New gig"}</h3>
          <button onClick={onClose} className={"w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer text-sm " + (dark ? "bg-white/10 text-white/60" : "bg-[#f0f4ff] text-[#6b7a9e]")}>x</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className={"block text-xs font-bold uppercase tracking-wider mb-1.5 " + (dark ? "text-white/50" : "text-[#6b7a9e]")}>Gig name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Open mic at The Rusty Nail..." className={inputCls} style={{fontFamily:"Plus Jakarta Sans, sans-serif"}} />
          </div>
          <div>
            <label className={"block text-xs font-bold uppercase tracking-wider mb-1.5 " + (dark ? "text-white/50" : "text-[#6b7a9e]")}>Venue</label>
            <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Venue name or address..." className={inputCls} style={{fontFamily:"Plus Jakarta Sans, sans-serif"}} />
          </div>
          <div>
            <label className={"block text-xs font-bold uppercase tracking-wider mb-1.5 " + (dark ? "text-white/50" : "text-[#6b7a9e]")}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} style={{fontFamily:"Plus Jakarta Sans, sans-serif"}} />
          </div>
          <div>
            <label className={"block text-xs font-bold uppercase tracking-wider mb-1.5 " + (dark ? "text-white/50" : "text-[#6b7a9e]")}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Set length, sound check time, anything to remember..." rows={3}
              className={inputCls + " resize-none leading-relaxed"} style={{fontFamily:"Plus Jakarta Sans, sans-serif"}} />
          </div>
          <button onClick={() => onSave({ ...gig, name: name || "Unnamed Gig", venue, date, notes, id: gig?.id || Date.now() })}
            disabled={!name.trim()}
            className={"w-full py-3.5 font-black rounded-2xl border-none transition-all text-sm " + (name.trim() ? "bg-[#1a3a8f] text-white shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 cursor-pointer" : "bg-[#dde4f5] text-[#6b7a9e] cursor-not-allowed")}
            style={{fontFamily:"Nunito, sans-serif"}}>
            {gig ? "Save changes" : "Create gig"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETLIST PANEL ─────────────────────────────────────────────
function SetlistPanel({ setlist, allSongs, onUpdate, onDelete, dark }) {
  const [showPicker, setShowPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(setlist.name);
  const [saved, setSaved] = useState(false);

  const text = dark ? "text-white" : "text-[#0d1b3e]";
  const muted = dark ? "text-white/50" : "text-[#6b7a9e]";
  const border = dark ? "border-white/10" : "border-[#dde4f5]";

  const addSong = async (song) => {
    setShowPicker(false);
    let duration = null;
    try {
      const res = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(song.title + " " + song.artist) + "&entity=song&limit=1");
      const data = await res.json();
      if (data.results?.[0]?.trackTimeMillis) {
        duration = parseFloat((data.results[0].trackTimeMillis / 60000).toFixed(2));
      }
    } catch(e) {}
    onUpdate({ ...setlist, songs: [...setlist.songs, { ...song, key: null, duration }] });
  };
  const removeSong = (id) => onUpdate({ ...setlist, songs: setlist.songs.filter(s => s.id !== id) });
  const moveSong = (idx, dir) => {
    const arr = [...setlist.songs];
    const swap = idx + dir;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    onUpdate({ ...setlist, songs: arr });
  };
  const updateSong = (updated) => onUpdate({ ...setlist, songs: setlist.songs.map(s => s.id === updated.id ? updated : s) });
  const saveName = () => { if (nameInput.trim()) onUpdate({ ...setlist, name: nameInput.trim() }); setEditingName(false); };
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const hasDurations = setlist.songs.some(s => s.duration);
  const total = totalDuration(setlist.songs);

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter") saveName(); if (e.key==="Escape") setEditingName(false); }}
                className={"font-black text-xl border-b-2 border-[#4a72e8] outline-none bg-transparent pb-0.5 " + text}
                style={{fontFamily:"Nunito, sans-serif", width:"200px"}} />
              <button onClick={saveName} className="w-7 h-7 bg-[#1a3a8f] rounded-xl flex items-center justify-center border-none cursor-pointer">
                <CheckIcon className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className={"font-black text-xl " + text} style={{fontFamily:"Nunito, sans-serif"}}>{setlist.name}</h3>
              <button onClick={() => { setNameInput(setlist.name); setEditingName(true); }}
                className={"text-xs font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer " + (dark ? "bg-white/10 text-white/50 hover:bg-white/20" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff]")}>
                Rename
              </button>
            </div>
          )}
          <span className={"text-sm " + muted}>{setlist.songs.length} song{setlist.songs.length!==1?"s":""}{hasDurations ? " · " + total : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPicker(true)}
            className={"flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border-none cursor-pointer transition-all " + (dark ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff]")}>
            <PlusIcon className="w-3.5 h-3.5" /> Add song
          </button>
          <button onClick={() => onDelete(setlist.id)}
            className={"flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border-none cursor-pointer transition-all " + (dark ? "bg-white/10 text-white/50 hover:bg-rose-500/20 hover:text-rose-300" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-rose-50 hover:text-rose-500")}>
            <TrashIcon className="w-3.5 h-3.5" /> Delete
          </button>
          <button onClick={save}
            className={"flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl border-none cursor-pointer transition-all " + (saved ? "bg-green-500 text-white" : "bg-[#1a3a8f] text-white hover:-translate-y-0.5 shadow-[0_3px_0_#0f2460]")}
            style={{fontFamily:"Nunito, sans-serif"}}>
            {saved ? <><CheckIcon className="w-3.5 h-3.5"/> Saved</> : "Save"}
          </button>
        </div>
      </div>

      {/* Column headers */}
      {setlist.songs.length > 0 && (
        <div className={"flex items-center gap-3 px-3 pb-2 mb-1 border-b text-xs font-bold uppercase tracking-wider " + muted + " " + border}>
          <div className="w-5 flex-shrink-0">#</div>
          <div className="w-5 flex-shrink-0" />
          <div className="w-10 flex-shrink-0" />
          <div className="flex-1">Song</div>
          <div className="w-16 text-center flex-shrink-0">Key</div>
          <div className="w-16 text-center flex-shrink-0">Duration</div>
          <div className="w-7 flex-shrink-0" />
        </div>
      )}

      {/* Songs */}
      {setlist.songs.length === 0 ? (
        <div className={"rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-16 text-center " + (dark ? "border-white/10" : "border-[#dde4f5]")}>
          <div className={"w-12 h-12 rounded-2xl flex items-center justify-center mb-3 " + (dark ? "bg-white/10" : "bg-[#e8eeff]")}>
            <ListIcon className={"w-6 h-6 " + (dark ? "text-white/30" : "text-[#1a3a8f]/30")} />
          </div>
          <div className={"font-black text-lg mb-1 " + text} style={{fontFamily:"Nunito, sans-serif"}}>No songs yet</div>
          <div className={"text-sm mb-5 " + muted}>Add songs from your library</div>
          <button onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 bg-[#1a3a8f] text-white font-black px-5 py-2.5 rounded-xl border-none cursor-pointer shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all text-sm"
            style={{fontFamily:"Nunito, sans-serif"}}>
            <PlusIcon className="w-4 h-4"/> Add songs
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {setlist.songs.map((s, i) => (
            <SetlistSongRow key={s.id} song={s} index={i} total={setlist.songs.length}
              onRemove={() => removeSong(s.id)}
              onMoveUp={() => moveSong(i, -1)}
              onMoveDown={() => moveSong(i, 1)}
              onUpdate={updateSong}
              dark={dark} />
          ))}
          <button onClick={() => setShowPicker(true)}
            className={"flex items-center gap-2 p-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-sm font-bold justify-center mt-1 bg-transparent " + (dark ? "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50" : "border-[#dde4f5] text-[#6b7a9e] hover:border-[#4a72e8] hover:text-[#1a3a8f]")}>
            <PlusIcon className="w-4 h-4"/> Add another song
          </button>
        </div>
      )}
      {showPicker && <SongPickerModal songs={allSongs} existingIds={setlist.songs.map(s=>s.id)} onAdd={addSong} onClose={() => setShowPicker(false)} dark={dark} />}
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
export default function SetlistBuilder({ songs, dark }) {
  const [gigs, setGigs] = useState([
    { id: 1, name: "Open Mic Night", venue: "The Rusty Nail", date: "2026-04-15", notes: "45 min set", setlists: [{ id: 101, name: "Main Set", songs: [] }] }
  ]);
  const [activeGigId, setActiveGigId] = useState(1);
  const [activeSetlistId, setActiveSetlistId] = useState(101);
  const [showGigModal, setShowGigModal] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [view, setView] = useState("gigs"); // "gigs" | "setlist"

  const text = dark ? "text-white" : "text-[#0d1b3e]";
  const muted = dark ? "text-white/50" : "text-[#6b7a9e]";
  const cardBg = dark ? "bg-white/5 border-white/10" : "bg-white border-[#dde4f5]";
  const border = dark ? "border-white/10" : "border-[#dde4f5]";

  const activeGig = gigs.find(g => g.id === activeGigId);
  const activeSetlist = activeGig?.setlists.find(s => s.id === activeSetlistId);

  const saveGig = (gig) => {
    if (gigs.find(g => g.id === gig.id)) {
      setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, ...gig } : g));
    } else {
      const newSetlist = { id: Date.now() + 1, name: "Main Set", songs: [] };
      setGigs(prev => [...prev, { ...gig, setlists: [newSetlist] }]);
      setActiveGigId(gig.id);
      setActiveSetlistId(newSetlist.id);
      setView("setlist");
    }
    setShowGigModal(false);
    setEditingGig(null);
  };

  const deleteGig = (id) => {
    const remaining = gigs.filter(g => g.id !== id);
    setGigs(remaining);
    if (activeGigId === id) { setActiveGigId(remaining[0]?.id || null); setView("gigs"); }
  };

  const addSetlistToGig = (gigId) => {
    const newSl = { id: Date.now(), name: "New Set", songs: [] };
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, setlists: [...g.setlists, newSl] } : g));
    setActiveSetlistId(newSl.id);
  };

  const updateSetlist = (gigId, updated) => {
    setGigs(prev => prev.map(g => g.id === gigId ? { ...g, setlists: g.setlists.map(s => s.id === updated.id ? updated : s) } : g));
  };

  const deleteSetlist = (gigId, slId) => {
    setGigs(prev => prev.map(g => {
      if (g.id !== gigId) return g;
      const remaining = g.setlists.filter(s => s.id !== slId);
      return { ...g, setlists: remaining };
    }));
    const gig = gigs.find(g => g.id === gigId);
    const remaining = gig?.setlists.filter(s => s.id !== slId) || [];
    setActiveSetlistId(remaining[0]?.id || null);
  };

  const openGig = (gig) => {
    setActiveGigId(gig.id);
    setActiveSetlistId(gig.setlists[0]?.id || null);
    setView("setlist");
  };

  // ── GIG LIST VIEW ──────────────────────────────────────────
  if (view === "gigs") return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={"font-black text-2xl " + text} style={{fontFamily:"Nunito, sans-serif"}}>Gigs</h2>
          <p className={"text-sm " + muted}>Build setlists for your upcoming shows</p>
        </div>
        <button onClick={() => { setEditingGig(null); setShowGigModal(true); }}
          className="flex items-center gap-2 bg-[#1a3a8f] text-white font-black px-5 py-2.5 rounded-xl border-none cursor-pointer shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all text-sm"
          style={{fontFamily:"Nunito, sans-serif"}}>
          <PlusIcon className="w-4 h-4"/> New gig
        </button>
      </div>

      {gigs.length === 0 ? (
        <div className={"rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-24 text-center " + (dark ? "border-white/10" : "border-[#dde4f5]")}>
          <div className={"w-14 h-14 rounded-2xl flex items-center justify-center mb-4 " + (dark ? "bg-white/10" : "bg-[#e8eeff]")}>
            <CalendarIcon className={"w-7 h-7 " + (dark ? "text-white/30" : "text-[#1a3a8f]/30")} />
          </div>
          <div className={"font-black text-xl mb-2 " + text} style={{fontFamily:"Nunito, sans-serif"}}>No gigs yet</div>
          <div className={"text-sm mb-6 " + muted}>Create a gig to start building setlists</div>
          <button onClick={() => setShowGigModal(true)}
            className="bg-[#1a3a8f] text-white font-black px-6 py-3 rounded-xl border-none cursor-pointer shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all"
            style={{fontFamily:"Nunito, sans-serif"}}>
            Create your first gig
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gigs.map(gig => {
            const totalSongs = gig.setlists.reduce((a, s) => a + s.songs.length, 0);
            const hasDur = gig.setlists.some(sl => sl.songs.some(s => s.duration));
            const dur = hasDur ? totalDuration(gig.setlists.flatMap(sl => sl.songs)) : null;
            const isUpcoming = gig.date && new Date(gig.date) >= new Date();
            return (
              <div key={gig.id} className={"rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer " + cardBg} onClick={() => openGig(gig)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className={"font-black text-lg leading-tight mb-0.5 " + text} style={{fontFamily:"Nunito, sans-serif"}}>{gig.name}</div>
                    {gig.venue && <div className={"text-xs flex items-center gap-1 " + muted}><MapPinIcon className="w-3 h-3"/>{gig.venue}</div>}
                  </div>
                  {isUpcoming && <span className="text-xs font-bold bg-[#e8eeff] text-[#1a3a8f] px-2.5 py-1 rounded-full flex-shrink-0 ml-2">Upcoming</span>}
                </div>
                {gig.date && (
                  <div className={"text-xs flex items-center gap-1.5 mb-3 " + muted}>
                    <CalendarIcon className="w-3.5 h-3.5"/>
                    {new Date(gig.date + "T00:00:00").toLocaleDateString("en-US", {weekday:"short", month:"short", day:"numeric", year:"numeric"})}
                  </div>
                )}
                <div className={"flex items-center gap-4 text-xs mb-3 " + muted}>
                  <span>{gig.setlists.length} setlist{gig.setlists.length!==1?"s":""}</span>
                  <span>{totalSongs} song{totalSongs!==1?"s":""}</span>
                  {dur && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/>{dur}</span>}
                </div>
                {gig.notes && <p className={"text-xs italic line-clamp-2 " + muted}>"{gig.notes}"</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{borderColor: dark ? "rgba(255,255,255,0.1)" : "#dde4f5"}}>
                  <div className="flex gap-1.5">
                    {gig.setlists.map(sl => (
                      <span key={sl.id} className={"text-[10px] font-bold px-2 py-1 rounded-lg " + (dark ? "bg-white/10 text-white/50" : "bg-[#f0f4ff] text-[#6b7a9e]")}>{sl.name} ({sl.songs.length})</span>
                    ))}
                  </div>
                  <div className={"flex items-center gap-1 text-xs font-bold " + (dark ? "text-white/40" : "text-[#6b7a9e]")}>
                    Open <ChevronRight className="w-3.5 h-3.5"/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showGigModal && <GigModal gig={editingGig} onSave={saveGig} onClose={() => { setShowGigModal(false); setEditingGig(null); }} dark={dark} />}
    </div>
  );

  // ── SETLIST VIEW ───────────────────────────────────────────
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => setView("gigs")} className={"flex items-center gap-1.5 text-sm font-bold border-none cursor-pointer bg-transparent transition-colors " + muted + " hover:" + (dark ? "text-white" : "text-[#1a3a8f]")}>
          <ChevronLeft className="w-4 h-4"/> Gigs
        </button>
        <span className={muted}>/</span>
        <span className={"text-sm font-bold " + text}>{activeGig?.name}</span>
        {activeGig?.date && (
          <span className={"text-xs flex items-center gap-1 " + muted}>
            <CalendarIcon className="w-3 h-3"/>
            {new Date(activeGig.date + "T00:00:00").toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { setEditingGig(activeGig); setShowGigModal(true); }}
            className={"text-xs font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer " + (dark ? "bg-white/10 text-white/50 hover:bg-white/20" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff]")}>
            Edit gig
          </button>
          <button onClick={() => deleteGig(activeGigId)}
            className={"text-xs font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer " + (dark ? "bg-white/10 text-white/50 hover:bg-rose-500/20 hover:text-rose-300" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-rose-50 hover:text-rose-500")}>
            Delete gig
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Setlist tabs sidebar */}
        <div className={"w-48 flex-shrink-0 rounded-2xl border p-2 flex flex-col gap-1 h-fit " + (dark ? "bg-white/5 border-white/10" : "bg-white border-[#dde4f5]")}>
          <div className={"text-xs font-bold tracking-widest uppercase mb-1 px-2 " + muted}>Setlists</div>
          {activeGig?.setlists.map(sl => (
            <button key={sl.id} onClick={() => setActiveSetlistId(sl.id)}
              className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-left w-full border-none cursor-pointer transition-all " + (sl.id === activeSetlistId ? "bg-[#1a3a8f] text-white" : (dark ? "bg-transparent text-white/60 hover:bg-white/10" : "bg-transparent text-[#0d1b3e] hover:bg-[#f0f4ff]"))}>
              <ListIcon className="w-3.5 h-3.5 flex-shrink-0"/>
              <span className="flex-1 text-sm font-bold truncate">{sl.name}</span>
              <span className={"text-xs " + (sl.id === activeSetlistId ? "text-white/60" : muted)}>{sl.songs.length}</span>
            </button>
          ))}
          <button onClick={() => addSetlistToGig(activeGigId)}
            className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-left w-full border-none cursor-pointer transition-all mt-1 " + (dark ? "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60" : "bg-[#f0f4ff] text-[#6b7a9e] hover:bg-[#e8eeff] hover:text-[#1a3a8f]")}>
            <PlusIcon className="w-3.5 h-3.5"/>
            <span className="text-sm font-bold">Add set</span>
          </button>
        </div>

        {/* Active setlist */}
        {activeSetlist ? (
          <SetlistPanel
            setlist={activeSetlist}
            allSongs={songs}
            onUpdate={(updated) => updateSetlist(activeGigId, updated)}
            onDelete={(id) => deleteSetlist(activeGigId, id)}
            dark={dark} />
        ) : (
          <div className={"flex-1 flex items-center justify-center text-sm " + muted}>Select or create a set</div>
        )}
      </div>

      {showGigModal && <GigModal gig={editingGig} onSave={saveGig} onClose={() => { setShowGigModal(false); setEditingGig(null); }} dark={dark} />}
    </div>
  );
}