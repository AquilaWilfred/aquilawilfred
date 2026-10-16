// app/admin/_components/editors/GalleryEditor.tsx

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Trash2, Upload, Loader, Check, Eye, EyeOff } from "lucide-react";
import ImagePrep from "@/components/editor/ImagePrep";
import { useImageWithPrep } from "@/hooks/useImageWithPrep";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";

interface GalleryEditorProps {
  data: any;
  onRefresh: () => Promise<void>;
}

function formatBytes(b: number) {
  if (!b) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / (1024 * 1024)).toFixed(1)}MB`;
}

export default function GalleryEditor({ data, onRefresh }: GalleryEditorProps) {
  const [form, setForm] = useState({ title: "", category: "Web", tags: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finalUrl, setFinalUrl] = useState("");
  const { uploading, prepSrc, startUpload, confirmAndUpload, cancelPrep } =
    useImageWithPrep();

  const onDrop = useCallback(
    (files: File[]) => {
      if (!files[0]) return;
      startUpload(files[0], (url: string) => setFinalUrl(url));
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const add = async () => {
    if (!finalUrl || !form.title) {
      toast.error("Upload an image and add a title.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          image: finalUrl,
          tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
          source: "cloudinary",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Added to gallery!");
      setForm({ title: "", category: "Web", tags: "" });
      setFinalUrl("");
      setAdding(false);
      await onRefresh();
    } catch {
      toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (item: any) => {
    const newVal = item.visible === false ? true : false;
    try {
      const r = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, visible: newVal }),
      });
      if (!r.ok) throw new Error();
      await onRefresh();
      toast.success(newVal ? "Now visible ✓" : "Hidden");
    } catch {
      toast.error("Failed to update.");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Remove?")) return;
    try {
      const r = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Removed");
      await onRefresh();
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="p-8">
      {prepSrc && (
        <ImagePrep src={prepSrc} onConfirm={confirmAndUpload} onCancel={cancelPrep} />
      )}

      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{data.gallery.length} items</p>
        <button onClick={() => setAdding(!adding)} className={btnPrimary}>
          <Plus size={16} /> Add Image
        </button>
      </div>

      {adding && (
        <div
          className="p-6 rounded-2xl mb-6"
          style={{ ...box, border: "1px solid rgba(14,165,233,0.3)" }}
        >
          <h4 className="text-white font-heading font-bold mb-1">
            Upload to Cloudinary
          </h4>
          <p className="text-white/30 text-xs font-mono mb-4">
            Crop/margin tool appears before uploading
          </p>

          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 transition-colors"
            style={{
              borderColor: isDragActive ? "#38BDF8" : "rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex items-center justify-center gap-3 text-sky-400">
                <Loader size={20} className="animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : finalUrl ? (
              <div>
                <Image
                  src={finalUrl}
                  alt=""
                  width={200}
                  height={160}
                  className="max-h-40 mx-auto rounded-lg mb-2 object-cover"
                />
                <p className="text-emerald-400 text-sm font-mono">✓ Uploaded</p>
              </div>
            ) : (
              <div>
                <Upload size={28} className="text-white/30 mx-auto mb-2" />
                <p className="text-white/50 text-sm">Drag & drop or click</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { k: "title", l: "Title", ph: "Screenshot title" },
              { k: "category", l: "Category", ph: "Web/AI/Data" },
              { k: "tags", l: "Tags", ph: "React, Python" },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-white/40 text-xs font-mono block mb-1">
                  {f.l.toUpperCase()}
                </label>
                <input
                  style={inputStyle}
                  value={(form as any)[f.k]}
                  placeholder={f.ph}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={add}
              disabled={saving || uploading}
              className={`${btnPrimary} disabled:opacity-60`}
            >
              {saving ? (
                <>
                  <Loader size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={15} /> Add to Gallery
                </>
              )}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setFinalUrl("");
              }}
              className="px-4 py-2.5 rounded-xl text-white/60 text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.gallery.map((item: any) => (
          <div
            key={item.id}
            className="rounded-2xl overflow-hidden group"
            style={{ ...box, opacity: item.visible === false ? 0.5 : 1 }}
          >
            <div className="relative h-36">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => toggleVisible(item)}
                  className="p-2 rounded-lg bg-sky-500/20 text-sky-400"
                >
                  {item.visible === false ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => del(item.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-white/80 text-xs font-medium truncate mb-0.5">
                {item.title}
              </p>
              <p className="text-sky-400 text-xs font-mono">{item.category}</p>
              {item.img_width && (
                <p className="text-white/20 text-xs font-mono">
                  {item.img_width}×{item.img_height} · {formatBytes(item.file_bytes)}
                </p>
              )}
              {item.visible === false && (
                <p className="text-amber-400 text-xs font-mono mt-1">● Hidden</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}