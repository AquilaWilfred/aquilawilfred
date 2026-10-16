// app/admin/_components/editors/VideosEditor.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Trash2, Loader, Check, Eye, EyeOff } from "lucide-react";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";

interface VideosEditorProps {
  data: any;
  onRefresh: () => Promise<void>;
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200";

export default function VideosEditor({ data, onRefresh }: VideosEditorProps) {
  const [form, setForm] = useState({
    title: "",
    url: "",
    thumbnail: "",
    category: "Demo",
  });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.url || !form.title) {
      toast.error("Title and URL required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Video added!");
      setForm({ title: "", url: "", thumbnail: "", category: "Demo" });
      setAdding(false);
      await onRefresh();
    } catch {
      toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (v: any) => {
    const newVal = v.visible === false ? true : false;
    try {
      const r = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, visible: newVal }),
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
      const r = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Removed");
      await onRefresh();
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{data.videos.length} videos</p>
        <button onClick={() => setAdding(!adding)} className={btnPrimary}>
          <Plus size={16} /> Add Video
        </button>
      </div>

      {adding && (
        <div
          className="p-6 rounded-2xl mb-6"
          style={{ ...box, border: "1px solid rgba(14,165,233,0.3)" }}
        >
          <h4 className="text-white font-heading font-bold mb-4">
            Add YouTube Video
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { k: "title", l: "Title", ph: "My Demo Video" },
              { k: "url", l: "YouTube URL", ph: "https://youtube.com/watch?v=..." },
              { k: "thumbnail", l: "Thumbnail URL (optional)", ph: "https://..." },
              { k: "category", l: "Category", ph: "Demo / Tutorial" },
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
              disabled={saving}
              className={`${btnPrimary} disabled:opacity-60`}
            >
              {saving ? (
                <>
                  <Loader size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={15} /> Add Video
                </>
              )}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2.5 rounded-xl text-white/60 text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {data.videos.map((v: any) => (
          <div
            key={v.id}
            className="flex items-center gap-4 p-5 rounded-2xl group"
            style={{ ...box, opacity: v.visible === false ? 0.5 : 1 }}
          >
            <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0">
              <Image
                src={v.thumbnail || FALLBACK_THUMB}
                alt={v.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm truncate">
                {v.title}
              </h4>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-lg"
                style={{ background: "rgba(245,158,11,0.15)", color: "#FBBF24" }}
              >
                {v.category}
              </span>
              {v.visible === false && (
                <span className="ml-2 text-amber-400 text-xs font-mono">
                  ● Hidden
                </span>
              )}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => toggleVisible(v)}
                className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"
              >
                {v.visible === false ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                onClick={() => del(v.id)}
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