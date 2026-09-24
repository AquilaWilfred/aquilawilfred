"use client";
import { useState, useRef, useCallback } from "react";
import { Crop, Maximize, Check, X, RotateCcw } from "lucide-react";

interface ImagePrepProps {
  src: string;
  onConfirm: (processedUrl: string) => void;
  onCancel: () => void;
}

export default function ImagePrep({ src, onConfirm, onCancel }: ImagePrepProps) {
  const [mode, setMode] = useState<"margin" | "original">("original");
  const [margin, setMargin] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [processing, setProcessing] = useState(false);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const m = mode === "margin" ? margin : 0;
    canvas.width = img.naturalWidth + m * 2;
    canvas.height = img.naturalHeight + m * 2;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image centered
    ctx.drawImage(img, m, m, img.naturalWidth, img.naturalHeight);
  }, [mode, margin, bgColor]);

  const confirm = useCallback(async () => {
    setProcessing(true);
    if (mode === "original") { onConfirm(src); return; }

    const canvas = canvasRef.current;
    if (!canvas) { onConfirm(src); return; }

    renderPreview();
    // Small delay to let canvas render
    await new Promise(r => setTimeout(r, 100));
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onConfirm(dataUrl);
    setProcessing(false);
  }, [mode, src, onConfirm, renderPreview]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#0D1421", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", maxWidth: "680px", width: "100%", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
          <Crop size={20} color="#38BDF8" />
          <div>
            <h3 style={{ color: "white", fontWeight: 700, fontSize: "16px", margin: 0 }}>Prepare Image Before Publishing</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "monospace", margin: "2px 0 0" }}>Choose to publish as-is or add margin</p>
          </div>
          <button onClick={onCancel} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Mode selector */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {[{ id: "original", label: "Publish As-Is", icon: <Check size={14} /> }, { id: "margin", label: "Add Margin (max 50px)", icon: <Maximize size={14} /> }].map(m => (
              <button key={m.id} onClick={() => setMode(m.id as any)}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `2px solid ${mode === m.id ? "#38BDF8" : "rgba(255,255,255,0.1)"}`, background: mode === m.id ? "rgba(14,165,233,0.1)" : "transparent", color: mode === m.id ? "#38BDF8" : "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}>
                {m.icon}{m.label}
              </button>
            ))}
          </div>

          {/* Margin controls */}
          {mode === "margin" && (
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: "monospace", minWidth: "80px" }}>MARGIN: {margin}px</label>
                <input type="range" min={0} max={50} value={margin} onChange={e => setMargin(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#38BDF8" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: "monospace", minWidth: "80px" }}>BACKGROUND:</label>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                  style={{ width: "40px", height: "32px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "none", cursor: "pointer" }} />
                {["#ffffff", "#000000", "#0D1421", "#F0F9FF", "transparent"].map(c => (
                  <button key={c} onClick={() => setBgColor(c)}
                    style={{ width: "28px", height: "28px", borderRadius: "6px", background: c === "transparent" ? "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 10px 10px" : c, border: bgColor === c ? "2px solid #38BDF8" : "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }} />
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div style={{ background: "repeating-conic-gradient(rgba(255,255,255,0.05) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px", borderRadius: "12px", padding: "16px", textAlign: "center", marginBottom: "20px", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {mode === "original" ? (
              <img src={src} alt="preview" style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px" }} />
            ) : (
              <div style={{ display: "inline-block", background: bgColor, padding: `${margin}px`, borderRadius: "4px" }}>
                <img ref={imgRef} src={src} alt="preview" onLoad={renderPreview} style={{ display: "block", maxWidth: `${400 - margin * 2}px`, maxHeight: `${280 - margin * 2}px`, objectFit: "contain" }} />
              </div>
            )}
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={confirm} disabled={processing}
              style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#0EA5E9,#7C3AED)", border: "none", borderRadius: "10px", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: processing ? 0.6 : 1 }}>
              {processing ? "Processing..." : "✓ Confirm & Publish"}
            </button>
            <button onClick={onCancel}
              style={{ padding: "12px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "14px" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
