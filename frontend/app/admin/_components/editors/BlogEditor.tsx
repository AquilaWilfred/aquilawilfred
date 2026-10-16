// app/admin/_components/editors/BlogEditor.tsx

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Edit,
  Trash2,
  Upload,
  Loader,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import RichEditor from "@/components/editor/RichEditor";
import ImagePrep from "@/components/editor/ImagePrep";
import { useImageWithPrep } from "@/hooks/useImageWithPrep";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";

interface BlogEditorProps {
  data: any;
  onRefresh: () => Promise<void>;
}

export default function BlogEditor({ data, onRefresh }: BlogEditorProps) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
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

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      toast.success("Post saved!");
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
      const r = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted");
      await onRefresh();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const toggle = async (post: any) => {
    const newVisible = post.published !== true;
    try {
      const r = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, published: newVisible }),
      });
      if (!r.ok) throw new Error();
      await onRefresh();
      toast.success(newVisible ? "Published! ✓" : "Unpublished");
    } catch {
      toast.error("Failed to update.");
    }
  };

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  if (editing)
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
          <h3 className="text-white font-heading font-bold text-xl">
            Edit Blog Post
          </h3>

          {/* Cover image */}
          <div className="p-5 rounded-xl" style={box}>
            <label className="text-white/40 text-xs font-mono block mb-2">
              COVER IMAGE
            </label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer"
              style={{
                borderColor: isDragActive ? "#38BDF8" : "rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-sky-400">
                  <Loader size={16} className="animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : editing.image ? (
                <div>
                  <Image
                    src={editing.image}
                    alt=""
                    width={400}
                    height={96}
                    className="w-full h-80 object-cover rounded-lg mb-1"
                  />
                  <p className="text-white/30 text-xs">Drag to replace</p>
                </div>
              ) : (
                <div>
                  <Upload size={20} className="text-white/30 mx-auto mb-1" />
                  <p className="text-white/40 text-sm">Drag & drop cover image</p>
                </div>
              )}
            </div>
            <input
              style={{ ...inputStyle, marginTop: 8, fontSize: 12 }}
              value={editing.image || ""}
              onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              placeholder="Or paste image URL"
            />
          </div>

          {[
            { k: "title", l: "Title" },
            { k: "readTime", l: "Read Time (e.g. 5 min)" },
          ].map((f) => (
            <div key={f.k}>
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

          <div>
            <label className="text-white/40 text-xs font-mono block mb-1.5">
              EXCERPT
            </label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
              value={editing.excerpt || ""}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
            />
          </div>

          <div>
            <label className="text-white/40 text-xs font-mono block mb-1.5">
              TAGS (comma-separated)
            </label>
            <input
              style={inputStyle}
              value={Array.isArray(editing.tags) ? editing.tags.join(", ") : ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  tags: e.target.value.split(",").map((s: string) => s.trim()),
                })
              }
            />
          </div>

          <div>
            <label className="text-white/40 text-xs font-mono block mb-2">
              CONTENT (Rich Text + Code Canvas)
            </label>
            <RichEditor
              value={editing.content || ""}
              onChange={(v) => setEditing({ ...editing, content: v })}
              placeholder="Write your blog post..."
              minHeight={500}
              showCodeCanvas
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!editing.published}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              className="w-4 h-4 accent-sky-500"
            />
            <span className="text-white/60 text-sm">Publish immediately</span>
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
                  <Save size={15} /> Save Post
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
          {data.blog.filter((b: any) => b.published).length} published ·{" "}
          {data.blog.length} total
        </p>
        <button
          onClick={() =>
            setEditing({
              id: Date.now().toString(),
              title: "",
              excerpt: "",
              content: "",
              tags: [],
              date: new Date().toISOString().split("T")[0],
              readTime: "5 min",
              image: "",
              published: false,
            })
          }
          className={btnPrimary}
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="space-y-3">
        {data.blog.map((post: any) => (
          <div
            key={post.id}
            className="flex items-center gap-4 p-5 rounded-2xl group"
            style={box}
          >
            <Image
              src={post.image}
              alt={post.title}
              width={80}
              height={56}
              className="w-20 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold truncate text-sm mb-1">
                {post.title}
              </h4>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    post.published
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/5 text-white/30"
                  }`}
                >
                  {post.published ? "● Live" : "○ Draft"}
                </span>
                <span className="text-white/30 text-xs">
                  {post.date} · {post.readTime}
                </span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggle(post)}
                className="p-2 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10"
              >
                {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button
                onClick={() => setEditing({ ...post })}
                className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"
              >
                <Edit size={15} />
              </button>
              <button
                onClick={() => del(post.id)}
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