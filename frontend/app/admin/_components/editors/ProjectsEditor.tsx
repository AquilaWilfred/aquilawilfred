// app/admin/_components/editors/ProjectsEditor.tsx

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  X,
  Edit,
  Trash2,
  Upload,
  Loader,
  Star,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import RichEditor from "@/components/editor/RichEditor";
import ImagePrep from "@/components/editor/ImagePrep";
import { useImageWithPrep } from "@/hooks/useImageWithPrep";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";

interface ProjectsEditorProps {
  data: any;
  onRefresh: () => Promise<void>;
}

export default function ProjectsEditor({ data, onRefresh }: ProjectsEditorProps) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const { uploading, prepSrc, startUpload, confirmAndUpload, cancelPrep } =
    useImageWithPrep();

  const onDrop = useCallback(
    (files: File[]) => {
      if (!files[0] || !editing) return;
      startUpload(files[0], (url: string) =>
        setEditing((e: any) => ({ ...e, image: url }))
      );
    },
    [editing, startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const generateAIDescription = async () => {
    if (!editing) return;
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/ai/generate_description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title || editing.githubTitle,
          tech: editing.tech || [],
          category: editing.category,
          githubUrl: editing.github,
        }),
      });

      const { description, longDesc } = await res.json();
      if (description) {
        setEditing((prev: any) => ({
          ...prev,
          description,
          longDesc: longDesc || description,
          isAIGenerated: true,
        }));
        toast.success("AI description generated!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch {
      toast.error("AI generation failed");
    } finally {
      setGeneratingAI(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        id: editing.id,
        githubId: editing.githubId || editing.id,
        title: editing.title,
        githubTitle: editing.githubTitle,
        image: editing.image,
        live: editing.live,
        description: editing.description,
        longDesc: editing.longDesc,
        featured: editing.featured,
        isCustomized: true,
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast.success("Project customization saved!");
      await onRefresh();
      setEditing(null);
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Remove customization? (GitHub data will still show)")) return;
    try {
      const r = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Customization removed");
      await onRefresh();
    } catch {
      toast.error("Delete failed.");
    }
  };

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="p-8">
        {prepSrc && (
          <ImagePrep src={prepSrc} onConfirm={confirmAndUpload} onCancel={cancelPrep} />
        )}

        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="max-w-5xl mx-auto space-y-6 w-full">
          <div>
            <h3 className="text-white font-heading font-bold text-xl">
              Customize Project
            </h3>
            <p className="text-white/40 text-sm mt-1">
              Only these fields are editable. Everything else comes from GitHub.
            </p>
          </div>

          {/* Image */}
          <div className="p-5 rounded-xl" style={box}>
            <label className="text-white/40 text-xs font-mono block mb-2">
              DISPLAY IMAGE
            </label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
              style={{
                borderColor: isDragActive ? "#38BDF8" : "rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-sky-400">
                  <Loader size={18} className="animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : editing.image ? (
                <div>
                  <Image
                    src={editing.image}
                    alt=""
                    width={400}
                    height={160}
                    className="w-full h-82 p-b-5 object-cover rounded-lg mb-2"
                  />
                  <p className="text-white/30 text-xs">Drag to replace</p>
                </div>
              ) : (
                <div>
                  <Upload size={24} className="text-white/30 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">Drag & drop or click</p>
                </div>
              )}
            </div>
            <input
              style={{ ...inputStyle, marginTop: 8, fontSize: 12 }}
              value={editing.image || ""}
              onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              placeholder="Or paste image URL directly"
            />
          </div>

          {/* Display Title */}
          <div>
            <label className="text-white/40 text-xs font-mono block mb-1.5">
              DISPLAY TITLE (shown in parentheses)
            </label>
            <input
              style={inputStyle}
              value={editing.title || ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="e.g. Smart Analytics Dashboard"
            />
            {editing.githubTitle && (
              <p className="text-white/30 text-xs mt-1.5">
                Main title from GitHub:{" "}
                <span className="text-white/60">{editing.githubTitle}</span>
              </p>
            )}
          </div>

          {/* Live URL */}
          <div>
            <label className="text-white/40 text-xs font-mono block mb-1.5">
              LIVE / DEMO URL
            </label>
            <input
              style={inputStyle}
              value={editing.live || ""}
              onChange={(e) => setEditing({ ...editing, live: e.target.value })}
              placeholder="https://your-project.vercel.app"
            />
          </div>

          {/* Short Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-white/40 text-xs font-mono">
                SHORT DESCRIPTION
              </label>
              <button
                onClick={generateAIDescription}
                disabled={generatingAI}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#A78BFA",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                {generatingAI ? (
                  <>
                    <Loader size={12} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} /> AI Generate
                  </>
                )}
              </button>
            </div>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  description: e.target.value,
                  isAIGenerated: false,
                })
              }
              placeholder="Short description for the card..."
            />
            {editing.isAIGenerated && (
              <p className="text-violet-400/70 text-xs mt-1 flex items-center gap-1">
                <Sparkles size={10} /> AI-generated description
              </p>
            )}
          </div>

          {/* Full Description */}
          <div>
            <label className="text-white/40 text-xs font-mono block mb-1.5">
              FULL DESCRIPTION
            </label>
            <RichEditor
              value={editing.longDesc || ""}
              onChange={(v) => setEditing({ ...editing, longDesc: v })}
              placeholder="Detailed description..."
              minHeight={500}
              showCodeCanvas
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!editing.featured}
              onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              className="w-4 h-4 accent-sky-500"
            />
            <span className="text-white/60 text-sm">Mark as featured</span>
          </label>

          {/* GitHub read-only */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-white/30 text-xs font-mono mb-2">
              FROM GITHUB (read-only)
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-white/40">Category:</span>{" "}
                <span className="text-white/70">{editing.category || "—"}</span>
              </div>
              <div>
                <span className="text-white/40">Tech:</span>{" "}
                <span className="text-white/70">
                  {Array.isArray(editing.tech) ? editing.tech.join(", ") : "—"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-white/40">GitHub:</span>{" "}
                <a
                  href={editing.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {editing.github}
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button onClick={save} disabled={saving} className={`${btnPrimary} disabled:opacity-60`}>
              {saving ? (
                <>
                  <Loader size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save Customization
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
  }

  // ── LIST MODE ──────────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 text-sm">{data.projects.length} projects</p>
          <p className="text-white/25 text-xs mt-0.5">
            Data from GitHub · Click edit to customize image, title & live URL
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {data.projects.map((p: any) => (
          <div key={p.id} className="flex gap-4 p-5 rounded-2xl group" style={box}>
            <Image
              src={p.image}
              alt={p.title}
              width={80}
              height={80}
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-semibold text-sm truncate">
                  {p.githubTitle || p.title}
                  {p.title && p.title !== p.githubTitle && (
                    <span className="text-white/40 font-normal"> ({p.title})</span>
                  )}
                </h4>
                {p.featured && <Star size={12} className="text-amber-400" />}
              </div>

              {p.githubTitle && p.githubTitle !== p.title && (
                <p className="text-white/30 text-xs mb-1">({p.githubTitle})</p>
              )}

              <p className="text-white/40 text-xs truncate mb-2">{p.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(14,165,233,0.15)", color: "#38BDF8" }}
                >
                  {p.category}
                </span>
                {p.live && p.live !== "#" && (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 font-mono hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> Live
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() =>
                  setEditing({ ...p, githubTitle: p.githubTitle || p.title })
                }
                className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"
              >
                <Edit size={15} />
              </button>
              <button
                onClick={() => del(p.id)}
                className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}