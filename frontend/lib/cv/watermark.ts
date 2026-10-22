"use client";
import { useEffect, useState } from "react";
import { normWm, type WmConfig } from "./engine";

/** The watermark settings for the public site. Starts with the default logo so there's never a flash without one. */
export function useWatermark(): WmConfig {
  const [wm, setWm] = useState<WmConfig>(() => normWm({}));
  useEffect(() => {
    let alive = true;
    fetch("/api/cv/watermark", { cache: "no-store" })
      .then(r => r.json())
      .then(p => { if (alive && p?.data) setWm(normWm(p.data)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return wm;
}