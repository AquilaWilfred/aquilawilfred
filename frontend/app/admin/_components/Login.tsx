// app/admin/_components/Login.tsx

"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Zap, Check, Globe } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });

    if (res.ok) {
      onLogin();
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2500);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0C4A6E,#082F49 45%,#2E1065)" }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative p-16">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl top-0 left-[-100px] opacity-15"
          style={{ background: "#38BDF8" }}
        />
        <div className="relative z-10 text-center">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-sky-400 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Zap size={54} className="text-white" />
          </div>
          <h1 className="font-display font-black text-6xl text-white mb-2">
            EAGLE<span style={{ color: "#38BDF8" }}>WILLS</span>
          </h1>
          <p className="text-white/50 font-mono text-sm tracking-[0.3em] mb-12">
            PORTFOLIO MANAGEMENT SYSTEM
          </p>
          {[
            "Real email delivery via Gmail",
            "Cloudinary CDN image uploads",
            "Rich text editor with code canvas",
            "Full content management",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 text-left">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(14,165,233,0.2)",
                  border: "1px solid rgba(14,165,233,0.4)",
                }}
              >
                <Check size={12} className="text-sky-400" />
              </div>
              <span className="text-white/60 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div
            className="p-10 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl px-4 py-3 mb-8">
              <Lock size={14} className="text-emerald-400" />
              <span className="text-emerald-300 text-xs font-mono">
                AUTHORISED ACCESS ONLY
              </span>
            </div>
            <h2 className="text-white font-heading font-bold text-2xl mb-1">
              Welcome back
            </h2>
            <p className="text-white/40 text-sm mb-8">Enter your admin password</p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-white/50 text-xs font-mono tracking-widest block mb-2">
                  PASSWORD
                </label>
                <div className="relative w-full">
                  <input
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder={showPass ? "Enter your password" : "••••••••••••"}
                    className="w-full rounded-xl pl-5 pr-14 py-4 text-white text-sm outline-none font-mono"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: `2px solid ${err ? "#F87171" : "rgba(255,255,255,0.12)"}`,
                      letterSpacing: showPass ? "normal" : "0.2em",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {err && (
                  <p className="text-red-400 text-xs mt-2 font-mono">
                    ✗ Invalid password
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-heading font-bold text-white text-lg disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#0EA5E9,#7C3AED)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Access Portal →"
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <a
              href="/"
              className="text-white/30 hover:text-white/60 text-sm inline-flex items-center gap-2"
            >
              <Globe size={14} />
              Back to Portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}