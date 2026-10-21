"use client";
import { useEffect, useState } from "react";
import { Copy, Download, Globe, Pencil, Plus, Trash2, Upload } from "lucide-react";
import CvEditor from "@/components/cv/CvEditor";
import { EMPTY, KEY, LIB_KEY, norm, problems, saveFile, uid, type CV, type Lib } from "@/lib/cv/engine";

export default function CvBuilder() {
  const [lib, setLib] = useState<Lib>({ active: "default", items: [{ id: "default", name: "My CV", updated: 0, data: EMPTY }] });
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIB_KEY);
      if (raw) {
        const l = JSON.parse(raw) as Lib;
        if (l.items?.length) setLib({ active: l.items.some(x => x.id === l.active) ? l.active : l.items[0].id, items: l.items.map(x => ({ ...x, data: norm(x.data) })) });
      } else {
        const old = localStorage.getItem(KEY);
        if (old) setLib({ active: "default", items: [{ id: "default", name: "My CV", updated: Date.now(), data: norm(JSON.parse(old)) }] });
      }
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(LIB_KEY, JSON.stringify(lib)); } catch { setMsg("Couldn't save locally. Try a smaller photo or delete an old CV."); }
  }, [lib, ready]);

  const item = lib.items.find(x => x.id === lib.active) ?? lib.items[0];
  const cv = item.data;
  const onChange = (data: CV) =>
    setLib(l => ({ ...l, items: l.items.map(x => (x.id === l.active ? { ...x, updated: Date.now(), data } : x)) }));

  const newCv = () => {
    const name = window.prompt("Name this CV (for example, the job it is for):", "Untitled CV")?.trim();
    if (!name) return;
    const id = uid();
    setLib(l => ({ active: id, items: [...l.items, { id, name, updated: Date.now(), data: norm({}) }] }));
  };
  const duplicateCv = () => {
    const id = uid();
    setLib(l => ({ active: id, items: [...l.items, { id, name: `${item.name} copy`, updated: Date.now(), data: norm(JSON.parse(JSON.stringify(item.data))) }] }));
  };
  const renameCv = () => {
    const name = window.prompt("Rename this CV:", item.name)?.trim();
    if (name) setLib(l => ({ ...l, items: l.items.map(x => (x.id === l.active ? { ...x, name } : x)) }));
  };
  const deleteCv = () => {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    setLib(l => l.items.length === 1
      ? { ...l, items: [{ ...l.items[0], name: "My CV", data: norm({}) }] }
      : { active: l.items.find(x => x.id !== l.active)!.id, items: l.items.filter(x => x.id !== l.active) });
  };
  const publish = async () => {
    if (Object.keys(problems(cv)).length) { setMsg("Finish the required sections before publishing."); return; }
    try {
      const r = await fetch("/api/cv", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name, data: cv }),
      });
      setMsg(r.ok ? `Published "${item.name}" to your portfolio.` : "Couldn't publish. Check you're signed in.");
    } catch { setMsg("Couldn't reach the server."); }
  };
  const exportCv = () => saveFile(`${item.name.replace(/[^\w-]+/g, "_") || "cv"}.json`, "application/json", JSON.stringify({ app: "cv-builder", version: 1, name: item.name, data: item.data }));
  const importCv = async (file?: File) => {
    if (!file) return;
    try {
      const j = JSON.parse(await file.text());
      const d = j?.data ?? j;
      if (!d || typeof d !== "object" || !("education" in d)) throw new Error("bad");
      const id = uid();
      setLib(l => ({ active: id, items: [...l.items, { id, name: String(j.name || "Imported CV"), updated: Date.now(), data: norm(d) }] }));
      setMsg("");
    } catch { setMsg("That file isn't a backup made by this builder."); }
  };

  if (!ready) return null;

  const toolbar = (
    <div className="cv-lib" role="group" aria-label="My CVs">
      <select aria-label="Choose a CV" value={lib.active} onChange={e => setLib(l => ({ ...l, active: e.target.value }))}>
        {lib.items.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <button type="button" className="cv-ib" title="New CV" aria-label="New CV" onClick={newCv}><Plus size={14} /></button>
      <button type="button" className="cv-ib" title="Duplicate this CV" aria-label="Duplicate this CV" onClick={duplicateCv}><Copy size={14} /></button>
      <button type="button" className="cv-ib" title="Rename" aria-label="Rename this CV" onClick={renameCv}><Pencil size={14} /></button>
      <button type="button" className="cv-ib" title="Delete" aria-label="Delete this CV" onClick={deleteCv}><Trash2 size={14} /></button>
      <button type="button" className="cv-ib" title="Publish to portfolio" aria-label="Publish to portfolio" onClick={publish}><Globe size={14} /></button>
      <button type="button" className="cv-ib" title="Export a backup file" aria-label="Export a backup file" onClick={exportCv}><Download size={14} /></button>
      <label className="cv-ib" title="Import a backup file" aria-label="Import a backup file" style={{ cursor: "pointer" }}>
        <Upload size={14} /><input type="file" accept="application/json,.json" hidden onChange={e => { importCv(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      <span className="cv-sub" style={{ margin: 0 }}>{msg || "Saved in this browser. Keep a backup file for safety."}</span>
    </div>
  );

  // key resets the step tabs when you switch CVs
  return <CvEditor key={lib.active} value={cv} onChange={onChange} toolbar={toolbar} />;
}