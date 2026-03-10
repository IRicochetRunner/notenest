import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import StepArtists from "./StepArtists";

// ── ICONS ───────────────────────────────────────────────────
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

function ChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ── STEP 1: INSTRUMENT ──────────────────────────────────────
function StepInstrument({ value, onChange }) {
  const options = [
    { id: "guitar", label: "Guitar", desc: "Acoustic, electric, or classical" },
    { id: "bass",   label: "Bass",   desc: "Electric or acoustic bass" },
    { id: "both",   label: "Both",   desc: "I play guitar and bass" },
  ];
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-[1.5px] text-left transition-all cursor-pointer w-full bg-white ${
            value === o.id
              ? "border-[#1a3a8f] bg-[#e8eeff] shadow-[0_0_0_3px_rgba(26,58,143,0.1)]"
              : "border-[#dde4f5] hover:border-[#4a72e8] hover:bg-[#f0f4ff]"
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${value === o.id ? "bg-[#1a3a8f]/15" : "bg-[#e8eeff]"}`}>
            <MusicIcon className="w-5 h-5 text-[#1a3a8f]" />
          </div>
          <div className="flex-1">
            <div className="font-black text-[#0d1b3e]" style={{ fontFamily: "Nunito, sans-serif" }}>{o.label}</div>
            <div className="text-sm text-[#6b7a9e]">{o.desc}</div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            value === o.id ? "bg-[#1a3a8f] border-[#1a3a8f]" : "border-[#dde4f5]"
          }`}>
            {value === o.id && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── STEP 2: SKILL LEVEL ─────────────────────────────────────
function StepLevel({ value, onChange }) {
  const options = [
    { id: "beginner",     label: "Beginner",     desc: "I know a few chords or just getting started", color: "#16a34a",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { id: "intermediate", label: "Intermediate", desc: "I can play full songs but still learning",      color: "#4a72e8",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
    { id: "advanced",     label: "Advanced",     desc: "I've been playing for years and know my way around", color: "#f0a500",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  ];
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-[1.5px] text-left transition-all cursor-pointer w-full bg-white ${
            value === o.id
              ? "border-[#1a3a8f] bg-[#e8eeff] shadow-[0_0_0_3px_rgba(26,58,143,0.1)]"
              : "border-[#dde4f5] hover:border-[#4a72e8] hover:bg-[#f0f4ff]"
          }`}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: o.color + "1a" }}>
            <div className="w-5 h-5" style={{ color: o.color }}>{o.icon}</div>
          </div>
          <div className="flex-1">
            <div className="font-black text-[#0d1b3e]" style={{ fontFamily: "Nunito, sans-serif" }}>{o.label}</div>
            <div className="text-sm text-[#6b7a9e]">{o.desc}</div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            value === o.id ? "bg-[#1a3a8f] border-[#1a3a8f]" : "border-[#dde4f5]"
          }`}>
            {value === o.id && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── STEP 3: GENRES ──────────────────────────────────────────
function StepGenres({ value, onChange }) {
  const genres = ["Rock","Blues","Pop","Metal","Folk","Country","Jazz","Punk","R&B","Classic Rock","Indie","Reggae","Soul","Hip Hop","Funk","Latin"];
  const toggle = (g) => onChange(value.includes(g) ? value.filter((x) => x !== g) : [...value, g]);
  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => toggle(g)}
            className={`px-4 py-2 rounded-full font-bold text-sm border-[1.5px] transition-all cursor-pointer ${
              value.includes(g)
                ? "bg-[#1a3a8f] border-[#1a3a8f] text-white"
                : "bg-white border-[#dde4f5] text-[#0d1b3e] hover:border-[#4a72e8] hover:bg-[#f0f4ff]"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-[#6b7a9e] mt-4 font-medium">{value.length} genre{value.length !== 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}

// ── STEP 5: PRACTICE TIME ───────────────────────────────────
function StepTime({ value, onChange }) {
  const options = [
    { id: "5-10",  time: "5–10",  label: "minutes a day", desc: "Quick daily habit" },
    { id: "15-20", time: "15–20", label: "minutes a day", desc: "Steady progress" },
    { id: "30",    time: "30",    label: "minutes a day", desc: "Serious learner" },
    { id: "60+",   time: "60+",   label: "minutes a day", desc: "All in" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`p-5 rounded-2xl border-[1.5px] text-center transition-all cursor-pointer bg-white ${
            value === o.id
              ? "border-[#1a3a8f] bg-[#e8eeff] shadow-[0_0_0_3px_rgba(26,58,143,0.1)]"
              : "border-[#dde4f5] hover:border-[#4a72e8] hover:bg-[#f0f4ff]"
          }`}
        >
          <div className="font-black text-3xl text-[#1a3a8f] mb-1" style={{ fontFamily: "Nunito, sans-serif" }}>{o.time}</div>
          <div className="text-xs text-[#6b7a9e]">{o.label}</div>
          <div className="text-xs font-semibold text-[#0d1b3e] mt-1">{o.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ── BUILDING SCREEN ─────────────────────────────────────────
function BuildingScreen({ answers }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const buildSteps = [
    { title: "Setting up your library",       sub: "Getting your instrument profile ready" },
    { title: "Mapping your skill baseline",   sub: "Calibrating techniques for your level" },
    { title: "Generating AI recommendations", sub: "Finding songs that match your style" },
  ];

  useState(() => {
    const timers = buildSteps.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 1200)
    );
    const done = setTimeout(async () => {
      // Save onboarding answers to Supabase profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const stored = JSON.parse(localStorage.getItem("nn_profile") || "{}");
        await supabase.from("profiles").update({
          username: answers.username || stored.username,
          instrument: answers.instrument,
          level: answers.level,
          genres: answers.genres,
          practice_time: answers.time,
        }).eq("id", session.user.id);
        localStorage.setItem("nn_profile", JSON.stringify({
          ...stored,
          username: answers.username || stored.username,
          instrument: answers.instrument,
          level: answers.level,
          genres: answers.genres,
        }));
      }
      navigate("/dashboard");
    }, 4200);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  });

  return (
    <div
      className="fixed inset-0 bg-[#f0f4ff] z-50 flex flex-col items-center justify-center px-6"
      style={{ backgroundImage: "linear-gradient(rgba(26,58,143,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(26,58,143,.035) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
    >
      <div className="flex items-center gap-3 mb-12">
        <div className="w-11 h-11 bg-[#1a3a8f] rounded-2xl flex items-center justify-center shadow-lg">
          <MusicIcon className="w-6 h-6 text-white" />
        </div>
        <span className="font-black text-2xl text-[#1a3a8f]" style={{ fontFamily: "Nunito, sans-serif" }}>NoteNest</span>
      </div>

      <h2 className="font-black text-3xl text-[#0d1b3e] mb-3 text-center" style={{ fontFamily: "Nunito, sans-serif" }}>
        {step >= buildSteps.length ? "You're all set!" : "Building your profile..."}
      </h2>
      <p className="text-[#6b7a9e] mb-12 text-center">
        {step >= buildSteps.length ? "Your personalized library is ready." : "This only takes a second."}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {buildSteps.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-4 rounded-2xl border-[1.5px] transition-all duration-500 ${
              i < step
                ? "opacity-100 border-green-200/60 bg-green-50/60"
                : i === step
                ? "opacity-100 border-[#dde4f5] bg-white"
                : "opacity-0 border-[#dde4f5] bg-white"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${i < step ? "bg-green-100" : "bg-[#e8eeff]"}`}>
              <MusicIcon className={`w-4 h-4 ${i < step ? "text-green-600" : "text-[#1a3a8f]"}`} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-[#0d1b3e]">{s.title}</div>
              <div className="text-xs text-[#6b7a9e]">{s.sub}</div>
            </div>
            {i < step ? (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckIcon className="w-2.5 h-2.5 text-white" />
              </div>
            ) : i === step ? (
              <div className="w-5 h-5 border-2 border-[#1a3a8f] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STEP 0: USERNAME ────────────────────────────────────────
const ADJECTIVES = ["sonic","riff","golden","heavy","mellow","fret","groove","chord","bluesy","electric","funky","jazzy","cosmic","shred","velvet","iron","neon","quiet","wild","steel"];
const NOUNS = ["picker","player","axeman","stringer","shredder","groover","bassist","strummer","rocker","riffler","soloist","fretboard","musician","jammer","plucky","slapper","noodler","plectrum","bridge","amp"];

function generateUsernames() {
  const picks = new Set();
  while (picks.size < 3) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    picks.add(`${adj}_${noun}${num}`);
  }
  return [...picks];
}

function StepUsername({ value, onChange }) {
  const [suggestions, setSuggestions] = useState(() => generateUsernames());

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7a9e] font-bold text-sm">@</span>
        <input
          type="text"
          value={value || ""}
          onChange={e => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          placeholder="yourname"
          maxLength={20}
          className="w-full pl-8 pr-4 py-3.5 border-[1.5px] border-[#dde4f5] rounded-2xl text-sm bg-[#f0f4ff] outline-none focus:border-[#1a3a8f] transition-all font-bold text-[#0d1b3e]"
        />
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#6b7a9e] uppercase tracking-wider">Suggestions</span>
          <button onClick={() => setSuggestions(generateUsernames())}
            className="text-xs font-bold text-[#4a72e8] bg-transparent border-none cursor-pointer hover:underline">
            Regenerate
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => onChange(s)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-[1.5px] text-left transition-all cursor-pointer text-sm font-bold ${
                value === s
                  ? "border-[#1a3a8f] bg-[#e8eeff] text-[#1a3a8f]"
                  : "border-[#dde4f5] bg-white text-[#0d1b3e] hover:border-[#4a72e8] hover:bg-[#f0f4ff]"
              }`}>
              <span className="text-[#6b7a9e]">@</span>{s}
              {value === s && <span className="ml-auto text-[#1a3a8f]"><CheckIcon className="w-4 h-4" /></span>}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#6b7a9e]">Pick a suggestion or type your own. Letters, numbers, and underscores only.</p>
      {value && value.length >= 3 && !suggestions.includes(value) && (
        <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-white" />
          </div>
          @{value} looks good!
        </div>
      )}
    </div>
  );
}

// ── STEP CONFIG ─────────────────────────────────────────────
const STEPS = [
  { label: "Step 1 of 6", title: "Pick your username",                       sub: "This is your identity on NoteNest. You can always change it later." },
  { label: "Step 2 of 6", title: "What do you play?",                        sub: "NoteNest works for both guitar and bass players at every level." },
  { label: "Step 3 of 6", title: "How would you describe your playing?",     sub: "Be honest — this helps us recommend the right songs for where you actually are." },
  { label: "Step 4 of 6", title: "What music do you love?",                  sub: "Pick as many as you like. This shapes every song recommendation you get." },
  { label: "Step 5 of 6", title: "Who are your favorite artists?",           sub: "Type a name and press Enter. Add up to 5 — the more you add the better your recommendations." },
  { label: "Step 6 of 6", title: "How much time can you practice?",          sub: "We'll pace your recommendations around your schedule. You can always change this later." },
];

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [building, setBuilding] = useState(false);
  const [answers, setAnswers] = useState({
    username: "",
    instrument: null,
    level: null,
    genres: [],
    artists: [],
    time: null,
  });

  const update = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));

  const canContinue = () => {
    if (cur === 0) return answers.username && answers.username.length >= 3;
    if (cur === 1) return !!answers.instrument;
    if (cur === 2) return !!answers.level;
    if (cur === 3) return answers.genres.length > 0;
    if (cur === 4) return true;
    if (cur === 5) return !!answers.time;
    return false;
  };

  const next = () => {
    if (cur < STEPS.length - 1) setCur((c) => c + 1);
    else setBuilding(true);
  };

  const back = () => { if (cur > 0) setCur((c) => c - 1); };

  const progress = ((cur + 1) / STEPS.length) * 100;

  if (building) return <BuildingScreen answers={answers} />;

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex flex-col" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(rgba(26,58,143,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(26,58,143,.035) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-12 py-5 bg-[#f0f4ff]/90 backdrop-filter backdrop-blur-xl border-b border-[#dde4f5]">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-[#1a3a8f] rounded-xl flex items-center justify-center shadow-lg">
            <MusicIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl text-[#1a3a8f]" style={{ fontFamily: "Nunito, sans-serif" }}>NoteNest</span>
        </a>

        {/* Step dots */}
        <div className="flex gap-2 items-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === cur ? "w-6 h-2.5 bg-[#1a3a8f]" : i < cur ? "w-2.5 h-2.5 bg-green-500" : "w-2.5 h-2.5 bg-[#dde4f5]"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-[#6b7a9e] font-semibold hover:text-[#1a3a8f] transition-colors bg-transparent border-none cursor-pointer"
        >
          Skip setup
        </button>
      </div>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="bg-white rounded-3xl border border-[#dde4f5] shadow-[0_24px_80px_rgba(26,58,143,0.1)] w-full max-w-lg overflow-hidden">

          {/* Progress bar */}
          <div className="h-1 bg-[#e8eeff]">
            <div
              className="h-full bg-gradient-to-r from-[#1a3a8f] to-[#4a72e8] rounded-r-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-10 pb-6">
            <div className="text-xs font-bold tracking-widest uppercase text-[#4a72e8] mb-2">{STEPS[cur].label}</div>
            <h2 className="font-black text-2xl text-[#0d1b3e] mb-2 leading-tight" style={{ fontFamily: "Nunito, sans-serif" }}>
              {STEPS[cur].title}
            </h2>
            <p className="text-sm text-[#6b7a9e] mb-7 leading-relaxed">{STEPS[cur].sub}</p>

            <div key={cur}>
              {cur === 0 && <StepUsername   value={answers.username}   onChange={(v) => update("username", v)} />}
              {cur === 1 && <StepInstrument value={answers.instrument} onChange={(v) => update("instrument", v)} />}
              {cur === 2 && <StepLevel      value={answers.level}      onChange={(v) => update("level", v)} />}
              {cur === 3 && <StepGenres     value={answers.genres}     onChange={(v) => update("genres", v)} />}
              {cur === 4 && <StepArtists    value={answers.artists}    onChange={(v) => update("artists", v)} />}
              {cur === 5 && <StepTime       value={answers.time}       onChange={(v) => update("time", v)} />}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-10 py-6 border-t border-[#dde4f5]">
            <button
              onClick={back}
              className={`flex items-center gap-1.5 text-sm font-bold text-[#6b7a9e] hover:text-[#1a3a8f] transition-colors bg-transparent border-none cursor-pointer ${cur === 0 ? "invisible" : ""}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={next}
              disabled={!canContinue()}
              className={`flex items-center gap-2 font-black px-7 py-3.5 rounded-2xl border-none transition-all ${
                canContinue()
                  ? "bg-[#1a3a8f] text-white shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#0f2460] active:translate-y-0.5 cursor-pointer"
                  : "bg-[#dde4f5] text-[#6b7a9e] cursor-not-allowed"
              }`}
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {cur === STEPS.length - 1 ? "Build my profile" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}