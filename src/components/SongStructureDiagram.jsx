// src/components/SongStructureDiagram.jsx
// Usage:
//   import SongStructureDiagram from "../components/SongStructureDiagram";
//   <SongStructureDiagram song={songObj} onClose={() => setOpen(false)} onSave={(s) => updateSong(s)} />

import { useState, useEffect, useRef } from "react";

// ── album art cache (same pattern as Dashboard) ───────────────
const artCache = {};
function useAlbumArt(query) {
  const [art, setArt] = useState(() => artCache[query] || null);
  useEffect(() => {
    if (!query || artCache[query]) { if (artCache[query]) setArt(artCache[query]); return; }
    const t = setTimeout(() => {
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1&media=music`, { mode:"cors" })
        .then(r => r.json())
        .then(d => {
          if (d.results?.[0]?.artworkUrl100) {
            const url = d.results[0].artworkUrl100.replace("100x100bb","400x400bb");
            artCache[query] = url;
            setArt(url);
          }
        }).catch(() => {});
    }, 100);
    return () => clearTimeout(t);
  }, [query]);
  return art;
}

// ── helpers ──────────────────────────────────────────────────
const mcol   = (m) => m >= 85 ? "#22c55e" : m >= 60 ? "#f59e0b" : "#ef4444";
const mlabel = (m) => m >= 85 ? "Solid" : m >= 60 ? "Learning" : "Needs Work";
const mbg    = (m) => m >= 85 ? "bg-green-100 text-green-700" : m >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";

// Part colours — matches your existing PART_COLORS palette
const PART_HEX = {
  Intro:        "#8b5cf6",
  Verse:        "#3b82f6",
  "Pre-chorus": "#06b6d4",
  Chorus:       "#1a3a8f",
  Bridge:       "#f59e0b",
  Outro:        "#ef4444",
  Solo:         "#10b981",
  Riff:         "#ec4899",
};
const getPartColor = (label) => {
  // exact match first
  if (PART_HEX[label]) return PART_HEX[label];
  // partial match (e.g. "Verse 1", "Solo II")
  const key = Object.keys(PART_HEX).find(k => label.toLowerCase().startsWith(k.toLowerCase()));
  return key ? PART_HEX[key] : "#4a72e8";
};

// Build parts array from song.structure if available, else song.parts
function buildParts(song) {
  if (song.parts && Array.isArray(song.parts) && song.parts.length > 0 && typeof song.parts[0] === "object") {
    return song.parts; // already rich objects from SongStructureDiagram format
  }
  // song.parts is string[] from your Dashboard — convert using structure
  const structure = song.structure || [];
  const learnedSet = new Set(song.parts || []);
  if (structure.length > 0) {
    return structure.map((seg, i) => ({
      id: seg.id || i,
      label: seg.type,
      bars: 8,
      color: getPartColor(seg.type),
      mastery: learnedSet.has(seg.type) ? 85 : 30,
      notes: "",
    }));
  }
  // fallback: just use the parts string array
  return (song.parts || []).map((p, i) => ({
    id: i,
    label: p,
    bars: 8,
    color: getPartColor(p),
    mastery: 85,
    notes: "",
  }));
}

// ── Main component ────────────────────────────────────────────
export default function SongStructureDiagram({ song, onClose, onSave }) {
  const [parts, setParts]       = useState(() => buildParts(song));
  const [activeId, setActive]   = useState(null);
  const [editingId, setEditing] = useState(null);
  const [draft, setDraft]       = useState("");
  const [ready, setReady]       = useState(false);
  const [imgErr, setImgErr]     = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const fetchedArt              = useAlbumArt(song.title + " " + song.artist);
  const [tab, setTab]           = useState("map");
  const backdropRef             = useRef();
  const textareaRef             = useRef();
  const renameRef               = useRef();

  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") { editingId ? stopEdit() : onClose?.(); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [editingId]);
  useEffect(() => { if (editingId && textareaRef.current) textareaRef.current.focus(); }, [editingId]);
  useEffect(() => { if (renamingId && renameRef.current) renameRef.current.focus(); }, [renamingId]);

  const activePart = parts.find(p => p.id === activeId);
  const totalBars  = parts.reduce((a, p) => a + (p.bars || 8), 0);
  const avg        = Math.round(parts.reduce((a, p) => a + p.mastery, 0) / parts.length);

  function startEdit(part, e) {
    e?.stopPropagation();
    setEditing(part.id);
    setDraft(part.notes || "");
  }
  function stopEdit(save = true) {
    if (save) setParts(prev => prev.map(p => p.id === editingId ? { ...p, notes: draft.trim() } : p));
    setEditing(null);
  }
  function updateMastery(id, val) {
    setParts(prev => prev.map(p => p.id === id ? { ...p, mastery: val } : p));
  }
  function deleteSection(id, e) {
    e.stopPropagation();
    setParts(prev => prev.filter(p => p.id !== id));
    if (activeId === id) setActive(null);
  }
  function addSection(label) {
    const id = Date.now();
    setParts(prev => [...prev, { id, label, bars: 8, color: getPartColor(label), mastery: 0, notes: "" }]);
    setRenamingId(id);
    setRenameDraft(label);
    setTab("list");
  }
  function renameSection(id, newLabel) {
    setParts(prev => prev.map(p => p.id === id ? { ...p, label: newLabel, color: getPartColor(newLabel) } : p));
  }
  // drag-to-reorder
  const dragId = useRef(null);
  function onDragStart(id) { dragId.current = id; }
  function onDrop(targetId) {
    if (!dragId.current || dragId.current === targetId) return;
    setParts(prev => {
      const arr = [...prev];
      const from = arr.findIndex(p => p.id === dragId.current);
      const to   = arr.findIndex(p => p.id === targetId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    dragId.current = null;
  }
  function handleSave() {
    // Convert rich parts objects back to what Dashboard expects:
    // song.parts  = string[] of learned section labels (mastery >= 60 = learned)
    // song.structure = [{id, type}] array for the timeline display
    const partsStrings = parts
      .filter(p => p.mastery >= 60)
      .map(p => p.label);
    const structure = parts.map((p, i) => ({ id: p.id ?? i, type: p.label }));
    onSave?.({ ...song, parts: partsStrings, structure });
    onClose?.();
  }

  const stats = {
    solid:    parts.filter(p => p.mastery >= 85).length,
    learning: parts.filter(p => p.mastery >= 60 && p.mastery < 85).length,
    needs:    parts.filter(p => p.mastery < 60).length,
  };

  return (
    <>
      <style>{`
        @keyframes nn-sd-up    { from{opacity:0;transform:translateY(20px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes nn-sd-in    { from{opacity:0} to{opacity:1} }
        .nn-sd-seg { transition: opacity .15s, transform .15s, filter .15s; cursor:pointer; }
        .nn-sd-seg:hover { transform: scaleY(1.08) !important; filter: brightness(1.12) !important; }
        .nn-sd-card { transition: box-shadow .15s, border-color .15s, background .15s; cursor:pointer; }
        .nn-sd-card:hover { border-color: #4a72e8 !important; box-shadow: 0 2px 12px rgba(26,58,143,.1) !important; }
        .nn-sd-card.active { border-color: #1a3a8f !important; background: #f0f4ff !important; }
        .nn-sd-editbtn { opacity:0; transition: opacity .15s; }
        .nn-sd-card:hover .nn-sd-editbtn { opacity:1; }
        .nn-sd-tab { transition: color .15s, border-color .15s; }
      `}</style>

      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={e => e.target === backdropRef.current && onClose?.()}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(13,27,62,.55)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
          opacity: ready ? 1 : 0,
          transition: "opacity .2s ease",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Modal */}
        <div style={{
          width: "100%", maxWidth: 680, maxHeight: "90vh",
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 80px rgba(13,27,62,.22), 0 0 0 1px rgba(26,58,143,.08)",
          animation: "nn-sd-up .3s cubic-bezier(.34,1.56,.64,1) both",
        }}>

          {/* ── HEADER ── */}
          <div style={{ padding: "20px 24px 0", flexShrink: 0, borderBottom: "1px solid #e8eeff" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>

              {/* Album art */}
              <div style={{
                width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0,
                background: "linear-gradient(135deg,#e8eeff,#dde4f5)",
                boxShadow: "0 4px 16px rgba(26,58,143,.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {(fetchedArt || song.albumArt) && !imgErr
                  ? <img src={fetchedArt || song.albumArt} alt={song.title} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} onError={() => setImgErr(true)} />
                  : <span style={{ fontSize: 26 }}>🎵</span>
                }
              </div>

              {/* Song info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0d1b3e", fontFamily: "Nunito, sans-serif", letterSpacing: "-.2px" }}>
                    {song.title}
                  </h2>
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em",
                    background: "#e8eeff", color: "#1a3a8f", padding: "2px 8px", borderRadius: 20,
                  }}>Structure</span>
                </div>
                <div style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 10 }}>{song.artist}</div>

                {/* Stat chips */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { label: `${stats.solid} Solid`,    bg: "#dcfce7", color: "#16a34a" },
                    { label: `${stats.learning} Learning`, bg: "#fef3c7", color: "#d97706" },
                    { label: `${stats.needs} Need Work`,   bg: "#fee2e2", color: "#dc2626" },
                  ].map(c => (
                    <span key={c.label} style={{ fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 20 }}>
                      {c.label}
                    </span>
                  ))}
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#e8eeff", color: "#1a3a8f", padding: "3px 10px", borderRadius: 20, marginLeft: "auto" }}>
                    {avg}% avg mastery
                  </span>
                </div>
              </div>

              {/* Close */}
              <button onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e8eeff",
                background: "#f0f4ff", color: "#6b7a9e", cursor: "pointer", fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                transition: "all .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background="#e8eeff"; e.currentTarget.style.color="#1a3a8f"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#f0f4ff"; e.currentTarget.style.color="#6b7a9e"; }}>
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0 }}>
              {[["map","Timeline"], ["list","Sections"]].map(([id, label]) => (
                <button key={id} className="nn-sd-tab" onClick={() => setTab(id)} style={{
                  padding: "10px 20px", fontSize: 13, fontWeight: 700,
                  fontFamily: "Nunito, sans-serif",
                  background: "transparent", border: "none",
                  borderBottom: `2.5px solid ${tab === id ? "#1a3a8f" : "transparent"}`,
                  color: tab === id ? "#1a3a8f" : "#6b7a9e",
                  cursor: "pointer", marginBottom: -1,
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

            {/* ══ TIMELINE TAB ══ */}
            {tab === "map" && (
              <div>
                {/* Big timeline bar */}
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                  Song Map · {parts.length} sections
                </p>
                <div style={{
                  display: "flex", height: 56, borderRadius: 14, overflow: "hidden",
                  gap: 2, background: "#f0f4ff", padding: 3, marginBottom: 4,
                }}>
                  {parts.map(p => {
                    const isActive = activeId === p.id;
                    const isDimmed = activeId && !isActive;
                    return (
                      <div key={p.id} className="nn-sd-seg"
                        onClick={() => setActive(isActive ? null : p.id)}
                        title={`${p.label} · ${p.mastery}%`}
                        style={{
                          flex: p.bars || 8,
                          borderRadius: 10,
                          background: p.color || getPartColor(p.label),
                          opacity: isDimmed ? 0.3 : 1,
                          filter: isActive ? "brightness(1.1)" : "brightness(.9)",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          position: "relative", overflow: "hidden",
                          minWidth: 8,
                        }}>
                        {/* mastery strip at bottom */}
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:"rgba(0,0,0,.15)" }}>
                          <div style={{ height:"100%", width:`${p.mastery}%`, background:"rgba(255,255,255,.6)", borderRadius:2 }}/>
                        </div>
                        {(p.bars || 8) >= 8 && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.95)", textShadow: "0 1px 4px rgba(0,0,0,.3)", fontFamily:"Nunito,sans-serif", pointerEvents:"none", whiteSpace:"nowrap" }}>
                            {p.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 10, color: "#b0baca", marginBottom: 20 }}>Click a section to see details</p>

                {/* Selected section detail */}
                {activePart && (
                  <div style={{
                    background: "#f0f4ff", border: "1.5px solid #dde4f5",
                    borderRadius: 16, padding: "16px 18px", marginBottom: 20,
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background: activePart.color || getPartColor(activePart.label), flexShrink:0 }}/>
                      <span style={{ fontFamily:"Nunito,sans-serif", fontSize:16, fontWeight:900, color:"#0d1b3e" }}>{activePart.label}</span>
                      <span style={{
                          fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                          background: activePart.mastery>=85?"#dcfce7":activePart.mastery>=60?"#fef3c7":"#fee2e2",
                          color: mcol(activePart.mastery),
                        }}>
                        {activePart.mastery}% · {mlabel(activePart.mastery)}
                      </span>
                      <button onClick={() => setActive(null)} style={{ marginLeft:"auto", background:"transparent", border:"none", color:"#b0baca", cursor:"pointer", fontSize:16, lineHeight:1 }}>✕</button>
                    </div>

                    {/* mastery slider */}
                    <div style={{ marginBottom:12 }}>
                      <div style={{ height:6, background:"#dde4f5", borderRadius:3, overflow:"hidden", marginBottom:6 }}>
                        <div style={{ height:"100%", width:`${activePart.mastery}%`, background: mcol(activePart.mastery), borderRadius:3, transition:"width .2s ease" }}/>
                      </div>
                      <input type="range" min="0" max="100" value={activePart.mastery}
                        onChange={e => updateMastery(activePart.id, parseInt(e.target.value))}
                        style={{ width:"100%", accentColor:"#1a3a8f", cursor:"pointer", margin:0 }}/>
                    </div>

                    {/* Note area */}
                    {editingId === activePart.id ? (
                      <div>
                        <textarea ref={textareaRef} value={draft} onChange={e => setDraft(e.target.value)}
                          placeholder="Add a practice note…"
                          rows={3}
                          style={{
                            width:"100%", padding:"10px 12px", borderRadius:10,
                            border:"1.5px solid #4a72e8", background:"#fff",
                            fontSize:13, color:"#0d1b3e", resize:"vertical",
                            fontFamily:"Plus Jakarta Sans,sans-serif", outline:"none",
                            boxSizing:"border-box",
                          }}/>
                        <div style={{ display:"flex", gap:8, marginTop:8 }}>
                          <button onClick={() => stopEdit(true)} style={{
                            padding:"7px 18px", borderRadius:9, fontSize:12, fontWeight:800,
                            background:"#1a3a8f", color:"#fff", border:"none", cursor:"pointer",
                            fontFamily:"Nunito,sans-serif", boxShadow:"0 2px 0 #0f2460",
                          }}>Save note</button>
                          <button onClick={() => stopEdit(false)} style={{
                            padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight:700,
                            background:"#e8eeff", color:"#6b7a9e", border:"none", cursor:"pointer",
                          }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                        <p style={{ flex:1, margin:0, fontSize:13, color: activePart.notes ? "#6b7a9e" : "#b0baca", fontStyle: activePart.notes ? "italic" : "normal", lineHeight:1.6 }}>
                          {activePart.notes || "No notes yet — add a practice tip"}
                        </p>
                        <button onClick={e => startEdit(activePart, e)} style={{
                          flexShrink:0, padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:700,
                          background:"#e8eeff", color:"#1a3a8f", border:"1.5px solid #dde4f5",
                          cursor:"pointer", fontFamily:"Nunito,sans-serif",
                        }}>✏️ Edit</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Mini section chips */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {parts.map(p => (
                    <div key={p.id} onClick={() => setActive(activeId === p.id ? null : p.id)}
                      style={{
                        display:"flex", alignItems:"center", gap:6,
                        padding:"7px 12px", borderRadius:10,
                        background: activeId === p.id ? "#e8eeff" : "#f8f9ff",
                        border: `1.5px solid ${activeId === p.id ? "#4a72e8" : "#e8eeff"}`,
                        cursor:"pointer", transition:"all .15s",
                      }}>
                      <div style={{ width:8, height:8, borderRadius:2, background: p.color || getPartColor(p.label) }}/>
                      <span style={{ fontSize:12, fontWeight:700, color:"#0d1b3e" }}>{p.label}</span>
                      <span style={{ fontSize:11, fontWeight:700, color: mcol(p.mastery) }}>{p.mastery}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ SECTIONS TAB ══ */}
            {tab === "list" && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

                {/* Header row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <p style={{ margin:0, fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:".08em" }}>
                    {parts.length} Section{parts.length!==1?"s":""} · drag to reorder
                  </p>
                  <button onClick={e => { e.stopPropagation(); setShowAdd(a => !a); }} style={{
                    display:"flex", alignItems:"center", gap:5,
                    padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:800,
                    background:"#1a3a8f", color:"#fff", border:"none", cursor:"pointer",
                    fontFamily:"Nunito,sans-serif",
                  }}>+ Add section</button>
                </div>

                {/* Add section panel */}
                {showAdd && (
                  <div style={{
                    background:"#f0f4ff", border:"1.5px solid #dde4f5", borderRadius:14,
                    padding:"14px 16px", marginBottom:4,
                  }}>
                    <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:".08em" }}>Quick add</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                      {["Intro","Verse","Pre-Chorus","Chorus","Bridge","Solo","Outro","Riff","Interlude","Breakdown"].map(preset => (
                        <button key={preset} onClick={() => { addSection(preset); setShowAdd(false); }} style={{
                          padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:700,
                          background: getPartColor(preset)+"22", color: getPartColor(preset),
                          border:`1.5px solid ${getPartColor(preset)}44`, cursor:"pointer",
                          fontFamily:"Nunito,sans-serif", transition:"all .15s",
                        }}>{preset}</button>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <input value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                        onKeyDown={e => { if(e.key==="Enter" && customLabel.trim()){ addSection(customLabel.trim()); setCustomLabel(""); setShowAdd(false); }}}
                        placeholder="Custom name…"
                        style={{
                          flex:1, padding:"7px 12px", borderRadius:8, border:"1.5px solid #dde4f5",
                          fontSize:12, color:"#0d1b3e", outline:"none", fontFamily:"Plus Jakarta Sans,sans-serif",
                          background:"#fff",
                        }}/>
                      <button onClick={() => { if(customLabel.trim()){ addSection(customLabel.trim()); setCustomLabel(""); setShowAdd(false); }}} style={{
                        padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:800,
                        background:"#1a3a8f", color:"#fff", border:"none", cursor:"pointer",
                        fontFamily:"Nunito,sans-serif",
                      }}>Add</button>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {parts.length === 0 && (
                  <div style={{ textAlign:"center", padding:"32px 16px", color:"#b0baca", fontSize:13 }}>
                    No sections yet — hit <strong style={{color:"#1a3a8f"}}>+ Add section</strong> to get started
                  </div>
                )}

                {/* Section cards */}
                {parts.map((p, i) => (
                  <div key={p.id}
                    draggable
                    onDragStart={() => onDragStart(p.id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(p.id)}
                    className={`nn-sd-card${activeId === p.id ? " active" : ""}`}
                    onClick={() => setActive(activeId === p.id ? null : p.id)}
                    style={{
                      background:"#fff", border:"1.5px solid #e8eeff",
                      borderRadius:14, padding:"14px 16px",
                      display:"flex", gap:10, alignItems:"flex-start",
                      cursor:"grab",
                    }}>

                    {/* Drag handle + colour bar */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0, paddingTop:2 }}>
                      <svg viewBox="0 0 10 16" width="10" height="16" fill="#c8d0e0">
                        <circle cx="3" cy="3" r="1.5"/><circle cx="7" cy="3" r="1.5"/>
                        <circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/>
                        <circle cx="3" cy="13" r="1.5"/><circle cx="7" cy="13" r="1.5"/>
                      </svg>
                      <div style={{ width:3, flex:1, borderRadius:4, background: p.color || getPartColor(p.label), minHeight:20 }}/>
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      {/* top row — rename inline */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        {renamingId === p.id ? (
                          <input ref={renameRef} value={renameDraft}
                            onChange={e => setRenameDraft(e.target.value)}
                            onBlur={() => { renameSection(p.id, renameDraft.trim() || p.label); setRenamingId(null); }}
                            onKeyDown={e => { if(e.key==="Enter"){ renameSection(p.id, renameDraft.trim() || p.label); setRenamingId(null); } e.stopPropagation(); }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontFamily:"Nunito,sans-serif", fontSize:14, fontWeight:900, color:"#0d1b3e",
                              border:"none", borderBottom:"2px solid #4a72e8", outline:"none",
                              background:"transparent", width:120, padding:"0 2px",
                            }}/>
                        ) : (
                          <span
                            onClick={e => { e.stopPropagation(); setRenamingId(p.id); setRenameDraft(p.label); }}
                            title="Click to rename"
                            style={{ fontFamily:"Nunito,sans-serif", fontSize:14, fontWeight:900, color:"#0d1b3e", cursor:"text", borderBottom:"1.5px dashed #dde4f5" }}>
                            {p.label}
                          </span>
                        )}
                        <span style={{ fontSize:10, fontWeight:700, background:"#e8eeff", color:"#1a3a8f", padding:"2px 7px", borderRadius:20 }}>#{i+1}</span>
                        <span style={{
                          fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20, marginLeft:"auto",
                          background: p.mastery>=85?"#dcfce7":p.mastery>=60?"#fef3c7":"#fee2e2",
                          color: mcol(p.mastery),
                        }}>{p.mastery}% · {mlabel(p.mastery)}</span>
                        {/* Delete */}
                        <button onClick={e => deleteSection(p.id, e)} title="Remove section" style={{
                          flexShrink:0, width:22, height:22, borderRadius:6, border:"none",
                          background:"#fee2e2", color:"#dc2626", cursor:"pointer", fontSize:12,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          opacity:0, transition:"opacity .15s",
                        }} className="nn-sd-editbtn">✕</button>
                      </div>

                      {/* mastery slider */}
                      <div style={{ marginBottom:10 }}>
                        <div style={{ height:5, background:"#e8eeff", borderRadius:3, overflow:"hidden", marginBottom:5 }}>
                          <div style={{ height:"100%", width:`${p.mastery}%`, background: mcol(p.mastery), borderRadius:3, transition:"width .2s ease" }}/>
                        </div>
                        <input type="range" min="0" max="100" value={p.mastery}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); updateMastery(p.id, parseInt(e.target.value)); }}
                          style={{ width:"100%", accentColor:"#1a3a8f", cursor:"pointer", margin:0 }}/>
                      </div>

                      {/* note / edit */}
                      {editingId === p.id ? (
                        <div onClick={e => e.stopPropagation()}>
                          <textarea ref={textareaRef} value={draft} onChange={e => setDraft(e.target.value)}
                            placeholder="Add a practice note…" rows={2}
                            style={{
                              width:"100%", padding:"8px 10px", borderRadius:8,
                              border:"1.5px solid #4a72e8", background:"#f0f4ff",
                              fontSize:12, color:"#0d1b3e", resize:"none",
                              fontFamily:"Plus Jakarta Sans,sans-serif", outline:"none", boxSizing:"border-box",
                            }}/>
                          <div style={{ display:"flex", gap:6, marginTop:6 }}>
                            <button onClick={e => { e.stopPropagation(); stopEdit(true); }} style={{
                              padding:"5px 14px", borderRadius:8, fontSize:11, fontWeight:800,
                              background:"#1a3a8f", color:"#fff", border:"none", cursor:"pointer",
                              fontFamily:"Nunito,sans-serif",
                            }}>Save</button>
                            <button onClick={e => { e.stopPropagation(); stopEdit(false); }} style={{
                              padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:700,
                              background:"#e8eeff", color:"#6b7a9e", border:"none", cursor:"pointer",
                            }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <p style={{ flex:1, margin:0, fontSize:12, color: p.notes ? "#6b7a9e" : "#b0baca", fontStyle: p.notes ? "italic" : "normal", lineHeight:1.5 }}>
                            {p.notes || "No notes yet…"}
                          </p>
                          <button className="nn-sd-editbtn" onClick={e => startEdit(p, e)} style={{
                            flexShrink:0, padding:"4px 10px", borderRadius:7, fontSize:11, fontWeight:700,
                            background:"#e8eeff", color:"#1a3a8f", border:"1.5px solid #dde4f5",
                            cursor:"pointer", fontFamily:"Nunito,sans-serif",
                          }}>✏️</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            padding:"14px 24px", flexShrink:0,
            borderTop:"1px solid #e8eeff",
            display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
            background:"#fafbff",
          }}>
            <span style={{ fontSize:12, color:"#b0baca" }}>
              {parts.length} sections · {avg}% average mastery
            </span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onClose} style={{
                padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:700,
                background:"#f0f4ff", color:"#6b7a9e",
                border:"1.5px solid #e8eeff", cursor:"pointer",
                fontFamily:"Nunito,sans-serif", transition:"all .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background="#e8eeff"}
                onMouseLeave={e => e.currentTarget.style.background="#f0f4ff"}>
                Cancel
              </button>
              <button onClick={handleSave} style={{
                padding:"9px 22px", borderRadius:10, fontSize:13, fontWeight:800,
                background:"#1a3a8f", color:"#fff",
                border:"none", cursor:"pointer",
                fontFamily:"Nunito,sans-serif",
                boxShadow:"0 3px 0 #0f2460",
                transition:"all .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background="#4a72e8"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#1a3a8f"; e.currentTarget.style.transform="translateY(0)"; }}>
                Save Notes
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}