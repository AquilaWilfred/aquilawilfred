import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Plus, Upload, Loader, Check, X, Trash2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { PortfolioData } from "@/data/portfolio";
const box = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" };



function GalleryEditor({ data, onRefresh }: { data: PortfolioData; onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState({ title: "", category: "Web", tags: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<any>(null); // full cloudinary response
  const { upload, uploading, preview, setPreview } = useImageUpload("gallery-images");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    // Call upload which now hits /api/upload → Cloudinary
    const fd = new FormData();
    fd.append("file", acceptedFiles[0]);
    fd.append("folder", "aquila/gallery");
    setUploadInfo(null);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.url);
      setUploadInfo(data); // store full metadata
      toast.success("Uploaded to Cloudinary ✓");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    }
  }, [setPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxFiles: 1,
  });

  const add = async () => {
    if (!preview || !form.title) { toast.error("Please upload an image and add a title."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          image: preview,
          tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
          // Pass Cloudinary metadata to be stored in DB
          source: uploadInfo?.source || "url",
          publicId: uploadInfo?.publicId,
          format: uploadInfo?.format,
          bytes: uploadInfo?.bytes,
          width: uploadInfo?.width,
          height: uploadInfo?.height,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Image added to gallery!");
      setForm({ title: "", category: "Web", tags: "" });
      setPreview("");
      setUploadInfo(null);
      setAdding(false);
      await onRefresh();
    } catch { toast.error("Failed to save."); } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    toast.success("Removed");
    await onRefresh();
  };

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getSourceBadge(item: any) {
    if (item.source === "cloudinary") return { label: "Cloudinary", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" };
    return { label: "External URL", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" };
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{data.gallery.length} items</p>
        <button onClick={() => setAdding(!adding)} className="btn-primary"><Plus size={16} />Add Image</button>
      </div>

      {adding && (
        <div className="p-7 rounded-2xl mb-6" style={{ ...box, border: "1px solid rgba(14,165,233,0.3)" }}>
          <h4 className="text-white font-heading font-bold mb-2">Upload to Cloudinary</h4>
          <p className="text-white/30 text-xs font-mono mb-5">Images are stored on Cloudinary CDN · Free 25GB · Global delivery</p>

          {/* Dropzone */}
          <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-5 transition-colors"
            style={{ borderColor: isDragActive ? "#38BDF8" : "rgba(255,255,255,0.2)", background: isDragActive ? "rgba(14,165,233,0.08)" : "rgba(255,255,255,0.03)" }}>
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex items-center justify-center gap-3 text-sky-400">
                <Loader size={20} className="animate-spin" /><span>Uploading to Cloudinary...</span>
              </div>
            ) : preview ? (
              <div>
                <img src={preview} alt="" className="max-h-48 mx-auto rounded-lg mb-3 object-cover" />
                {/* File info card shown after upload */}
                {uploadInfo && (
                  <div className="inline-flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-emerald-300 text-xs font-mono font-bold mb-1">UPLOADED TO CLOUDINARY</p>
                      <div className="flex items-center gap-4 text-white/50 text-xs font-mono">
                        <span>📁 {uploadInfo.publicId}</span>
                        <span>📐 {uploadInfo.width}×{uploadInfo.height}</span>
                        <span>💾 {formatBytes(uploadInfo.bytes)}</span>
                        <span>🖼 {uploadInfo.format?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-white/30 text-xs mt-3">Drag & drop to replace</p>
              </div>
            ) : (
              <div>
                <Upload size={32} className="text-white/30 mx-auto mb-3" />
                <p className="text-white/60 font-medium mb-1">{isDragActive ? "Drop it here!" : "Drag & drop image here"}</p>
                <p className="text-white/30 text-sm">or click to browse · JPEG, PNG, WebP · Max 10MB</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[{ k: "title", l: "Title", ph: "Screenshot title" }, { k: "category", l: "Category", ph: "Web / AI / Data / Mobile" }, { k: "tags", l: "Tags (comma-sep)", ph: "React, Python" }].map(f => (
              <div key={f.k}>
                <label className="text-white/40 text-xs font-mono block mb-1.5">{f.l.toUpperCase()}</label>
                <input type="text" value={(form as any)[f.k]} placeholder={f.ph} onChange={e => setForm({ ...form, [f.k]: e.target.value })} className="input-field" />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={add} disabled={saving || uploading} className="btn-primary disabled:opacity-60">
              {saving ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Check size={15} />Add to Gallery</>}
            </button>
            <button onClick={() => { setAdding(false); setPreview(""); setUploadInfo(null); }} className="px-5 py-2.5 rounded-xl text-white/60 text-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
              <X size={15} />Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gallery grid with source info */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.gallery.map((item: any) => {
          const badge = getSourceBadge(item);
          return (
            <div key={item.id} className="rounded-2xl overflow-hidden group" style={box}>
              <div className="relative h-36">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                {/* Source badge top-left */}
                <div className="absolute top-2 left-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
                {/* Delete overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => del(item.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* File info footer */}
              <div className="p-3">
                <p className="text-white/80 text-xs font-medium truncate mb-1">{item.title}</p>
                <p className="text-sky-400 text-xs font-mono mb-2">{item.category}</p>

                {/* Show Cloudinary metadata if available */}
                {item.source === "cloudinary" && (item.img_width || item.file_bytes) && (
                  <div className="space-y-0.5">
                    {item.img_width && item.img_height && (
                      <p className="text-white/25 text-xs font-mono">📐 {item.img_width}×{item.img_height} · {item.file_format?.toUpperCase()}</p>
                    )}
                    {item.file_bytes && (
                      <p className="text-white/25 text-xs font-mono">💾 {formatBytes(item.file_bytes)}</p>
                    )}
                    {item.public_id && (
                      <p className="text-white/20 text-xs font-mono truncate" title={item.public_id}>📁 {item.public_id}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
