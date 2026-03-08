import { useState, useEffect, useRef } from "react";

function MusicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
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

export default function StepArtists({ value, onChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          "https://itunes.apple.com/search?term=" + encodeURIComponent(input) + "&entity=musicArtist&limit=6"
        );
        const data = await res.json();
        const seen = new Set();
        const results = (data.results || [])
          .filter((r) => {
            if (seen.has(r.artistName)) return false;
            seen.add(r.artistName);
            return true;
          })
          .slice(0, 5);
        setSuggestions(results);
        setOpen(results.length > 0);
        setHighlighted(-1);
      } catch (e) {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addArtist = (name) => {
    if (!name.trim() || value.length >= 5 || value.includes(name.trim())) return;
    onChange([...value, name.trim()]);
    setInput("");
    setSuggestions([]);
    setOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && suggestions[highlighted]) {
        addArtist(suggestions[highlighted].artistName);
      } else if (input.trim()) {
        addArtist(input.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const remove = (a) => onChange(value.filter((x) => x !== a));

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {value.map((a) => (
            <div key={a} className="flex items-center gap-2 bg-[#e8eeff] border border-[#1a3a8f]/20 text-[#1a3a8f] px-3 py-1.5 rounded-full text-sm font-bold">
              {a}
              <button onClick={() => remove(a)} className="text-[#1a3a8f]/50 hover:text-[#1a3a8f] bg-transparent border-none cursor-pointer text-base leading-none transition-colors">
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div ref={wrapRef} className="relative">
        <div className={"flex items-center border-[1.5px] rounded-2xl bg-[#f0f4ff] transition-all " + (open || input ? "border-[#4a72e8] ring-4 ring-[#4a72e8]/10" : "border-[#dde4f5]")}>
          <MusicIcon className="w-4 h-4 text-[#6b7a9e] ml-4 flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setOpen(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={value.length >= 5 ? "Max 5 artists added" : "Search for an artist..."}
            disabled={value.length >= 5}
            maxLength={50}
            className="flex-1 px-3 py-3.5 bg-transparent outline-none text-sm text-[#0d1b3e] placeholder:text-[#b0baca] disabled:cursor-not-allowed"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-[#dde4f5] border-t-[#1a3a8f] rounded-full animate-spin mr-4 flex-shrink-0" />
          )}
        </div>

        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#dde4f5] rounded-2xl shadow-[0_16px_48px_rgba(26,58,143,0.12)] overflow-hidden z-50">
            {suggestions.map((s, i) => {
              const alreadyAdded = value.includes(s.artistName);
              return (
                <button
                  key={s.artistId}
                  onMouseDown={(e) => { e.preventDefault(); if (!alreadyAdded) addArtist(s.artistName); }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={"w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-none cursor-pointer " +
                    (alreadyAdded ? "bg-[#f0f4ff] cursor-default " : highlighted === i ? "bg-[#e8eeff] " : "bg-white hover:bg-[#f0f4ff] ") +
                    (i < suggestions.length - 1 ? "border-b border-[#dde4f5]" : "")}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#e8eeff] flex items-center justify-center flex-shrink-0">
                    <MusicIcon className="w-4 h-4 text-[#1a3a8f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#0d1b3e] truncate">{s.artistName}</div>
                    <div className="text-xs text-[#6b7a9e] truncate">{s.primaryGenreName || "Artist"}</div>
                  </div>
                  {alreadyAdded && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}

            {input.trim() && !suggestions.find((s) => s.artistName.toLowerCase() === input.toLowerCase()) && (
              <button
                onMouseDown={(e) => { e.preventDefault(); addArtist(input.trim()); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-[#f8f9ff] hover:bg-[#e8eeff] transition-colors border-none cursor-pointer border-t border-[#dde4f5]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e8eeff] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#1a3a8f] font-black text-lg">+</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0d1b3e]">Add "{input.trim()}"</div>
                  <div className="text-xs text-[#6b7a9e]">Add manually</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-[#6b7a9e] mt-3">
        {value.length >= 5
          ? "Maximum reached — remove one to add another"
          : value.length + "/5 artists added · use arrow keys to navigate"}
      </p>
    </div>
  );
}