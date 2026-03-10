// src/components/AuthModal.jsx
import { useState } from "react";
import { supabase } from "../supabase";

function MusicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (username.length < 3) { setError("Username must be at least 3 characters."); setLoading(false); return; }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { username } }
        });
        if (signUpError) throw signUpError;
        // Insert profile row
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username,
            email,
            created_at: new Date().toISOString(),
          });
        }
        setSuccess("Check your email to confirm your account, then log in.");
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        onAuth(data.user);
        onClose();
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1b3e]/60 backdrop-blur-md p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a3a8f] to-[#4a72e8] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/30 text-sm z-10">✕</button>
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MusicIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white text-xl" style={{ fontFamily:"Nunito,sans-serif" }}>NoteNest</span>
          </div>
          <h2 className="font-black text-2xl text-white" style={{ fontFamily:"Nunito,sans-serif" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {mode === "login" ? "Log in to access your song library." : "Start tracking your musical journey."}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {mode === "signup" && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-1.5">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g,""))}
                placeholder="e.g. riffmaster" maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-[#dde4f5] bg-[#f8f9ff] text-[#0d1b3e] text-sm font-medium outline-none focus:border-[#1a3a8f] transition-colors" />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[#dde4f5] bg-[#f8f9ff] text-[#0d1b3e] text-sm font-medium outline-none focus:border-[#1a3a8f] transition-colors" />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#6b7a9e] uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-3 rounded-xl border border-[#dde4f5] bg-[#f8f9ff] text-[#0d1b3e] text-sm font-medium outline-none focus:border-[#1a3a8f] transition-colors" />
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">{success}</div>}

          <button onClick={handleSubmit} disabled={loading || !email || !password}
            className="w-full bg-[#1a3a8f] text-white font-black py-3.5 rounded-2xl shadow-[0_4px_0_#0f2460] hover:-translate-y-0.5 transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{ fontFamily:"Nunito,sans-serif" }}>
            {loading ? "Loading..." : mode === "login" ? "Log in" : "Create account"}
          </button>

          <p className="text-center text-sm text-[#6b7a9e] mt-5">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
              className="text-[#1a3a8f] font-bold bg-transparent border-none cursor-pointer hover:underline">
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}