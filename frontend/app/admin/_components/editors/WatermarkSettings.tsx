"use client";
import { useEffect, useState } from "react";
import { ImagePlus, RotateCcw, Save } from "lucide-react";
import { TEMPLATES, WM_LOGO, normWm, type WmConfig } from "@/lib/cv/engine";

/** Shrinks the logo to a PNG (keeps transparency) so it stays small in the database. */
async function logoToPng(file: File, max = 500): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  } finally { URL.revokeObjectURL(url); }
}

export default function WatermarkSettings() {
  const [wm, setWm] = useState<WmConfig>(() => normWm({}));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/cv/watermark", { cache: "no-store" }).then(r => r.json()).then(p => p?.data && setWm(normWm(p.data))).catch(() => {});
  }, []);

  const up = (p: Partial<WmConfig>) => { setMsg(""); setWm(w => ({ ...w, ...p })); };

  const pickLogo = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5_000_000) { setMsg("Choose an image under 5 MB."); return; }
    try {
      const png = await logoToPng(file);
      if (png.length > 700_000) { setMsg("That logo is too detailed after resizing. Use a simpler or smaller one."); return; }
      up({ image: png });
    } catch { setMsg("Couldn't read that image."); }
  };

  const save = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/cv/watermark", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: wm }) });
      const j = await r.json().catch(() => ({}));
      setMsg(r.ok ? "Saved. The public CV page now uses these settings." : j.error || "Couldn't save. Check you're signed in.");
    } catch { setMsg("Couldn't reach the server."); }
    setBusy(false);
  };

  return (
    <div className="cv-app" style={{ marginTop: 16 }}>
      <div className="cv-panel">
        <h2>Watermark <span className="cv-tag" style={{ fontFamily: "system-ui", fontSize: 11, verticalAlign: "middle" }}>Public CV page</span></h2>
        <p className="cv-tip">Shown on the free preview until the customer pays. Paid users see no watermark.</p>

        <div className="cv-block">
          <div className="cv-block-h"><h3>Logo</h3></div>
          <div className="cv-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wm.image || WM_LOGO} alt="Watermark logo" style={{ borderRadius: 10, objectFit: "contain", background: "#fff", width: 96, height: 96 }} />
            <label className="cv-ghost" style={{ margin: 0 }}>
              <ImagePlus size={14} /> Upload a different logo
              <input type="file" accept="image/*" hidden onChange={e => { pickLogo(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            {wm.image && <button type="button" className="cv-ghost" style={{ margin: 0 }} onClick={() => up({ image: "" })}><RotateCcw size={13} /> Use default logo</button>}
          </div>
          <p className="cv-sub" style={{ marginTop: 6 }}>{wm.image ? "Using your uploaded logo." : "Using the default logo (public/logo.png)."} A transparent PNG works best.</p>
        </div>

        <div className="cv-grid">
          <label className="cv-f"><span>Text under the logo (leave empty for none)</span>
            <input value={wm.text} maxLength={60} onChange={e => up({ text: e.target.value })} />
          </label>
          <label className="cv-f"><span>Strength ({Math.round(wm.opacity * 100)}%)</span>
            <input type="range" min={0.04} max={0.35} step={0.01} value={wm.opacity} onChange={e => up({ opacity: parseFloat(e.target.value) })} style={{ padding: 0, border: "none" }} />
          </label>
        </div>

        <div className="cv-block" style={{ marginTop: 18 }}>
          <div className="cv-block-h"><h3>Show the watermark on these templates</h3></div>
          {Object.entries(TEMPLATES).map(([id, t]) => (
            <label key={id} className="cv-row" style={{ cursor: "pointer" }}>
              <span>{t.label}</span>
              <input type="checkbox" checked={wm.templates[id] !== false} onChange={e => up({ templates: { ...wm.templates, [id]: e.target.checked } })} />
            </label>
          ))}
          <p className="cv-sub" style={{ marginTop: 6 }}>Unticked templates show a clean preview, though the PDF download still needs payment. New templates you add appear here automatically.</p>
        </div>

        <div className="cv-foot" style={{ justifyContent: "flex-start", alignItems: "center" }}>
          <button type="button" className="cv-btn primary" disabled={busy} onClick={save}><Save size={15} /> {busy ? "Saving…" : "Save watermark"}</button>
          <span className="cv-sub" style={{ margin: 0 }}>{msg}</span>
        </div>
      </div>
    </div>
  );
}