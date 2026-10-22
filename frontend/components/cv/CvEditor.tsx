"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Plus, Trash2, AlertTriangle, ImagePlus, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import RichEditor from "@/components/editor/RichEditor";
import {
  type Entry, type ListKey, type Trio, type Layout, type CV, type SideType, type SideBlock, type Step, type WmConfig,
  SECTIONS, ORDER_DEFAULT, PRESETS, ACCENTS, TEXTS, DEFAULT_LAYOUT, TEMPLATES, SIDE_TYPES,
  LISTS, STEPS, SCALE, REQUIRED_KEYS,
  mkBlock, blankEntry, plain, used, problems, clamp, safeColor, buildCvHtml, printPdf,
} from "@/lib/cv/engine";

/** Shrinks the photo (keeping its shape) so a CV with a photo stays small in storage. */
async function toJpeg(file: File, max = 760): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } finally { URL.revokeObjectURL(url); }
}

function useDebounced<T>(v: T, ms: number): T {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

/* ───────────────────────────── UI PIECES ───────────────────────────── */
type SetFn = <K extends keyof CV>(k: K, v: CV[K]) => void;

function Field({ label, req, children, wide }: { label: string; req?: boolean; children: ReactNode; wide?: boolean }) {
  return (
    <label className="cv-f" style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <span>{label}{req && <em>required</em>}</span>{children}
    </label>
  );
}

function Swatches({ label, value, options, onPick }: { label: string; value: string; options: string[]; onPick: (c: string) => void }) {
  return (
    <div className="cv-f">
      <span>{label}</span>
      <div className="cv-sw">
        {options.map(c => <button key={c} type="button" aria-label={`${label} ${c}`} className={c.toLowerCase() === value.toLowerCase() ? "on" : ""} style={{ background: c }} onClick={() => onPick(c)} />)}
        <input type="color" aria-label={`Custom ${label.toLowerCase()}`} value={safeColor(value, "#111111")} onChange={e => onPick(e.target.value)} />
      </div>
    </div>
  );
}

function EntryList({ k, cv, set }: { k: ListKey; cv: CV; set: SetFn }) {
  const cfg = LISTS[k];
  const items = cv[k];
  const req = k === "education";
  const update = (i: number, patch: Partial<Entry>) => set(k, items.map((e, n) => (n === i ? { ...e, ...patch } : e)) as CV[typeof k]);
  return (
    <div className="cv-block">
      <div className="cv-block-h">
        <h3>{cfg.heading}</h3>
        <span className={req ? "cv-tag req" : "cv-tag"}>{req ? "Required" : "Optional"}</span>
      </div>
      {items.length === 0 && <p className="cv-empty">Nothing here yet. Add an entry if it supports your application.</p>}
      {items.map((e, i) => (
        <div className="cv-card" key={i}>
          <div className="cv-grid">
            <Field label={cfg.labels[0]} req={req}><input value={e.title} onChange={ev => update(i, { title: ev.target.value })} /></Field>
            <Field label={cfg.labels[2]} req={req}><input value={e.period} onChange={ev => update(i, { period: ev.target.value })} /></Field>
            <Field label={cfg.labels[1]} req={req} wide><input value={e.org} onChange={ev => update(i, { org: ev.target.value })} /></Field>
          </div>
          {!cfg.noBody && (
            <div style={{ marginTop: 10 }}>
              <span className="cv-sub">{cfg.labels[3]}</span>
              <RichEditor theme="light" minHeight={110} placeholder="Use the bullet list button for achievements…" value={e.body} onChange={html => update(i, { body: html })} />
            </div>
          )}
          {(items.length > 1 || !req) && (
            <button type="button" className="cv-ghost danger" onClick={() => set(k, items.filter((_, n) => n !== i) as CV[typeof k])}><Trash2 size={13} /> Remove entry</button>
          )}
        </div>
      ))}
      <button type="button" className="cv-ghost" onClick={() => set(k, [...items, blankEntry()] as CV[typeof k])}><Plus size={14} /> Add {cfg.heading.toLowerCase()} entry</button>
    </div>
  );
}

/* ── Style step ── */
const BODY_TEXTS = ["#111111", "#374151", "#4B4B50", "#5C5C61"];
const PANELS = ["#ECEEF0", "#F3EFE7", "#E8EEF5", "#EDEAF4", "#E6F0EC", "#F5E9E6"];
function StyleForm({ cv, set }: { cv: CV; set: SetFn }) {
  const L = cv.layout;
  const el = L.template === "elegant";
  const up = (p: Partial<Layout>) => set("layout", { ...L, ...p });
  const us = (p: Partial<Layout>) => up({ ...p, preset: "custom" });
  const pick = (id: string) => {
    if (id === L.template) return;
    set("layout", { ...DEFAULT_LAYOUT, ...TEMPLATES[id].layout, sizeUnit: L.sizeUnit, baseSize: L.baseSize, lineHeight: L.lineHeight, paraGap: L.paraGap,
      order: L.order, hidden: L.hidden, photoX: L.photoX, photoY: L.photoY, photoZoom: L.photoZoom, photoRot: L.photoRot, panel: L.panel, ratingStyle: L.ratingStyle });
  };
  const num = (e: { target: { value: string } }) => parseFloat(e.target.value);
  const show = (x: number) => (Number.isFinite(x) ? x : "");
  const b = clamp(L.baseSize, L.sizeUnit === "px" ? 10 : 8, L.sizeUnit === "px" ? 22 : 16, 12);
  const sz = (m: number) => `${Math.round(b * m * 10) / 10}${L.sizeUnit}`;
  return (
    <>
      <div className="cv-block">
        <div className="cv-block-h"><h3>Template</h3></div>
        <div className="cv-pres">
          {Object.entries(TEMPLATES).map(([id, t]) => (
            <button key={id} type="button" className={`cv-tpl${L.template === id ? " on" : ""}`} onClick={() => pick(id)}>
              <b>{t.label}</b><span>{t.blurb}</span>
            </button>
          ))}
        </div>
        <p className="cv-sub" style={{ marginTop: 6 }}>Switching template resets colours, margins, header and footer. Your text size and spacing are kept.</p>
      </div>

      {!el && (
        <div className="cv-block">
          <div className="cv-block-h"><h3>Style set</h3></div>
          <div className="cv-pres">
            {Object.entries(PRESETS).map(([id, p]) => (
              <button key={id} type="button" className={`cv-pre${L.preset === id ? " on" : ""}`} onClick={() => up({ ...p.style, preset: id })}>
                <b style={{ fontFamily: p.style.font === "dmsans" ? "DM Sans, system-ui" : "Times New Roman, serif", color: p.style.accent }}>Aa</b>
                <span>{p.label}</span>
              </button>
            ))}
            {L.preset === "custom" && <span className="cv-tag" style={{ alignSelf: "center" }}>Custom</span>}
          </div>
        </div>
      )}

      <div className="cv-grid" style={{ marginBottom: 14 }}>
        <Swatches label="Accent colour" value={L.accent} options={ACCENTS} onPick={c => us({ accent: c })} />
        <Swatches label="Headings and name colour" value={L.textColor} options={TEXTS} onPick={c => us({ textColor: c })} />
        <Swatches label="Body text colour" value={L.bodyColor} options={BODY_TEXTS} onPick={c => us({ bodyColor: c })} />
        {el && <Swatches label="Sidebar colour" value={L.panel} options={PANELS} onPick={c => us({ panel: c })} />}
      </div>
      <div className="cv-grid">
        <Field label="Font">
          <select value={L.font} onChange={e => us({ font: e.target.value as Layout["font"] })}>
            <option value="times">Times New Roman</option><option value="dmsans">DM Sans Medium</option>
          </select>
        </Field>
        <Field label="Name colour">
          <select value={L.nameColor} onChange={e => us({ nameColor: e.target.value as Layout["nameColor"] })}><option value="text">Heading colour</option><option value="accent">Accent colour</option></select>
        </Field>
        <Field label="Heading colour">
          <select value={L.headColor} onChange={e => us({ headColor: e.target.value as Layout["headColor"] })}><option value="text">Heading colour</option><option value="accent">Accent colour</option></select>
        </Field>
        <Field label="Heading capitals">
          <select value={L.headCase} onChange={e => us({ headCase: e.target.value as Layout["headCase"] })}><option value="upper">ALL CAPS</option><option value="none">Normal case</option></select>
        </Field>
        {!el && (
          <Field label="Line under headings">
            <select value={L.rule} onChange={e => us({ rule: e.target.value as Layout["rule"] })}><option value="none">None</option><option value="short">Short</option><option value="full">Full width</option></select>
          </Field>
        )}
        {el && (
          <Field label="Skill rating style">
            <select value={L.ratingStyle} onChange={e => us({ ratingStyle: e.target.value as Layout["ratingStyle"] })}><option value="stars">Stars</option><option value="bars">Bars</option><option value="dots">Dots</option></select>
          </Field>
        )}
        <Field label="Dates, institutions and contact line">
          <select value={L.detailColor} onChange={e => us({ detailColor: e.target.value as Layout["detailColor"] })}><option value="text">Body colour</option><option value="muted">Softer</option><option value="accent">Accent colour</option></select>
        </Field>
        {!el && (
          <Field label="Name and contact alignment">
            <select value={L.align} onChange={e => us({ align: e.target.value as Layout["align"] })}><option value="center">Centred</option><option value="left">Left</option></select>
          </Field>
        )}
      </div>

      <div className="cv-block" style={{ marginTop: 20 }}>
        <div className="cv-block-h"><h3>Text and spacing</h3></div>
        <div className="cv-grid">
          <Field label="Body text size"><input type="number" step={0.5} value={show(L.baseSize)} onChange={e => up({ baseSize: num(e) })} /></Field>
          <Field label="Size unit">
            <select value={L.sizeUnit} onChange={e => up({ sizeUnit: e.target.value as Layout["sizeUnit"] })}><option value="px">px</option><option value="pt">pt (as in Word)</option></select>
          </Field>
          <Field label="Line spacing inside paragraphs"><input type="number" min={1} max={3} step={0.05} value={show(L.lineHeight)} onChange={e => up({ lineHeight: num(e) })} /></Field>
          <Field label="Space between paragraphs and headings (lines)"><input type="number" min={0} max={3} step={0.25} value={show(L.paraGap)} onChange={e => up({ paraGap: num(e) })} /></Field>
        </div>
        <p className="cv-tip" style={{ margin: "10px 0 0" }}>Other sizes follow the body size: name {sz(SCALE.name)}, headings {sz(SCALE.heading)}, contact line {sz(SCALE.small)}, header and footer {sz(SCALE.hf)}.</p>
      </div>
    </>
  );
}

/* ── Page step ── */
function HF({ title, on, vals, onToggle, onVals }: { title: string; on: boolean; vals: Trio; onToggle: (b: boolean) => void; onVals: (v: Trio) => void }) {
  return (
    <div className="cv-card">
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
        <input type="checkbox" checked={on} onChange={e => onToggle(e.target.checked)} /> Show {title.toLowerCase()} text on every page
      </label>
      {on && (
        <>
          <div className="cv-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginTop: 10 }}>
            {["Left", "Centre", "Right"].map((l, n) => (
              <Field key={l} label={l}><input value={vals[n]} onChange={e => { const v = [...vals] as Trio; v[n] = e.target.value; onVals(v); }} /></Field>
            ))}
          </div>
          <p className="cv-sub" style={{ margin: "8px 0 0" }}>Placeholders: {"{name}"}, {"{email}"}, {"{phone}"}, {"{date}"}, {"{page}"}, {"{pages}"}.</p>
        </>
      )}
    </div>
  );
}

function PageForm({ cv, set }: { cv: CV; set: SetFn }) {
  const L = cv.layout;
  const up = (p: Partial<Layout>) => set("layout", { ...L, ...p });
  const num = (e: { target: { value: string } }) => parseFloat(e.target.value);
  const show = (x: number) => (Number.isFinite(x) ? x : "");
  return (
    <>
      <OrderForm cv={cv} set={set} />
      <div className="cv-block">
        <div className="cv-block-h"><h3>Margins</h3></div>
        <div className="cv-grid">
          <Field label="Side margins (mm)"><input type="number" min={10} max={35} value={show(L.marginX)} onChange={e => up({ marginX: num(e) })} /></Field>
          <Field label="Top and bottom margins (mm)"><input type="number" min={12} max={35} value={show(L.marginY)} onChange={e => up({ marginY: num(e) })} /></Field>
        </div>
      </div>

      <div className="cv-block">
        <div className="cv-block-h"><h3>Photo</h3></div>
        {!cv.photo && <p className="cv-empty">Upload a photo in the Contact step to use these settings. Zoom, rotate and drag it there.</p>}
        <div className="cv-grid">
          {L.template !== "elegant" && <Field label="Position">
            <select value={L.photoPos} onChange={e => up({ photoPos: e.target.value as Layout["photoPos"] })}><option value="right">Right of name</option><option value="left">Left of name</option><option value="top">Above name</option></select>
          </Field>}
          <Field label="Shape">
            <select value={L.photoShape} onChange={e => up({ photoShape: e.target.value as Layout["photoShape"] })}><option value="circle">Circle</option><option value="rounded">Rounded square</option><option value="square">Square</option></select>
          </Field>
          <Field label="Size (mm)"><input type="number" min={20} max={45} value={show(L.photoSize)} onChange={e => up({ photoSize: num(e) })} /></Field>
          {L.template === "elegant" && (
            <>
              <Field label="Move sideways (mm)"><input type="number" min={-25} max={25} value={show(L.frameDx)} onChange={e => up({ frameDx: num(e) })} /></Field>
              <Field label="Move up or down (mm)"><input type="number" min={-25} max={25} value={show(L.frameDy)} onChange={e => up({ frameDy: num(e) })} /></Field>
            </>
          )}
        </div>
      </div>

      <div className="cv-block">
        <div className="cv-block-h"><h3>Page numbers</h3></div>
        <div className="cv-grid">
          <Field label="Format">
            <select value={L.pn} onChange={e => up({ pn: e.target.value as Layout["pn"] })}>
              <option value="none">None</option><option value="n">1</option><option value="page-n">Page 1</option><option value="page-n-of-N">Page 1 of 3</option><option value="n-of-N">1 / 3</option>
            </select>
          </Field>
          <Field label="Position in footer">
            <select value={L.pnPos} onChange={e => up({ pnPos: Number(e.target.value) as Layout["pnPos"] })}><option value={0}>Left</option><option value={1}>Centre</option><option value={2}>Right</option></select>
          </Field>
        </div>
      </div>

      <div className="cv-block">
        <div className="cv-block-h"><h3>Header and footer</h3><span className="cv-tag">Both off by default</span></div>
        {L.template === "elegant" && (
          <label style={{ display: "flex", gap: 8, alignItems: "center", margin: "0 0 10px" }}>
            <input type="checkbox" checked={L.runHead} onChange={e => up({ runHead: e.target.checked })} /> Running head on pages 2+ (name and section)
          </label>
        )}
        <HF title="Header" on={L.headerOn} vals={L.header} onToggle={b => up({ headerOn: b })} onVals={v => up({ header: v })} />
        <HF title="Footer" on={L.footerOn} vals={L.footer} onToggle={b => up({ footerOn: b })} onVals={v => up({ footer: v })} />
      </div>
    </>
  );
}

/* ── Photo editor: drag to move, sliders to zoom and rotate ── */
function PhotoEditor({ cv, set }: { cv: CV; set: SetFn }) {
  const L = cv.layout;
  const drag = useRef<{ sx: number; sy: number; x: number; y: number } | null>(null);
  const SIZE = 190;
  const up = (p: Partial<Layout>) => set("layout", { ...L, ...p });
  const radius = L.photoShape === "circle" ? "50%" : L.photoShape === "rounded" ? "12%" : "0";
  const t = `translate(${L.photoX}%,${L.photoY}%) rotate(${L.photoRot}deg) scale(${L.photoZoom})`;
  const slider = (v: number, min: number, max: number, step: number, on: (n: number) => void) =>
    <input type="range" min={min} max={max} step={step} value={v} onChange={e => on(parseFloat(e.target.value))} style={{ padding: 0, border: "none" }} />;
  return (
    <div className="cv-card" style={{ marginTop: 10 }}>
      <div className="cv-photo-ed">
        <div className="cv-crop" style={{ width: SIZE, height: SIZE, borderRadius: radius }}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { sx: e.clientX, sy: e.clientY, x: L.photoX, y: L.photoY }; }}
          onPointerMove={e => { const d = drag.current; if (d) up({ photoX: clamp(d.x + ((e.clientX - d.sx) / SIZE) * 100, -80, 80, 0), photoY: clamp(d.y + ((e.clientY - d.sy) / SIZE) * 100, -80, 80, 0) }); }}
          onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cv.photo} alt="" draggable={false} style={{ transform: t }} />
        </div>
        <div style={{ flex: 1, minWidth: 200, display: "grid", gap: 10 }}>
          <span className="cv-sub" style={{ margin: 0 }}>Drag the photo to move it inside the frame.</span>
          <Field label={`Zoom (${L.photoZoom.toFixed(2)}×)`}>{slider(L.photoZoom, 1, 3, 0.05, n => up({ photoZoom: n }))}</Field>
          <Field label={`Rotate (${L.photoRot}°)`}>{slider(L.photoRot, -45, 45, 1, n => up({ photoRot: n }))}</Field>
          <button type="button" className="cv-ghost" style={{ margin: 0, width: "fit-content" }} onClick={() => up({ photoX: 0, photoY: 0, photoZoom: 1, photoRot: 0 })}>Reset photo</button>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar step ── */
function SidebarForm({ cv, set }: { cv: CV; set: SetFn }) {
  const blocks = cv.sidebar;
  const [kind, setKind] = useState<SideType>("text");
  const upd = (id: string, p: Partial<SideBlock>) => set("sidebar", blocks.map(b => (b.id === id ? { ...b, ...p } : b)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const n = [...blocks]; [n[i], n[j]] = [n[j], n[i]]; set("sidebar", n);
  };
  return (
    <>
      {cv.layout.template !== "elegant" && (
        <div className="cv-alert"><AlertTriangle size={16} style={{ flex: "none", marginTop: 3 }} /><div>The sidebar belongs to the Elegant template. Pick it in the Style step to see these blocks on the page. Your content is kept.</div></div>
      )}
      {blocks.map((b, i) => {
        const T = SIDE_TYPES[b.type];
        return (
          <div className="cv-card" key={b.id} style={{ opacity: b.show ? 1 : 0.6 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
              <Field label={`Block title · ${T.label}`}><input value={b.title} placeholder="Leave empty for no title" onChange={e => upd(b.id, { title: e.target.value })} /></Field>
              <button type="button" className="cv-ib" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
              <button type="button" className="cv-ib" aria-label="Move down" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
              <button type="button" className="cv-ib" aria-label={b.show ? "Hide block" : "Show block"} onClick={() => upd(b.id, { show: !b.show })}>{b.show ? <Eye size={14} /> : <EyeOff size={14} />}</button>
              <button type="button" className="cv-ib" aria-label="Remove block" onClick={() => set("sidebar", blocks.filter(x => x.id !== b.id))}><Trash2 size={14} /></button>
            </div>
            {T.auto
              ? <p className="cv-sub" style={{ margin: "8px 0 0" }}>{T.auto}</p>
              : (
                <div style={{ marginTop: 10 }}>
                  <Field label={T.hint ?? ""}><textarea rows={4} placeholder={T.ph} value={b.text} onChange={e => upd(b.id, { text: e.target.value })} /></Field>
                </div>
              )}
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
        <Field label="Add a block">
          <select value={kind} onChange={e => setKind(e.target.value as SideType)}>
            {(Object.keys(SIDE_TYPES) as SideType[]).map(t => <option key={t} value={t}>{SIDE_TYPES[t].label}</option>)}
          </select>
        </Field>
        <button type="button" className="cv-ghost" style={{ margin: 0 }} onClick={() => set("sidebar", [...blocks, mkBlock(kind)])}><Plus size={14} /> Add block</button>
      </div>
      <p className="cv-sub" style={{ marginTop: 10 }}>Blocks that don't fit under the photo continue in the sidebar of the next page.</p>
    </>
  );
}

/* ── Section order and visibility (Page step) ── */
function OrderForm({ cv, set }: { cv: CV; set: SetFn }) {
  const L = cv.layout;
  const full = [...L.order.filter(id => SECTIONS[id]), ...ORDER_DEFAULT.filter(id => !L.order.includes(id))];
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= full.length) return;
    const n = [...full]; [n[i], n[j]] = [n[j], n[i]]; set("layout", { ...L, order: n });
  };
  const toggle = (id: string) => set("layout", { ...L, order: full, hidden: L.hidden.includes(id) ? L.hidden.filter(x => x !== id) : [...L.hidden, id] });
  return (
    <div className="cv-block">
      <div className="cv-block-h"><h3>Section order</h3><span className="cv-tag">Optional</span></div>
      {full.map((id, i) => {
        const off = L.hidden.includes(id);
        return (
          <div className="cv-row" key={id} style={{ opacity: off ? 0.55 : 1 }}>
            <span>{SECTIONS[id]}{id === "languages" && L.template === "elegant" ? " (sidebar in Elegant)" : ""}</span>
            <span className="cv-row-b">
              <button type="button" className="cv-ib" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
              <button type="button" className="cv-ib" aria-label="Move down" disabled={i === full.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
              <button type="button" className="cv-ib" aria-label={off ? "Show section" : "Hide section"} onClick={() => toggle(id)}>{off ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── CV strength coach ── */
const VERBS = new Set("led built ran wrote drove won grew cut set made took taught lead build design develop create implement reduce improve manage deploy architect configure optimise optimize automate analyse analyze launch deliver engineer integrate migrate research prototype train found operate conduct advise help support collaborate streamline spearhead establish".split(" "));
function coach(cv: CV, pages: number) {
  const bullets: string[] = [];
  (["experience", "projects", "education", "competitions", "volunteering", "awards"] as ListKey[]).forEach(k =>
    cv[k].forEach(e => Array.from(e.body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).forEach(m => { const t = plain(m[1]); if (t) bullets.push(t); })));
  const first = (t: string) => (t.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z-]/g, "");
  const verbOk = bullets.filter(b => /ed$/.test(first(b)) || VERBS.has(first(b))).length;
  const numOk = bullets.filter(b => /\d/.test(b)).length;
  const words = plain(cv.summary) ? plain(cv.summary).split(/\s+/).length : 0;
  const skillCount = cv.skills.filter(x => x.group.trim() && x.items.trim()).reduce((n, x) => n + x.items.split(",").filter(t => t.trim()).length, 0);
  const items = [
    { pts: 15, ok: words >= 40 && words <= 80, label: "Summary of 40 to 80 words", tip: words ? `Yours has ${words} words.` : "Add a short summary of who you are and what you offer." },
    { pts: 15, ok: cv.links.some(l => l.url.trim()), label: "A portfolio or profile link", tip: "Add LinkedIn, GitHub or a portfolio link." },
    { pts: 20, ok: cv.experience.filter(used).length + cv.projects.filter(used).length >= 2, label: "At least two experience or project entries", tip: "Proof of work matters most. Projects count if you have little job experience." },
    { pts: 15, ok: bullets.length >= 3 && verbOk / bullets.length >= 0.6, label: "Bullets start with action verbs", tip: "Begin bullets with words like Built, Led or Reduced." },
    { pts: 15, ok: bullets.length >= 3 && numOk / bullets.length >= 0.3, label: "Numbers in your bullets", tip: "Add figures: users served, percent improved, time saved." },
    { pts: 10, ok: skillCount >= 8, label: "At least eight skills listed", tip: "List the tools and languages you can use today." },
    { pts: 10, ok: pages <= 2, label: "Two pages or fewer", tip: `Your CV runs to ${pages} pages. Trim older or minor items.` },
  ];
  return { score: items.reduce((n, x) => n + (x.ok ? x.pts : 0), 0), items };
}
function Coach({ cv, pages }: { cv: CV; pages: number }) {
  const r = useMemo(() => coach(cv, pages), [cv, pages]);
  const tone = r.score >= 80 ? "var(--ok)" : r.score >= 50 ? "var(--warn)" : "var(--bad)";
  return (
    <details className="cv-coach">
      <summary><span>CV strength</span><span style={{ color: tone }}>{r.score} / 100</span></summary>
      <div className="cv-meter" style={{ marginTop: 8 }}><i style={{ width: `${r.score}%`, background: tone }} /></div>
      <ul>
        {r.items.map(it => (
          <li key={it.label}>
            {it.ok ? <Check size={14} color="#047857" style={{ flex: "none", marginTop: 3 }} /> : <span style={{ width: 14, flex: "none", textAlign: "center", color: "#B45309" }}>•</span>}
            <span>{it.label}{!it.ok && <small>{it.tip}</small>}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ───────────────────────────── MAIN ───────────────────────────── */
export type CvEditorProps = {
  value: CV;
  onChange: (cv: CV) => void;
  onDownload?: () => void;   // default: open the print dialog
  downloadLabel?: string;
  watermark?: boolean | WmConfig;   // public site: the watermark settings until paid, false once paid
  toolbar?: ReactNode;       // extra controls above the steps (admin library, etc.)
  stickyTop?: number;        // px offset of the sticky preview (use ~100 under a fixed navbar)
  showPreview?: boolean;   // default true; the public page turns it off and draws its own bigger preview
  pages?: number;     // page count from an external preview (used by the strength coach)
};

export default function CvEditor({ value: cv, onChange, onDownload, downloadLabel = "Save as PDF", watermark = false, toolbar, stickyTop = 12, showPreview = true, pages: pagesProp }: CvEditorProps) {
  const [i, setI] = useState(0);
  const [left, setLeft] = useState<number[]>([]);
  const [pages, setPages] = useState(1);
  const [msg, setMsg] = useState("");
  const pageCount = pagesProp ?? pages;

  useEffect(() => {
    const on = (e: MessageEvent) => { if (e.data && typeof e.data.cvPages === "number") setPages(e.data.cvPages); };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);

  // Latest CV in a ref, so two set() calls in a row (like the photo upload) don't overwrite each other.
  const latest = useRef(cv);
  latest.current = cv;
  const set: SetFn = (k, v) => {
    latest.current = { ...latest.current, [k]: v };
    onChange(latest.current);
  };
  const download = onDownload ?? (() => printPdf(cv));

  const probs = useMemo(() => problems(cv), [cv]);
  const html = useMemo(() => {
    try { return buildCvHtml(cv, true, watermark); } catch { return ""; }
  }, [cv, watermark]);
  const previewHtml = useDebounced(html, 300);
  const step = STEPS[i];
  const stepProbs = (s: Step) => s.keys.flatMap(k => probs[k] ?? []);
  const hasContent = (s: Step) =>
    s.id === "personal" ? !!cv.name.trim() : s.id === "summary" ? !!plain(cv.summary)
    : s.id === "skills" ? cv.skills.some(x => x.group.trim() || x.items.trim()) : (s.lists ?? []).some(k => cv[k].some(used));
  const status = (s: Step): "done" | "todo" | "fix" | "opt" =>
    s.required ? (stepProbs(s).length ? "todo" : "done") : stepProbs(s).length ? "fix" : hasContent(s) ? "done" : "opt";

  const blocking = Object.keys(probs).flatMap(k => probs[k].map(m => ({ k, m })));
  const requiredDone = REQUIRED_KEYS.filter(k => !probs[k]).length;
  const go = (n: number) => { setLeft(l => (l.includes(i) ? l : [...l, i])); setI(Math.max(0, Math.min(STEPS.length - 1, n))); };
  const words = plain(cv.summary) ? plain(cv.summary).split(/\s+/).length : 0;

  const onPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8_000_000) { setMsg("Choose an image file under 8 MB."); return; }
    try { set("photo", await toJpeg(file)); set("layout", { ...latest.current.layout, photoX: 0, photoY: 0, photoZoom: 1, photoRot: 0 }); setMsg(""); } catch { setMsg("Couldn't read that image."); }
  };

  const css = `
  .cv-app{--ink:#0F172A;--muted:#475569;--line:#D5DBE5;--canvas:#EDF0F5;--accent:#0369A1;--ok:#047857;--warn:#B45309;--bad:#B91C1C;font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--canvas);padding:20px;border-radius:14px}
  .cv-app *{box-sizing:border-box}
  .cv-top{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:12px;margin-bottom:14px}
  .cv-top h1{font:700 24px Georgia,serif;margin:0}.cv-top p{margin:2px 0 0;color:var(--muted)}
  .cv-nav{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
  .cv-step{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;font:inherit}
  .cv-step.on{background:var(--ink);color:#fff;border-color:var(--ink)}
  .cv-dot{width:8px;height:8px;border-radius:50%;background:var(--line)}.cv-dot.done{background:var(--ok)}.cv-dot.todo{background:var(--bad)}.cv-dot.fix{background:var(--warn)}
  .cv-main{display:grid;grid-template-columns:${showPreview ? "minmax(0,1fr) 500px" : "minmax(0,1fr)"};gap:18px;align-items:start}
  @media(max-width:1100px){.cv-main{grid-template-columns:1fr}}
  .cv-panel{background:#fff;border:1px solid var(--line);border-radius:12px;padding:20px}
  .cv-panel h2{font:700 20px Georgia,serif;margin:0}
  .cv-tip{color:var(--muted);margin:4px 0 16px;max-width:62ch}
  .cv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  @media(max-width:640px){.cv-grid{grid-template-columns:1fr}}
  .cv-f{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--muted)}
  .cv-f em{font-style:normal;color:var(--bad);margin-left:6px;font-size:11px}
  .cv-f input,.cv-f select,.cv-f textarea{font:inherit;color:var(--ink);padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#fff}
  .cv-f input:focus,.cv-f select:focus,.cv-f textarea:focus,.cv-step:focus-visible,.cv-btn:focus-visible,.cv-ghost:focus-visible,.cv-pre:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
  .cv-block{margin-bottom:22px}.cv-block-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.cv-block-h h3{margin:0;font-size:15px}
  .cv-tag{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--canvas);color:var(--muted)}.cv-tag.req{background:#FEE2E2;color:var(--bad)}
  .cv-card{border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:10px;background:#FAFBFD}
  .cv-sub{display:block;font-size:13px;color:var(--muted);margin-bottom:4px}.cv-empty{color:var(--muted);margin:0 0 8px}
  .cv-ghost{display:inline-flex;align-items:center;gap:6px;border:1px dashed var(--line);background:transparent;color:var(--accent);padding:6px 12px;border-radius:8px;cursor:pointer;font:inherit;margin-top:8px}
  .cv-ghost.danger{color:var(--bad);border-style:solid;margin-left:0}
  .cv-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:9px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;font:inherit;font-weight:600}
  .cv-btn.primary{background:var(--accent);color:#fff;border-color:transparent}.cv-btn:disabled{opacity:.45;cursor:not-allowed}
  .cv-foot{display:flex;justify-content:space-between;gap:10px;margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
  .cv-alert{display:flex;gap:8px;background:#FFFBEB;border:1px solid #FCD34D;color:#78350F;border-radius:10px;padding:10px 12px;margin-bottom:14px}
  .cv-alert ul{margin:2px 0 0;padding-left:18px}
  .cv-side{position:${showPreview ? "sticky" : "static"};top:${stickyTop}px;display:flex;flex-direction:column;gap:12px}
  .cv-prev{border:1px solid var(--line);border-radius:12px;background:#94A3B8;width:100%;overflow:hidden}
  .cv-prev-in{width:794px;height:1060px;transform:scale(.6);transform-origin:top left}.cv-prev-box{width:476px;height:636px;overflow:hidden}
  .cv-prev iframe{width:794px;height:1060px;border:0;display:block}
  .cv-meter{height:6px;border-radius:99px;background:var(--line);overflow:hidden}.cv-meter i{display:block;height:100%;background:var(--ok);transition:width .25s}
  .cv-sw{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .cv-sw button{width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px var(--line);cursor:pointer;padding:0}.cv-sw button.on{box-shadow:0 0 0 2px var(--accent)}
  .cv-sw input{width:34px;height:28px;padding:0;border:none;background:none;cursor:pointer}
  .cv-pres{display:flex;gap:8px;flex-wrap:wrap}
  .cv-pre{display:flex;flex-direction:column;align-items:center;gap:2px;width:96px;padding:10px 6px;border:1px solid var(--line);border-radius:10px;background:#fff;cursor:pointer;font:inherit;color:var(--ink)}
  .cv-pre b{font-size:22px;line-height:1}.cv-tpl{display:flex;flex-direction:column;gap:4px;text-align:left;width:250px;padding:12px;border:1px solid var(--line);border-radius:10px;background:#fff;cursor:pointer;font:inherit;color:var(--ink)}.cv-tpl span{font-size:12px;color:var(--muted)}.cv-tpl.on{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}.cv-tpl:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
  .cv-lib{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.cv-lib select{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);max-width:220px}
  .cv-ib{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);cursor:pointer;flex:none}.cv-ib:disabled{opacity:.35;cursor:not-allowed}.cv-ib:focus-within,.cv-ib:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
  .cv-row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;background:#fff}.cv-row-b{display:flex;gap:4px}
  .cv-photo-ed{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}.cv-crop{position:relative;overflow:hidden;cursor:grab;touch-action:none;background:#ddd;border:1px solid var(--line);flex:none}.cv-crop:active{cursor:grabbing}
  .cv-crop img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;user-select:none;pointer-events:none}
  .cv-coach{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 14px}.cv-coach summary{cursor:pointer;font-weight:600;display:flex;justify-content:space-between}
  .cv-coach ul{list-style:none;margin:10px 0 0;padding:0}.cv-coach li{display:flex;gap:8px;font-size:13px;margin-bottom:6px}.cv-coach li small{display:block;color:var(--muted)}
  .cv-pre.on{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}
  .cv-photo{display:flex;gap:14px;align-items:center}.cv-photo img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:1px solid var(--line)}`;

  return (
    <div className="cv-app">
      <style>{css}</style>
      <div className="cv-top">
        <div>
          <h1>CV builder</h1>
          <p>Fill each section, watch the pages build on the right, then save as a PDF.</p>
        </div>
        <div style={{ minWidth: 220 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{requiredDone} of {REQUIRED_KEYS.length} required sections complete</div>
          <div className="cv-meter"><i style={{ width: `${(requiredDone / REQUIRED_KEYS.length) * 100}%` }} /></div>
        </div>
      </div>

      {toolbar}

      <div className="cv-nav" role="tablist" aria-label="CV sections">
        {STEPS.map((s, n) => {
          const st = status(s);
          return (
            <button key={s.id} type="button" role="tab" aria-selected={n === i} className={`cv-step${n === i ? " on" : ""}`} onClick={() => go(n)}>
              <span className={`cv-dot ${n === i ? "" : st}`} />{s.label}
              {s.required && <small style={{ opacity: 0.7 }}>*</small>}
            </button>
          );
        })}
      </div>

      <div className="cv-main">
        <div className="cv-panel">
          <h2>{step.label} <span className={step.required ? "cv-tag req" : "cv-tag"} style={{ fontFamily: "system-ui", fontSize: 11, verticalAlign: "middle" }}>{step.required ? "Required" : "Optional"}</span></h2>
          <p className="cv-tip">{step.tip}</p>

          {left.includes(i) && stepProbs(step).length > 0 && (
            <div className="cv-alert" role="alert">
              <AlertTriangle size={16} style={{ flex: "none", marginTop: 3 }} />
              <div>Still needed in this section:<ul>{stepProbs(step).map(m => <li key={m}>{m}</li>)}</ul></div>
            </div>
          )}

          {step.id === "personal" && (
            <>
              <div className="cv-grid">
                <Field label="Full name" req><input value={cv.name} onChange={e => set("name", e.target.value)} autoComplete="name" /></Field>
                <Field label="Headline (e.g. Computer Science student, backend and AI)"><input value={cv.headline} onChange={e => set("headline", e.target.value)} /></Field>
                <Field label="Email" req><input type="email" value={cv.email} onChange={e => set("email", e.target.value)} autoComplete="email" /></Field>
                <Field label="Phone" req><input type="tel" value={cv.phone} onChange={e => set("phone", e.target.value)} autoComplete="tel" /></Field>
                <Field label="Location (city, country)" req wide><input value={cv.location} onChange={e => set("location", e.target.value)} /></Field>
                <Field label="Languages, comma-separated (optional)" wide><input placeholder="English (fluent), Swahili (native)" value={cv.languages} onChange={e => set("languages", e.target.value)} /></Field>
              </div>

              <div className="cv-block" style={{ marginTop: 18 }}>
                <div className="cv-block-h"><h3>Photo</h3><span className="cv-tag">Optional</span></div>
                <div className="cv-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {cv.photo && <img src={cv.photo} alt="Your photo" />}
                  <label className="cv-ghost" style={{ margin: 0 }}>
                    <ImagePlus size={14} /> {cv.photo ? "Change photo" : "Upload photo"}
                    <input type="file" accept="image/*" hidden onChange={e => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                  {cv.photo && <button type="button" className="cv-ghost danger" style={{ margin: 0 }} onClick={() => set("photo", "")}><Trash2 size={13} /> Remove</button>}
                </div>
                <p className="cv-sub" style={{ marginTop: 6 }}>{msg || "Many employers prefer CVs without a photo, so add one only if the role or country expects it."}</p>
                {cv.photo && <PhotoEditor cv={cv} set={set} />}
              </div>

              <div className="cv-block">
                <div className="cv-block-h"><h3>Links</h3><span className="cv-tag">Optional</span></div>
                {cv.links.map((l, n) => (
                  <div className="cv-grid" key={n} style={{ marginBottom: 8, gridTemplateColumns: "140px 1fr auto", alignItems: "end" }}>
                    <Field label="Label"><input placeholder="GitHub" value={l.label} onChange={e => set("links", cv.links.map((x, m) => (m === n ? { ...x, label: e.target.value } : x)))} /></Field>
                    <Field label="URL"><input placeholder="https://github.com/…" value={l.url} onChange={e => set("links", cv.links.map((x, m) => (m === n ? { ...x, url: e.target.value } : x)))} /></Field>
                    <button type="button" className="cv-ghost danger" style={{ margin: 0 }} aria-label="Remove link" onClick={() => set("links", cv.links.filter((_, m) => m !== n))}><Trash2 size={13} /></button>
                  </div>
                ))}
                <button type="button" className="cv-ghost" onClick={() => set("links", [...cv.links, { label: "", url: "" }])}><Plus size={14} /> Add link (LinkedIn, GitHub, portfolio)</button>
              </div>
            </>
          )}

          {step.id === "summary" && (
            <>
              <RichEditor theme="light" minHeight={150} placeholder="Write 3–4 sentences about who you are and what you offer…" value={cv.summary} onChange={h => set("summary", h)} />
              <p className="cv-tip" style={{ marginTop: 8, color: words && (words < 30 || words > 90) ? "var(--warn)" : undefined }}>
                {words ? `${words} words${words < 30 ? ". A little short. Add your strongest skill and your goal." : words > 90 ? ". A little long. Trim to your strongest points." : ". Good length."}` : "Skip this if you'd rather let your experience speak first."}
              </p>
            </>
          )}

          {step.id === "skills" && (
            <div className="cv-block">
              {cv.skills.map((s, n) => (
                <div className="cv-grid" key={n} style={{ marginBottom: 8, gridTemplateColumns: "200px 1fr 96px auto", alignItems: "end" }}>
                  <Field label="Group" req><input placeholder="Programming languages" value={s.group} onChange={e => set("skills", cv.skills.map((x, m) => (m === n ? { ...x, group: e.target.value } : x)))} /></Field>
                  <Field label="Items, comma-separated" req><input placeholder="Python, Rust, Kotlin, TypeScript" value={s.items} onChange={e => set("skills", cv.skills.map((x, m) => (m === n ? { ...x, items: e.target.value } : x)))} /></Field>
                  <Field label="Stars (Elegant)">
                    <select value={s.rating || 0} onChange={e => set("skills", cv.skills.map((x, m) => (m === n ? { ...x, rating: Number(e.target.value) } : x)))}>
                      {[0, 1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r === 0 ? "None" : `${r} / 5`}</option>)}
                    </select>
                  </Field>
                  {cv.skills.length > 1 && <button type="button" className="cv-ghost danger" style={{ margin: 0 }} aria-label="Remove skill group" onClick={() => set("skills", cv.skills.filter((_, m) => m !== n))}><Trash2 size={13} /></button>}
                </div>
              ))}
              <button type="button" className="cv-ghost" onClick={() => set("skills", [...cv.skills, { group: "", items: "" }])}><Plus size={14} /> Add skill group</button>
            </div>
          )}

          {step.lists?.map(k => <EntryList key={k} k={k} cv={cv} set={set} />)}
          {step.id === "style" && <StyleForm cv={cv} set={set} />}
          {step.id === "page" && <PageForm cv={cv} set={set} />}
          {step.id === "sidebar" && <SidebarForm cv={cv} set={set} />}

          <div className="cv-foot">
            <button type="button" className="cv-btn" disabled={i === 0} onClick={() => go(i - 1)}><ChevronLeft size={15} /> Back</button>
            {i < STEPS.length - 1
              ? <button type="button" className="cv-btn primary" onClick={() => go(i + 1)}>Next: {STEPS[i + 1].label} <ChevronRight size={15} /></button>
              : <button type="button" className="cv-btn primary" disabled={blocking.length > 0} onClick={download}><Download size={15} /> {downloadLabel}</button>}
          </div>
        </div>

        <aside className="cv-side">
           {showPreview && (
              <>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Preview · {pages} page{pages === 1 ? "" : "s"} (scroll inside the preview to see the rest)</div>
                <div className="cv-prev" aria-label="Live CV preview">
                  <div className="cv-prev-box"><div className="cv-prev-in"><iframe title="CV preview" srcDoc={previewHtml} sandbox="allow-scripts" /></div></div>
                </div>
              </>
            )}
          <button type="button" className="cv-btn primary" disabled={blocking.length > 0} onClick={download}>
            <Download size={15} /> {downloadLabel}
          </button>
          <Coach cv={cv} pages={pageCount} />
          {blocking.length > 0 ? (
            <div className="cv-alert" style={{ marginBottom: 0 }}>
              <AlertTriangle size={16} style={{ flex: "none", marginTop: 3 }} />
              <div>Before you can generate:<ul>{blocking.slice(0, 6).map(b => <li key={b.k + b.m}>{b.m}</li>)}</ul></div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, color: "var(--ok)", alignItems: "center" }}><Check size={15} /> Ready. In the print dialog, choose "Save as PDF".</div>
          )}
        </aside>
      </div>
    </div>
  );
}