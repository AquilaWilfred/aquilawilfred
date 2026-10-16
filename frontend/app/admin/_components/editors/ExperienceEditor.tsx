// app/admin/_components/editors/ExperienceEditor.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Edit,
  Trash2,
  Loader,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";
import { Extras } from "@/types/admin";

interface ExperienceEditorProps {
  extras: Extras;
  onRefresh: () => Promise<void>;
}

export default function ExperienceEditor({
  extras,
  onRefresh,
}: ExperienceEditorProps) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      toast.success("Experience saved!");
      await onRefresh();
      setEditing(null);
    } catch {
      toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      const r = await fetch(`/api/experience/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted");
      await onRefresh();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const toggleVisible = async (exp: any) => {
    const newVal = exp.visible === false ? true : false;
    try {
      const r = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...exp, visible: newVal }),
      });
      if (!r.ok) throw new Error();
      await onRefresh();
      toast.success(newVal ? "Now visible ✓" : "Hidden");
    } catch {
      toast.error("Failed to update.");
    }
  };

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  if (editing)
    return (
      <div className="p-8">
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="max-w-5xl mx-auto space-y-6 w-full">
          <h3 className="text-white font-heading font-bold text-xl">
            Edit Experience
          </h3>

          {[
            { k: "role", l: "Role / Position" },
            { k: "company", l: "Company" },
            { k: "period", l: "Period (e.g. Jan 2023 – Present)" },
            { k: "location", l: "Location" },
          ].map((f) => (
            <div key={f.k} className="p-5 rounded-xl" style={box}>
              <label className="text-white/40 text-xs font-mono block mb-1.5">
                {f.l.toUpperCase()}
              </label>
              <input
                style={inputStyle}
                value={editing[f.k] || ""}
                onChange={(e) => setEditing({ ...editing, [f.k]: e.target.value })}
              />
            </div>
          ))}

          <div className="p-5 rounded-xl" style={box}>
            <label className="text-white/40 text-xs font-mono block mb-1.5">
              HIGHLIGHTS (one per line)
            </label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
              value={
                Array.isArray(editing.highlights)
                  ? editing.highlights.join("\n")
                  : ""
              }
              onChange={(e) =>
                setEditing({
                  ...editing,
                  highlights: e.target.value.split("\n").filter(Boolean),
                })
              }
              placeholder="Each line becomes a bullet point highlight"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer px-1">
            <input
              type="checkbox"
              checked={editing.visible !== false}
              onChange={(e) =>
                setEditing({ ...editing, visible: e.target.checked })
              }
              className="w-4 h-4 accent-sky-500"
            />
            <span className="text-white/60 text-sm">Visible on website</span>
          </label>

          <div className="flex gap-4">
            <button
              onClick={save}
              disabled={saving}
              className={`${btnPrimary} disabled:opacity-60`}
            >
              {saving ? (
                <>
                  <Loader size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save
                </>
              )}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-5 py-2.5 rounded-xl text-white/60 text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );

  // ── LIST MODE ──────────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">
          {extras.experience.length} entries
        </p>
        <button
          onClick={() =>
            setEditing({
              id: Date.now().toString(),
              role: "",
              company: "",
              period: "",
              location: "",
              highlights: [],
              visible: true,
              sort_order: extras.experience.length,
            })
          }
          className={btnPrimary}
        >
          <Plus size={16} /> Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {extras.experience.map((exp: any) => (
          <div
            key={exp.id}
            className="p-6 rounded-2xl group"
            style={{ ...box, opacity: exp.visible === false ? 0.5 : 1 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-heading font-bold">{exp.role}</h4>
                <p className="text-sky-400 font-medium text-sm">{exp.company}</p>
                <p className="text-white/40 text-xs font-mono">
                  {exp.period} · {exp.location}
                </p>
                {exp.visible === false && (
                  <p className="text-amber-400 text-xs font-mono mt-1">
                    ● Hidden from website
                  </p>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleVisible(exp)}
                  className="p-2 rounded-lg text-white/40 hover:text-sky-400"
                >
                  {exp.visible === false ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => setEditing({ ...exp })}
                  className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => del(exp.id)}
                  className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {exp.highlights?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {exp.highlights.slice(0, 2).map((h: string, i: number) => (
                  <li
                    key={i}
                    className="text-white/50 text-xs flex items-start gap-2"
                  >
                    <span className="text-sky-500 mt-0.5">▸</span>
                    {h}
                  </li>
                ))}
                {exp.highlights.length > 2 && (
                  <li className="text-white/30 text-xs">
                    +{exp.highlights.length - 2} more
                  </li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}