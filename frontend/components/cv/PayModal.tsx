"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Loader2, Smartphone, X } from "lucide-react";

type Phase = "idle" | "sending" | "waiting" | "paid" | "failed";

export default function PayModal({ price, onPaid, onClose }: {
  price: number; onPaid: (token: string, expiresAt: string) => void; onClose: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [msg, setMsg] = useState("");
  const orderId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  useEffect(() => stop, []);

  const check = async (): Promise<boolean> => {
    if (!orderId.current) return false;
    const r = await fetch(`/api/cv/pay/status?orderId=${orderId.current}`, { cache: "no-store" }).then(x => x.json()).catch(() => null);
    if (!r) return false;
    if (r.status === "paid") { stop(); setPhase("paid"); setTimeout(() => onPaid(r.token, r.expiresAt), 900); return true; }
    if (r.status === "failed" || r.status === "cancelled") {
      stop(); setPhase("failed");
      setMsg(r.status === "cancelled" ? "The payment was cancelled on your phone." : "The payment did not go through.");
      return true;
    }
    return false;
  };

  const pay = async () => {
    setMsg(""); setPhase("sending");
    const r = await fetch("/api/cv/pay", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }),
    }).then(x => x.json()).catch(() => null);
    if (!r?.orderId) { setPhase("failed"); setMsg(r?.error || "Network error. Please try again."); return; }

    orderId.current = r.orderId;
    setPhase("waiting");
    let tries = 0;
    stop();
    timer.current = setInterval(async () => {
      tries++;
      if (await check()) return;
      if (tries >= 25) { stop(); setPhase("failed"); setMsg("No confirmation yet. If you already paid, tap “I've paid, check again”."); }
    }, 4000);
  };

  const busy = phase === "sending" || phase === "waiting";

  return createPortal(
    <div onClick={() => !busy && onClose()} className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)" }}>
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl text-white">
        {!busy && <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20"><X size={16} /></button>}

        {phase === "paid" ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-emerald-400" size={48} />
            <p className="font-heading font-bold text-xl">Payment received</p>
            <p className="text-white/60 text-sm mt-1">Your CV is unlocked.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Smartphone className="text-emerald-400" size={22} /></div>
              <div>
                <p className="font-heading font-bold text-lg leading-tight">Unlock your CV</p>
                <p className="text-white/60 text-sm">KES {price} · pay with M-Pesa</p>
              </div>
            </div>

            <ul className="text-white/70 text-sm space-y-1 mb-5">
              <li>✓ Watermark removed, PDF download unlocked</li>
              <li>✓ Edit and re-download freely for 24 hours</li>
            </ul>

            <label className="block text-xs font-mono text-white/50 mb-1.5">M-PESA PHONE NUMBER</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} disabled={busy} inputMode="tel" placeholder="0712 345 678"
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-lg outline-none focus:border-sky-400 disabled:opacity-60" />

            {phase === "waiting" && (
              <p className="mt-4 flex items-start gap-2 text-sm text-sky-200">
                <Loader2 className="animate-spin shrink-0 mt-0.5" size={16} />
                Check your phone and enter your M-Pesa PIN to approve KES {price}. This page updates automatically.
              </p>
            )}
            {msg && <p className="mt-4 text-sm text-amber-300">{msg}</p>}

            <button onClick={pay} disabled={busy || !phone.trim()}
              className="mt-5 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 py-3 font-semibold transition-colors">
              {phase === "sending" ? "Sending prompt…" : phase === "waiting" ? "Waiting for PIN…" : `Pay KES ${price}`}
            </button>
            {phase === "failed" && orderId.current && (
              <button onClick={async () => { const ok = await check(); if (!ok) setMsg("Still no confirmation. Give it a moment and try again."); }}
                className="mt-2 w-full rounded-xl bg-white/10 hover:bg-white/20 py-2.5 text-sm">
                I've paid, check again
              </button>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}