"use client";
import { useCallback, useEffect, useState } from "react";

const K = "cv-pass:v1";
type Pass = { token: string; expiresAt: string };

export function useCvPass() {
  const [pass, setPass] = useState<Pass | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let token = "";
    try { token = JSON.parse(localStorage.getItem(K) || "null")?.token ?? ""; } catch {}
    if (!token) { setReady(true); return; }
    fetch(`/api/cv/pay/pass?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(p => {
        if (!alive) return;
        if (p?.valid) setPass({ token, expiresAt: p.expiresAt });
        else try { localStorage.removeItem(K); } catch {}
      })
      .catch(() => {})
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const save = useCallback((token: string, expiresAt: string) => {
    try { localStorage.setItem(K, JSON.stringify({ token })); } catch {}
    setPass({ token, expiresAt });
  }, []);

  const active = !!pass && new Date(pass.expiresAt) > new Date();
  return { active, expiresAt: pass?.expiresAt ?? null, ready, save };
}