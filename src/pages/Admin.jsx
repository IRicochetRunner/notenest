// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const EMPTY_PACK = {
  id: "",
  title: "",
  subtitle: "",
  description: "",
  instrument: "Guitar",
  type: "technique",
  difficulty: "Beginner",
  color: "#1a3a8f",
  gradient: "from-[#1a3a8f] to-[#4a72e8]",
  pro: false,
  songs: [],
  sort_order: 0,
};

const EMPTY_SONG = {
  title: "",
  artist: "",
  skill: "",
  difficulty: "Beginner",
  duration: "",
};

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packs, setPacks] = useState([]);
  const [editingPack, setEditingPack] = useState(null);
  const [editingSongs, setEditingSongs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [tab, setTab] = useState("packs"); // packs | edit
  const [songSearch, setSongSearch] = useState("");
  const [songResults, setSongResults] = useState([]);
  const [songSearching, setSongSearching] = useState(false);
  const [songSkill, setSongSkill] = useState("");
  const [songDifficulty, setSongDifficulty] = useState("Beginner");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/"); return; }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single();
    if (!profile?.is_admin) { navigate("/dashboard"); return; }
    await loadPacks();
    setLoading(false);
  }

  async function loadPacks() {
    const { data } = await supabase.from("packs").select("*").order("sort_order");
    if (data) setPacks(data);
  }

  async function searchItunes(query) {
    if (!query.trim()) { setSongResults([]); return; }
    setSongSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8&media=music`);
      const data = await res.json();
      setSongResults(data.results || []);
    } catch(e) {
      setSongResults([]);
    }
    setSongSearching(false);
  }

  function addSongFromItunes(result) {
    const duration = result.trackTimeMillis
      ? `${Math.floor(result.trackTimeMillis/60000)}:${String(Math.floor((result.trackTimeMillis%60000)/1000)).padStart(2,'0')}`
      : "";
    const newSong = {
      title: result.trackName,
      artist: result.artistName,
      skill: songSkill || "",
      difficulty: songDifficulty,
      duration,
      artworkUrl: result.artworkUrl100 || result.artworkUrl60 || null,
    };
    setEditingSongs(prev => [...prev, newSong]);
    setSongResults([]);
    setSongSearch("");
    setSongSkill("");
  }

  function startNew() {
    setEditingPack({ ...EMPTY_PACK, id: "pack-" + Date.now() });
    setEditingSongs([]);
    setTab("edit");
  }

  function startEdit(pack) {
    setEditingPack({ ...pack });
    setEditingSongs([...(pack.songs || [])]);
    setTab("edit");
  }

  async function savePack() {
    if (!editingPack.title || !editingPack.id) return;
    setSaving(true);
    const packToSave = { ...editingPack, songs: editingSongs };
    const { error } = await supabase.from("packs").upsert(packToSave);
    if (!error) {
      await loadPacks();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function deletePack(id) {
    setDeletingId(id);
    await supabase.from("packs").delete().eq("id", id);
    await loadPacks();
    setDeletingId(null);
  }

  function addSong() {
    setEditingSongs(prev => [...prev, { ...EMPTY_SONG }]);
  }

  function updateSong(i, field, value) {
    setEditingSongs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  function removeSong(i) {
    setEditingSongs(prev => prev.filter((_, idx) => idx !== i));
  }

  function moveSong(i, dir) {
    const arr = [...editingSongs];
    const target = i + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[i], arr[target]] = [arr[target], arr[i]];
    setEditingSongs(arr);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
      <div className="text-[#6b7a9e] font-bold">Loading admin...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4ff]" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#0d1b3e] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-white/60 hover:text-white text-sm font-bold bg-transparent border-none cursor-pointer">← Dashboard</button>
          <span className="text-white/30">/</span>
          <span className="font-black text-white" style={{ fontFamily: "Nunito,sans-serif" }}>Admin Panel</span>
          <span className="text-[10px] font-black text-amber-400 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        {tab === "edit" && (
          <div className="flex items-center gap-3">
            <button onClick={() => { setTab("packs"); setEditingPack(null); }}
              className="text-white/60 hover:text-white text-sm font-bold bg-transparent border-none cursor-pointer">
              ← Back to packs
            </button>
            <button onClick={savePack} disabled={saving}
              className={`font-black text-sm px-5 py-2 rounded-xl border-none cursor-pointer transition-all ${saved ? "bg-green-500 text-white" : "bg-amber-400 text-[#0d1b3e] hover:bg-amber-300"}`}
              style={{ fontFamily: "Nunito,sans-serif" }}>
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Pack"}
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* PACKS LIST */}
        {tab === "packs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-black text-2xl text-[#0d1b3e]" style={{ fontFamily: "Nunito,sans-serif" }}>Packs Manager</h1>
                <p className="text-sm text-[#6b7a9e]">{packs.length} packs in database</p>
              </div>
              <button onClick={startNew}
                className="bg-[#1a3a8f] text-white font-black px-5 py-2.5 rounded-xl border-none cursor-pointer hover:bg-[#4a72e8] transition-all text-sm"
                style={{ fontFamily: "Nunito,sans-serif" }}>
                + New Pack
              </button>
            </div>

            {packs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#dde4f5] p-12 text-center">
                <p className="text-[#6b7a9e] mb-4">No packs in database yet.</p>
                <p className="text-sm text-[#b0baca] mb-6">The app is currently using hardcoded packs from Packs.jsx. Create your first pack here to start using the database instead.</p>
                <button onClick={startNew}
                  className="bg-[#1a3a8f] text-white font-black px-6 py-3 rounded-xl border-none cursor-pointer hover:bg-[#4a72e8] transition-all"
                  style={{ fontFamily: "Nunito,sans-serif" }}>
                  Create First Pack
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {packs.map(pack => (
                  <div key={pack.id} className="bg-white rounded-2xl border border-[#dde4f5] p-5 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: pack.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#0d1b3e]" style={{ fontFamily: "Nunito,sans-serif" }}>{pack.title}</span>
                        {pack.pro && <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">PRO</span>}
                      </div>
                      <div className="text-xs text-[#6b7a9e]">{pack.subtitle} · {pack.songs?.length || 0} songs · {pack.instrument} · {pack.difficulty}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(pack)}
                        className="text-xs font-bold text-[#1a3a8f] bg-[#e8eeff] px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[#1a3a8f] hover:text-white transition-all">
                        Edit
                      </button>
                      <button onClick={() => deletePack(pack.id)} disabled={deletingId === pack.id}
                        className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-red-500 hover:text-white transition-all">
                        {deletingId === pack.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PACK EDITOR */}
        {tab === "edit" && editingPack && (
          <div>
            <h1 className="font-black text-2xl text-[#0d1b3e] mb-6" style={{ fontFamily: "Nunito,sans-serif" }}>
              {editingPack.title || "New Pack"}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left — Pack details */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-[#dde4f5] p-5 shadow-sm">
                  <h2 className="font-black text-sm text-[#0d1b3e] uppercase tracking-wider mb-4">Pack Details</h2>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Pack ID (no spaces)</label>
                      <input value={editingPack.id} onChange={e => setEditingPack(p => ({ ...p, id: e.target.value.replace(/\s/g, "-").toLowerCase() }))}
                        className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]"
                        placeholder="e.g. flea-bass" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Title</label>
                      <input value={editingPack.title} onChange={e => setEditingPack(p => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]"
                        placeholder="e.g. Learn Like Flea" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Subtitle</label>
                      <input value={editingPack.subtitle} onChange={e => setEditingPack(p => ({ ...p, subtitle: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]"
                        placeholder="e.g. Red Hot Chili Peppers" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Description</label>
                      <textarea value={editingPack.description} onChange={e => setEditingPack(p => ({ ...p, description: e.target.value }))}
                        rows={3} className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] resize-none"
                        placeholder="Describe what players will learn..." />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Instrument</label>
                        <select value={editingPack.instrument} onChange={e => setEditingPack(p => ({ ...p, instrument: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]">
                          {["Guitar", "Bass", "Drums"].map(i => <option key={i}>{i}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Type</label>
                        <select value={editingPack.type} onChange={e => setEditingPack(p => ({ ...p, type: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]">
                          {["musician", "band", "difficulty", "technique"].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Difficulty</label>
                        <select value={editingPack.difficulty} onChange={e => setEditingPack(p => ({ ...p, difficulty: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]">
                          {["Beginner", "Intermediate", "Advanced"].map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Sort Order</label>
                        <input type="number" value={editingPack.sort_order} onChange={e => setEditingPack(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#6b7a9e] mb-1 block">Color (hex)</label>
                      <div className="flex gap-2">
                        <input type="color" value={editingPack.color} onChange={e => setEditingPack(p => ({ ...p, color: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-[#dde4f5] cursor-pointer" />
                        <input value={editingPack.color} onChange={e => setEditingPack(p => ({ ...p, color: e.target.value }))}
                          className="flex-1 px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8]"
                          placeholder="#1a3a8f" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <input type="checkbox" id="pro-check" checked={editingPack.pro}
                        onChange={e => setEditingPack(p => ({ ...p, pro: e.target.checked }))}
                        className="w-4 h-4 cursor-pointer" />
                      <label htmlFor="pro-check" className="text-sm font-bold text-amber-700 cursor-pointer">Pro only pack</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Songs */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-[#dde4f5] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-sm text-[#0d1b3e] uppercase tracking-wider">Songs ({editingSongs.length})</h2>
                  </div>

                  {/* iTunes search */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        value={songSearch}
                        onChange={e => { setSongSearch(e.target.value); searchItunes(e.target.value); }}
                        className="w-full px-3 py-2.5 border border-[#dde4f5] rounded-xl text-sm bg-[#f0f4ff] outline-none focus:border-[#4a72e8] pr-8"
                        placeholder="Search iTunes to add a song..."
                      />
                      {songSearching && <div className="absolute right-3 top-3 text-[#6b7a9e] text-xs">...</div>}
                    </div>

                    {/* Skill + difficulty for next song to be added */}
                    {(songResults.length > 0) && (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={songSkill}
                          onChange={e => setSongSkill(e.target.value)}
                          className="flex-1 px-2.5 py-2 border border-[#dde4f5] rounded-lg text-xs bg-white outline-none focus:border-[#4a72e8]"
                          placeholder="Skill tag (e.g. Fingerstyle)"
                        />
                        <select value={songDifficulty} onChange={e => setSongDifficulty(e.target.value)}
                          className="px-2.5 py-2 border border-[#dde4f5] rounded-lg text-xs bg-white outline-none focus:border-[#4a72e8]">
                          {["Beginner","Intermediate","Advanced"].map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    )}

                    {/* iTunes results */}
                    {songResults.length > 0 && (
                      <div className="mt-2 bg-white border border-[#dde4f5] rounded-xl overflow-hidden shadow-lg">
                        {songResults.map((r, i) => (
                          <button key={i} onClick={() => addSongFromItunes(r)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f0f4ff] transition-all border-none cursor-pointer text-left border-b border-[#f0f4ff] last:border-0">
                            {(r.artworkUrl100 || r.artworkUrl60) && <img src={(r.artworkUrl100 || r.artworkUrl60)} alt="" className="w-10 h-10 rounded-lg flex-shrink-0 object-cover" />}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#0d1b3e] truncate">{r.trackName}</div>
                              <div className="text-[10px] text-[#6b7a9e] truncate">{r.artistName} · {r.collectionName}</div>
                            </div>
                            <span className="text-[10px] text-[#6b7a9e] flex-shrink-0">
                              {r.trackTimeMillis ? `${Math.floor(r.trackTimeMillis/60000)}:${String(Math.floor((r.trackTimeMillis%60000)/1000)).padStart(2,'0')}` : ""}
                            </span>
                            <span className="text-[10px] font-bold text-[#1a3a8f] bg-[#e8eeff] px-2 py-0.5 rounded-full flex-shrink-0">+ Add</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {editingSongs.length === 0 ? (
                    <div className="text-center py-8 text-[#b0baca] text-sm">
                      Search iTunes above to add songs
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {editingSongs.map((song, i) => (
                        <div key={i} className="bg-[#f8f9ff] rounded-xl border border-[#e8eeff] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {song.artworkUrl
                                ? <img src={song.artworkUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                                : <div className="w-8 h-8 rounded-lg bg-[#e8eeff] flex items-center justify-center text-[#6b7a9e] text-xs font-black flex-shrink-0">{(song.title||"?")[0]}</div>
                              }
                              <span className="text-xs font-black text-[#6b7a9e]">Song {i + 1}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => moveSong(i, -1)} className="w-6 h-6 bg-white border border-[#dde4f5] rounded-lg text-xs cursor-pointer hover:bg-[#e8eeff]">↑</button>
                              <button onClick={() => moveSong(i, 1)} className="w-6 h-6 bg-white border border-[#dde4f5] rounded-lg text-xs cursor-pointer hover:bg-[#e8eeff]">↓</button>
                              <button onClick={() => removeSong(i)} className="w-6 h-6 bg-red-50 border border-red-200 rounded-lg text-xs text-red-500 cursor-pointer hover:bg-red-500 hover:text-white transition-all">✕</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input value={song.title} onChange={e => updateSong(i, "title", e.target.value)}
                              className="px-2.5 py-2 border border-[#dde4f5] rounded-lg text-xs bg-white outline-none focus:border-[#4a72e8]"
                              placeholder="Song title" />
                            <input value={song.artist} onChange={e => updateSong(i, "artist", e.target.value)}
                              className="px-2.5 py-2 border border-[#dde4f5] rounded-lg text-xs bg-white outline-none focus:border-[#4a72e8]"
                              placeholder="Artist" />
                            <input value={song.skill} onChange={e => updateSong(i, "skill", e.target.value)}
                              className="px-2.5 py-2 border border-[#dde4f5] rounded-lg text-xs bg-white outline-none focus:border-[#4a72e8]"
                              placeholder="Skill (e.g. Fingerstyle)" />
                            <input value={song.duration} onChange={e => updateSong(i, "duration", e.target.value)}
                              className="px-2.5 py-2 border border-[#dde4f5] rounded-lg text-xs bg-white outline-none focus:border-[#4a72e8]"
                              placeholder="Duration (e.g. 3:45)" />
                            <select value={song.difficulty} onChange={e => updateSong(i, "difficulty", e.target.value)}
                              className="col-span-2 px-2.5 py-2 border border-[#dde4f5] rounded-lg text-xs bg-white outline-none focus:border-[#4a72e8]">
                              {["Beginner", "Intermediate", "Advanced"].map(d => <option key={d}>{d}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={savePack} disabled={saving}
                  className={`w-full py-4 font-black rounded-2xl border-none cursor-pointer transition-all text-sm ${saved ? "bg-green-500 text-white" : "bg-[#1a3a8f] text-white shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5"}`}
                  style={{ fontFamily: "Nunito,sans-serif" }}>
                  {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Pack"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}