"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { portfolioData } from "@/data/portfolio";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import ImagePrep from "@/components/editor/ImagePrep";
import {
  LayoutDashboard, FolderKanban, BookOpen, ImageIcon, Video, Settings,
  LogOut, Plus, Trash2, Edit, Save, X, Eye, EyeOff, Zap, Briefcase,
  ArrowLeft, Check, ChevronRight, Lock, Globe, TrendingUp, FileText,
  Star, Upload, Loader, Briefcase as BriefcaseIcon,
  Users, Link2, DollarSign, ExternalLink, Github, ToggleLeft, ToggleRight,
  FileUp
} from "lucide-react";

const RichEditor = dynamic(() => import("@/components/editor/RichEditor"), { ssr: false });

type Section = "dashboard"|"projects"|"blog"|"gallery"|"videos"|"services"|"experience"|"socials"|"settings";
type PortfolioData = typeof portfolioData;

const CURRENCIES = [
  { code: "KSH", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

const DEFAULT_RATES = { USD: { buying: 129, selling: 131 }, EUR: { buying: 140, selling: 142 }, CNY: { buying: 18, selling: 19 }, GBP: { buying: 163, selling: 165 } };

const ALL_SOCIALS = [
  { id: "github",        platform: "GitHub",        icon: "🐙", url: "" },
  { id: "linkedin",      platform: "LinkedIn",       icon: "💼", url: "" },
  { id: "whatsapp",      platform: "WhatsApp",       icon: "💬", url: "https://wa.me/254112554165" },
  { id: "upwork",        platform: "Upwork",         icon: "🟢", url: "" },
  { id: "kaggle",        platform: "Kaggle",         icon: "🔬", url: "" },
  { id: "twitter",       platform: "Twitter / X",    icon: "𝕏",  url: "" },
  { id: "youtube",       platform: "YouTube",        icon: "▶️", url: "" },
  { id: "medium",        platform: "Medium",         icon: "✍️", url: "" },
  { id: "devto",         platform: "Dev.to",         icon: "👩‍💻", url: "" },
  { id: "hashnode",      platform: "Hashnode",       icon: "#️⃣", url: "" },
  { id: "stackoverflow", platform: "Stack Overflow", icon: "📚", url: "" },
  { id: "huggingface",   platform: "HuggingFace",    icon: "🤗", url: "" },
  { id: "portfolio",     platform: "Portfolio",       icon: "🌐", url: "" },
  { id: "discord",       platform: "Discord",         icon: "💬", url: "" },
  { id: "telegram",      platform: "Telegram",        icon: "✈️", url: "" },
];

// ── DATA HOOK ─────────────────────────────────────────────────────────────────
function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>({ ...portfolioData, projects: [], blog: [], gallery: [], videos: [] });
  const [extras, setExtras] = useState<{ experience: any[]; services: any[]; socials: any[] }>({ experience: [], services: [], socials: [] });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [proj, blog, gal, vid, settings, exp, svc, soc] = await Promise.all([
        fetch("/api/projects").then(r => r.json()),
        fetch("/api/blog").then(r => r.json()),
        fetch("/api/gallery").then(r => r.json()),
        fetch("/api/videos").then(r => r.json()),
        fetch("/api/settings").then(r => r.json()),
        fetch("/api/experience").then(r => r.json()),
        fetch("/api/services").then(r => r.json()),
        fetch("/api/socials").then(r => r.json()),
      ]);

      // RULE: hardcoded is always the base. DB data merges on top.
      // If DB is empty → hardcoded shows (emergency fallback always works)
      setData(d => ({
        ...d,
        // Projects: DB on top of hardcoded
        projects: (proj.data?.length ? proj.data : portfolioData.projects).map((row: any) => ({
          id: row.id, title: row.title, description: row.description,
          longDesc: row.long_desc || row.longDesc, tech: row.tech || [],
          stats: row.stats || {}, category: row.category, image: row.image,
          featured: row.featured, github: row.github, live: row.live,
        })),
        // Blog: DB on top of hardcoded
        blog: (blog.data?.length ? blog.data : portfolioData.blog).map((row: any) => ({
          id: row.id, title: row.title, excerpt: row.excerpt, content: row.content,
          tags: row.tags || [], date: row.date, readTime: row.read_time || row.readTime,
          image: row.image, published: row.published,
        })),
        gallery: gal.data?.length ? gal.data : portfolioData.gallery,
        videos: vid.data?.length ? vid.data : portfolioData.videos,
        // Owner: hardcoded base + DB settings merged on top
        owner: settings.data ? { ...d.owner, ...settings.data } : d.owner,
      }));

      // Services: hardcoded base → DB on top
      const dbServices = svc.data?.length
        ? svc.data
        : portfolioData.services.map((s: any, i: number) => ({
            ...s, id: String(i + 1), visible: true, sort_order: i,
            prices: { KSH: 0, USD: 0, EUR: 0, CNY: 0, GBP: 0 },
            exchange_rates: DEFAULT_RATES, feasibility: "",
            description: s.desc || "",
          }));

      // Experience: hardcoded base → DB on top
      const dbExp = exp.data?.length
        ? exp.data
        : portfolioData.experience.map((e: any, i: number) => ({
            ...e, id: String(i + 1), visible: true, sort_order: i,
          }));

      // Socials: seed from hardcoded owner.socials, then DB overwrites per-id
      const dbSoc = ALL_SOCIALS.map((s: any) => {
        const dbEntry = (soc.data || []).find((e: any) => e.id === s.id);
        const hardcodedUrl = (portfolioData.owner.socials as any)[s.id] || "";
        if (dbEntry) return dbEntry; // DB wins
        return { ...s, url: hardcodedUrl, visible: !!hardcodedUrl, sort_order: 99 }; // hardcoded fallback
      });

      setExtras({ experience: dbExp, services: dbServices, socials: dbSoc });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, extras, loading, refresh };
}

// ── IMAGE UPLOAD WITH PREP ────────────────────────────────────────────────────
function useImageWithPrep() {
  const [uploading, setUploading] = useState(false);
  const [prepSrc, setPrepSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [onDoneCallback, setOnDoneCallback] = useState<((url: string) => void) | null>(null);

  const startUpload = useCallback((file: File, onDone: (url: string) => void) => {
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = e => { setPrepSrc(e.target?.result as string); };
    reader.readAsDataURL(file);
    setOnDoneCallback(() => onDone);
  }, []);

  const confirmAndUpload = useCallback(async (processedUrl: string) => {
    setPrepSrc(null); setUploading(true);
    try {
      let blob: Blob;
      if (processedUrl.startsWith("data:")) { const res = await fetch(processedUrl); blob = await res.blob(); }
      else if (pendingFile) { blob = pendingFile; } else return;
      const fd = new FormData();
      fd.append("file", blob, pendingFile?.name || "image.jpg");
      fd.append("folder", "aquila/gallery");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDoneCallback?.(data.url);
      toast.success("Image uploaded ✓");
    } catch (err: any) { toast.error("Upload failed: " + err.message); }
    finally { setUploading(false); setPendingFile(null); setOnDoneCallback(null); }
  }, [pendingFile, onDoneCallback]);

  const cancelPrep = useCallback(() => { setPrepSrc(null); setPendingFile(null); setOnDoneCallback(null); }, []);
  return { uploading, prepSrc, startUpload, confirmAndUpload, cancelPrep };
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false); 
  const [err, setErr] = useState(false); 
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
    if (res.ok) { onLogin(); } else { setErr(true); setTimeout(() => setErr(false), 2500); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0C4A6E,#082F49 45%,#2E1065)" }}>
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative p-16">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl top-0 left-[-100px] opacity-15" style={{ background: "#38BDF8" }} />
        <div className="relative z-10 text-center">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-sky-400 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-2xl"><Zap size={54} className="text-white" /></div>
          <h1 className="font-display font-black text-6xl text-white mb-2">EAGLE<span style={{ color: "#38BDF8" }}>WILLS</span></h1>
          <p className="text-white/50 font-mono text-sm tracking-[0.3em] mb-12">PORTFOLIO MANAGEMENT SYSTEM</p>
          {["Real email delivery via Gmail","Cloudinary CDN image uploads","Rich text editor with code canvas","Full content management"].map((f, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 text-left">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.4)" }}><Check size={12} className="text-sky-400" /></div>
              <span className="text-white/60 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="p-10 rounded-3xl" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl px-4 py-3 mb-8"><Lock size={14} className="text-emerald-400" /><span className="text-emerald-300 text-xs font-mono">AUTHORISED ACCESS ONLY</span></div>
            <h2 className="text-white font-heading font-bold text-2xl mb-1">Welcome back</h2>
            <p className="text-white/40 text-sm mb-8">Enter your admin password</p>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-white/50 text-xs font-mono tracking-widest block mb-2">PASSWORD</label>
                
                {/* Relative wrapper container to house the toggle button position over the input */}
                <div className="relative w-full">
                  <input 
                    type={showPass ? "text" : "password"} // Dynamically swap types
                    value={pass} 
                    onChange={e => setPass(e.target.value)} 
                    placeholder={showPass ? "Enter your password" : "••••••••••••"} 
                    className="w-full rounded-xl pl-5 pr-14 py-4 text-white text-sm outline-none font-mono" // Added pr-14 spacing so text never overlaps the icon button
                    style={{ 
                      background: "rgba(255,255,255,0.08)", 
                      border: `2px solid ${err ? "#F87171" : "rgba(255,255,255,0.12)"}`, 
                      letterSpacing: showPass ? "normal" : "0.2em" // Keeps formatting readable when visible
                    }} 
                  />
                  
                  {/* Absolute visibility utility trigger button */}
                  <button
                    type="button" // Prevents the button from accidentally triggering standard form submission triggers
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {err && <p className="text-red-400 text-xs mt-2 font-mono">✗ Invalid password</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-heading font-bold text-white text-lg disabled:opacity-60" style={{ background: "linear-gradient(135deg,#0EA5E9,#7C3AED)" }}>
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</span> : "Access Portal →"}
              </button>
            </form>
          </div>
          <div className="text-center mt-6"><a href="/" className="text-white/30 hover:text-white/60 text-sm inline-flex items-center gap-2"><Globe size={14} />Back to Portfolio</a></div>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, onLogout, data, extras }: any) {
  const links = [
    { s: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard", badge: null },
    { s: "projects", icon: <FolderKanban size={18} />, label: "Projects", badge: data.projects.length },
    { s: "blog", icon: <BookOpen size={18} />, label: "Blog Posts", badge: data.blog.filter((b: any) => b.published).length },
    { s: "gallery", icon: <ImageIcon size={18} />, label: "Gallery", badge: data.gallery.length },
    { s: "videos", icon: <Video size={18} />, label: "Videos", badge: data.videos.length },
    { s: "services", icon: <BriefcaseIcon size={18} />, label: "Services", badge: null },
    { s: "experience", icon: <Users size={18} />, label: "Experience", badge: extras.experience.length },
    { s: "socials", icon: <Link2 size={18} />, label: "Social Links", badge: extras.socials.filter((s: any) => s.visible).length },
    { s: "settings", icon: <Settings size={18} />, label: "Settings", badge: null },
  ];
  return (
    <aside className="w-64 flex flex-col h-screen sticky top-0 shrink-0" style={{ background: "rgba(5,15,30,0.98)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-violet-600 flex items-center justify-center shrink-0"><Zap size={18} className="text-white" /></div>
          <div><div className="font-display font-black text-sm text-white">EAGLEWILLS</div><div className="text-white/30 text-xs font-mono">Admin Portal v4</div></div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(l => (
          <button key={l.s} onClick={() => setActive(l.s)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
            style={{ background: active === l.s ? "linear-gradient(135deg,rgba(14,165,233,0.2),rgba(124,58,237,0.15))" : "transparent", color: active === l.s ? "#38BDF8" : "rgba(255,255,255,0.45)", border: active === l.s ? "1px solid rgba(14,165,233,0.25)" : "1px solid transparent" }}>
            <span className={active === l.s ? "text-sky-400" : "text-white/30 group-hover:text-white/60 transition-colors"}>{l.icon}</span>
            <span className="flex-1 text-left">{l.label}</span>
            {l.badge !== null && <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(14,165,233,0.15)", color: "#38BDF8" }}>{l.badge}</span>}
            {active === l.s && <ChevronRight size={14} className="text-sky-400 shrink-0" />}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t space-y-0.5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white text-sm transition-colors"><Globe size={16} />View Live Site<ChevronRight size={12} className="ml-auto" /></a>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 text-sm transition-colors"><LogOut size={16} />Sign Out</button>
      </div>
    </aside>
  );
}

const box = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px" };
const inputStyle = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" } as React.CSSProperties;

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ data, extras }: any) {
  const stats = [
    { label: "Projects", value: data.projects.length, color: "#38BDF8", icon: <FolderKanban size={22} /> },
    { label: "Blog Posts", value: data.blog.filter((b: any) => b.published).length, color: "#A78BFA", icon: <FileText size={22} /> },
    { label: "Gallery", value: data.gallery.length, color: "#6EE7B7", icon: <ImageIcon size={22} /> },
    { label: "Videos", value: data.videos.length, color: "#FBBF24", icon: <Video size={22} /> },
    { label: "Services", value: extras.services.filter((s: any) => s.visible !== false).length, color: "#FB7185", icon: <BriefcaseIcon size={22} /> },
    { label: "Experience", value: extras.experience.length, color: "#34D399", icon: <Users size={22} /> },
  ];
  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-6" style={box}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <TrendingUp size={14} className="text-emerald-400 opacity-50" />
            </div>
            <div className="font-display font-black text-4xl mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/50 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-7" style={box}>
        <h3 className="text-white font-heading font-bold text-lg mb-4">System Status</h3>
        {[
          ["Contact Form → Gmail", "Live ✓", "#6EE7B7"],
          ["Image Upload → Cloudinary CDN", "Live ✓", "#6EE7B7"],
          ["Database → Supabase", "Live ✓", "#6EE7B7"],
          ["Admin Auth → Secure Cookie", "Live ✓", "#6EE7B7"],
          ["Favicon → aquiladp.svg", "Set ✓", "#6EE7B7"],
        ].map(([label, status, color]) => (
          <div key={label} className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.03)" }}>
            <span className="text-white/60 text-sm">{label}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROJECTS EDITOR ───────────────────────────────────────────────────────────
function ProjectsEditor({ data, onRefresh }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { uploading, prepSrc, startUpload, confirmAndUpload, cancelPrep } = useImageWithPrep();

  const onDrop = useCallback((files: File[]) => {
    if (!files[0] || !editing) return;
    startUpload(files[0], (url: string) => setEditing((e: any) => ({ ...e, image: url })));
  }, [editing, startUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 1 });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error();
      toast.success("Project saved!"); await onRefresh(); setEditing(null);
    } catch { toast.error("Failed to save."); } finally { setSaving(false); }
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; try { const r = await fetch(`/api/projects/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error(); toast.success("Deleted"); await onRefresh(); } catch { toast.error("Delete failed."); } };

  if (editing) return (
    <div className="p-8">
      {prepSrc && <ImagePrep src={prepSrc} onConfirm={confirmAndUpload} onCancel={cancelPrep} />}
      <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16} />Back</button>
      <div className="max-w-3xl space-y-5">
        <h3 className="text-white font-heading font-bold text-xl">Edit Project</h3>
        <div className="p-5 rounded-xl" style={box}>
          <label className="text-white/40 text-xs font-mono block mb-2">PROJECT IMAGE</label>
          <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors" style={{ borderColor: isDragActive ? "#38BDF8" : "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
            <input {...getInputProps()} />
            {uploading ? <div className="flex items-center justify-center gap-2 text-sky-400"><Loader size={18} className="animate-spin" /><span>Uploading...</span></div>
              : editing.image ? <div><img src={editing.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2" /><p className="text-white/30 text-xs">Drag to replace</p></div>
                : <div><Upload size={24} className="text-white/30 mx-auto mb-2" /><p className="text-white/40 text-sm">Drag & drop or click</p></div>}
          </div>
          <input style={{ ...inputStyle, marginTop: "8px", fontSize: "12px" }} type="text" value={editing.image || ""} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="Or paste image URL directly" />
        </div>
        {[{ k: "title", l: "Title" }, { k: "category", l: "Category" }, { k: "github", l: "GitHub URL" }, { k: "live", l: "Live / Hosted Project URL" }].map(f => (
          <div key={f.k}>
            <label className="text-white/40 text-xs font-mono block mb-1.5">{f.l.toUpperCase()}</label>
            <input style={inputStyle} value={editing[f.k] || ""} onChange={e => setEditing({ ...editing, [f.k]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="text-white/40 text-xs font-mono block mb-1.5">SHORT DESCRIPTION</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
        </div>
        <div>
          <label className="text-white/40 text-xs font-mono block mb-2">FULL DESCRIPTION (Rich Text + Code Canvas)</label>
          <RichEditor value={editing.longDesc || ""} onChange={v => setEditing({ ...editing, longDesc: v })} placeholder="Write a detailed description..." minHeight={250} showCodeCanvas />
        </div>
        <div>
          <label className="text-white/40 text-xs font-mono block mb-1.5">TECH STACK (comma-separated)</label>
          <input style={inputStyle} value={Array.isArray(editing.tech) ? editing.tech.join(", ") : ""} onChange={e => setEditing({ ...editing, tech: e.target.value.split(",").map((s: string) => s.trim()) })} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={!!editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="w-4 h-4 accent-sky-500" />
          <span className="text-white/60 text-sm">Mark as featured</span>
        </label>
        <div className="flex gap-4">
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save Project</>}</button>
          <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-white/60 text-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{data.projects.length} projects</p>
        <button onClick={() => setEditing({ id: Date.now().toString(), title: "", description: "", longDesc: "", tech: [], stats: {}, category: "AI/ML", image: "", featured: false, github: "#", live: "#" })} className="btn-primary"><Plus size={16} />Add Project</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {data.projects.map((p: any) => (
          <div key={p.id} className="flex gap-4 p-5 rounded-2xl group" style={box}>
            <img src={p.image} alt={p.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><h4 className="text-white font-semibold text-sm truncate">{p.title}</h4>{p.featured && <Star size={12} className="text-amber-400" />}</div>
              <p className="text-white/40 text-xs truncate mb-2">{p.description}</p>
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{ background: "rgba(14,165,233,0.15)", color: "#38BDF8" }}>{p.category}</span>
              {p.live && p.live !== "#" && <a href={p.live} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-emerald-400 font-mono hover:underline inline-flex items-center gap-1"><ExternalLink size={10} />Live</a>}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => setEditing({ ...p })} className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"><Edit size={15} /></button>
              <button onClick={() => del(p.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BLOG EDITOR ───────────────────────────────────────────────────────────────
function BlogEditor({ data, onRefresh }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { uploading, prepSrc, startUpload, confirmAndUpload, cancelPrep } = useImageWithPrep();

  const onDrop = useCallback((files: File[]) => {
    if (!files[0] || !editing) return;
    startUpload(files[0], (url: string) => setEditing((e: any) => ({ ...e, image: url })));
  }, [editing, startUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 1 });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error();
      toast.success("Post saved!"); await onRefresh(); setEditing(null);
    } catch { toast.error("Failed."); } finally { setSaving(false); }
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; try { const r = await fetch(`/api/blog/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error(); toast.success("Deleted"); await onRefresh(); } catch { toast.error("Delete failed."); } };
  const toggle = async (post: any) => {
    const newVisible = post.published !== true; // explicit boolean flip
    try {
      const r = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, published: newVisible }),
      });
      if (!r.ok) throw new Error();
      await onRefresh();
      toast.success(newVisible ? "Published! ✓" : "Unpublished");
    } catch { toast.error("Failed to update."); }
  };

  if (editing) return (
    <div className="p-8">
      {prepSrc && <ImagePrep src={prepSrc} onConfirm={confirmAndUpload} onCancel={cancelPrep} />}
      <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16} />Back</button>
      <div className="max-w-3xl space-y-5">
        <h3 className="text-white font-heading font-bold text-xl">Edit Blog Post</h3>
        <div className="p-5 rounded-xl" style={box}>
          <label className="text-white/40 text-xs font-mono block mb-2">COVER IMAGE</label>
          <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer" style={{ borderColor: isDragActive ? "#38BDF8" : "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
            <input {...getInputProps()} />
            {uploading ? <div className="flex items-center justify-center gap-2 text-sky-400"><Loader size={16} className="animate-spin" /><span>Uploading...</span></div>
              : editing.image ? <div><img src={editing.image} alt="" className="w-full h-24 object-cover rounded-lg mb-1" /><p className="text-white/30 text-xs">Drag to replace</p></div>
                : <div><Upload size={20} className="text-white/30 mx-auto mb-1" /><p className="text-white/40 text-sm">Drag & drop cover image</p></div>}
          </div>
          <input style={{ ...inputStyle, marginTop: "8px", fontSize: "12px" }} value={editing.image || ""} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="Or paste image URL" />
        </div>
        {[{ k: "title", l: "Title" }, { k: "readTime", l: "Read Time (e.g. 5 min)" }].map(f => (
          <div key={f.k}>
            <label className="text-white/40 text-xs font-mono block mb-1.5">{f.l.toUpperCase()}</label>
            <input style={inputStyle} value={editing[f.k] || ""} onChange={e => setEditing({ ...editing, [f.k]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="text-white/40 text-xs font-mono block mb-1.5">EXCERPT</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "70px" }} value={editing.excerpt || ""} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} />
        </div>
        <div>
          <label className="text-white/40 text-xs font-mono block mb-1.5">TAGS (comma-separated)</label>
          <input style={inputStyle} value={Array.isArray(editing.tags) ? editing.tags.join(", ") : ""} onChange={e => setEditing({ ...editing, tags: e.target.value.split(",").map((s: string) => s.trim()) })} />
        </div>
        <div>
          <label className="text-white/40 text-xs font-mono block mb-2">CONTENT (Rich Text + Code Canvas)</label>
          <RichEditor value={editing.content || ""} onChange={v => setEditing({ ...editing, content: v })} placeholder="Write your blog post..." minHeight={400} showCodeCanvas />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={!!editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} className="w-4 h-4 accent-sky-500" />
          <span className="text-white/60 text-sm">Publish immediately</span>
        </label>
        <div className="flex gap-4">
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save Post</>}</button>
          <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-white/60 text-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{data.blog.filter((b: any) => b.published).length} published · {data.blog.length} total</p>
        <button onClick={() => setEditing({ id: Date.now().toString(), title: "", excerpt: "", content: "", tags: [], date: new Date().toISOString().split("T")[0], readTime: "5 min", image: "", published: false })} className="btn-primary"><Plus size={16} />New Post</button>
      </div>
      <div className="space-y-3">
        {data.blog.map((post: any) => (
          <div key={post.id} className="flex items-center gap-4 p-5 rounded-2xl group" style={box}>
            <img src={post.image} alt={post.title} className="w-20 h-14 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold truncate text-sm mb-1">{post.title}</h4>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${post.published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/30"}`}>{post.published ? "● Live" : "○ Draft"}</span>
                <span className="text-white/30 text-xs">{post.date} · {post.readTime}</span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => toggle(post)} className="p-2 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10">{post.published ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              <button onClick={() => setEditing({ ...post })} className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"><Edit size={15} /></button>
              <button onClick={() => del(post.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GALLERY EDITOR ────────────────────────────────────────────────────────────
function GalleryEditor({ data, onRefresh }: any) {
  const [form, setForm] = useState({ title: "", category: "Web", tags: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const { uploading, prepSrc, startUpload, confirmAndUpload, cancelPrep } = useImageWithPrep();
  const [finalUrl, setFinalUrl] = useState("");

  const onDrop = useCallback((files: File[]) => {
    if (!files[0]) return;
    startUpload(files[0], (url: string) => { setFinalUrl(url); });
  }, [startUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 1 });

  const add = async () => {
    if (!finalUrl || !form.title) { toast.error("Upload an image and add a title."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.title, category: form.category, image: finalUrl, tags: form.tags.split(",").map(s => s.trim()).filter(Boolean), source: "cloudinary" }) });
      if (!res.ok) throw new Error();
      toast.success("Added to gallery!"); setForm({ title: "", category: "Web", tags: "" }); setFinalUrl(""); setAdding(false); await onRefresh();
    } catch { toast.error("Failed."); } finally { setSaving(false); }
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
    } catch { toast.error("Failed to update."); }
  };
  const del = async (id: string) => { if (!confirm("Remove?")) return; try { const r = await fetch(`/api/gallery/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error(); toast.success("Removed"); await onRefresh(); } catch { toast.error("Delete failed."); } };
  function formatBytes(b: number) { if (!b) return ""; if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`; return `${(b / (1024 * 1024)).toFixed(1)}MB`; }

  return (
    <div className="p-8">
      {prepSrc && <ImagePrep src={prepSrc} onConfirm={confirmAndUpload} onCancel={cancelPrep} />}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{data.gallery.length} items</p>
        <button onClick={() => setAdding(!adding)} className="btn-primary"><Plus size={16} />Add Image</button>
      </div>
      {adding && (
        <div className="p-6 rounded-2xl mb-6" style={{ ...box, border: "1px solid rgba(14,165,233,0.3)" }}>
          <h4 className="text-white font-heading font-bold mb-1">Upload to Cloudinary</h4>
          <p className="text-white/30 text-xs font-mono mb-4">Crop/margin tool appears before uploading</p>
          <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 transition-colors" style={{ borderColor: isDragActive ? "#38BDF8" : "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)" }}>
            <input {...getInputProps()} />
            {uploading ? <div className="flex items-center justify-center gap-3 text-sky-400"><Loader size={20} className="animate-spin" /><span>Uploading...</span></div>
              : finalUrl ? <div><img src={finalUrl} alt="" className="max-h-40 mx-auto rounded-lg mb-2 object-cover" /><p className="text-emerald-400 text-sm font-mono">✓ Uploaded</p></div>
                : <div><Upload size={28} className="text-white/30 mx-auto mb-2" /><p className="text-white/50 text-sm">Drag & drop or click</p></div>}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ k: "title", l: "Title", ph: "Screenshot title" }, { k: "category", l: "Category", ph: "Web/AI/Data" }, { k: "tags", l: "Tags", ph: "React, Python" }].map(f => (
              <div key={f.k}><label className="text-white/40 text-xs font-mono block mb-1">{f.l.toUpperCase()}</label><input style={inputStyle} value={(form as any)[f.k]} placeholder={f.ph} onChange={e => setForm({ ...form, [f.k]: e.target.value })} /></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={add} disabled={saving || uploading} className="btn-primary disabled:opacity-60">{saving ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Check size={15} />Add to Gallery</>}</button>
            <button onClick={() => { setAdding(false); setFinalUrl(""); }} className="px-4 py-2.5 rounded-xl text-white/60 text-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.gallery.map((item: any) => (
          <div key={item.id} className="rounded-2xl overflow-hidden group" style={{ ...box, opacity: item.visible === false ? 0.5 : 1 }}>
            <div className="relative h-36">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => toggleVisible(item)} className="p-2 rounded-lg bg-sky-500/20 text-sky-400">{item.visible === false ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button onClick={() => del(item.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-white/80 text-xs font-medium truncate mb-0.5">{item.title}</p>
              <p className="text-sky-400 text-xs font-mono">{item.category}</p>
              {item.img_width && <p className="text-white/20 text-xs font-mono">{item.img_width}×{item.img_height} · {formatBytes(item.file_bytes)}</p>}
              {item.visible === false && <p className="text-amber-400 text-xs font-mono mt-1">● Hidden</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── VIDEOS EDITOR ─────────────────────────────────────────────────────────────
function VideosEditor({ data, onRefresh }: any) {
  const [form, setForm] = useState({ title: "", url: "", thumbnail: "", category: "Demo" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.url || !form.title) { toast.error("Title and URL required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success("Video added!"); setForm({ title: "", url: "", thumbnail: "", category: "Demo" }); setAdding(false); await onRefresh();
    } catch { toast.error("Failed."); } finally { setSaving(false); }
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
    } catch { toast.error("Failed to update."); }
  };
  const del = async (id: string) => { if (!confirm("Remove?")) return; try { const r = await fetch(`/api/videos/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error(); toast.success("Removed"); await onRefresh(); } catch { toast.error("Delete failed."); } };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{data.videos.length} videos</p>
        <button onClick={() => setAdding(!adding)} className="btn-primary"><Plus size={16} />Add Video</button>
      </div>
      {adding && (
        <div className="p-6 rounded-2xl mb-6" style={{ ...box, border: "1px solid rgba(14,165,233,0.3)" }}>
          <h4 className="text-white font-heading font-bold mb-4">Add YouTube Video</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[{ k: "title", l: "Title", ph: "My Demo Video" }, { k: "url", l: "YouTube URL", ph: "https://youtube.com/watch?v=..." }, { k: "thumbnail", l: "Thumbnail URL (optional)", ph: "https://..." }, { k: "category", l: "Category", ph: "Demo / Tutorial" }].map(f => (
              <div key={f.k}><label className="text-white/40 text-xs font-mono block mb-1">{f.l.toUpperCase()}</label><input style={inputStyle} value={(form as any)[f.k]} placeholder={f.ph} onChange={e => setForm({ ...form, [f.k]: e.target.value })} /></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={add} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Check size={15} />Add Video</>}</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-xl text-white/60 text-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {data.videos.map((v: any) => (
          <div key={v.id} className="flex items-center gap-4 p-5 rounded-2xl group" style={{ ...box, opacity: v.visible === false ? 0.5 : 1 }}>
            <img src={v.thumbnail || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200"} alt={v.title} className="w-24 rounded-xl object-cover shrink-0" style={{ height: 64 }} />
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm truncate">{v.title}</h4>
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{ background: "rgba(245,158,11,0.15)", color: "#FBBF24" }}>{v.category}</span>
              {v.visible === false && <span className="ml-2 text-amber-400 text-xs font-mono">● Hidden</span>}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => toggleVisible(v)} className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10">{v.visible === false ? <Eye size={15} /> : <EyeOff size={15} />}</button>
              <button onClick={() => del(v.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SERVICES EDITOR ───────────────────────────────────────────────────────────
function ServicesEditor({ extras, onRefresh }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [globalRates, setGlobalRates] = useState(DEFAULT_RATES);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [savingRates, setSavingRates] = useState(false);
  const [showRatesPanel, setShowRatesPanel] = useState(false);

  useEffect(() => {
    fetch("/api/currency").then(r => r.json()).then(d => {
      if (d.data) setGlobalRates(d.data);
      setRatesLoaded(true);
    });
  }, []);

  const saveRates = async () => {
    setSavingRates(true);
    try {
      const res = await fetch("/api/currency", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(globalRates) });
      if (!res.ok) throw new Error();
      toast.success("Exchange rates saved! Website updated.");
    } catch { toast.error("Failed to save rates."); } finally { setSavingRates(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editing, exchange_rates: globalRates }) });
      if (!res.ok) throw new Error();
      toast.success("Service saved!"); await onRefresh(); setEditing(null);
    } catch { toast.error("Failed."); } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const r = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted"); await onRefresh();
    } catch { toast.error("Delete failed."); }
  };

  const toggleVisible = async (svc: any) => {
    const newVal = svc.visible === false ? true : false;
    try {
      const r = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...svc, visible: newVal }),
      });
      if (!r.ok) throw new Error();
      await onRefresh();
      toast.success(newVal ? "Now visible ✓" : "Hidden from website");
    } catch { toast.error("Failed to update."); }
  };

  if (editing) return (
    <div className="p-8">
      <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16} />Back to Services</button>
      <div className="max-w-3xl space-y-5">
        <h3 className="text-white font-heading font-bold text-xl">Edit Service</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-white/40 text-xs font-mono block mb-1.5">ICON (emoji)</label><input style={inputStyle} value={editing.icon || ""} onChange={e => setEditing({ ...editing, icon: e.target.value })} placeholder="🧠" /></div>
          <div><label className="text-white/40 text-xs font-mono block mb-1.5">TITLE</label><input style={inputStyle} value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
        </div>
        <div>
          <label className="text-white/40 text-xs font-mono block mb-2">SHORT DESCRIPTION</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
        </div>
        <div>
          <label className="text-white/40 text-xs font-mono block mb-2">DETAILED ARTICLE (Feasibility, Planning, Design, Budget)</label>
          <RichEditor value={editing.feasibility || ""} onChange={v => setEditing({ ...editing, feasibility: v })} placeholder="Describe feasibility, planning process, design approach, deliverables and cost breakdown..." minHeight={300} showCodeCanvas={false} />
        </div>
        <div className="p-6 rounded-xl" style={box}>
          <h4 className="text-white font-heading font-semibold mb-1">💰 Pricing Per Currency</h4>
          <p className="text-white/30 text-xs font-mono mb-4">KSH equivalences use your selling rates.</p>
          <div className="space-y-3">
            {CURRENCIES.map(cur => (
              <div key={cur.code} className="flex items-center gap-4 flex-wrap">
                <div className="w-28 shrink-0">
                  <span className="text-white/70 text-sm font-mono font-bold">{cur.symbol} {cur.code}</span>
                  <p className="text-white/30 text-xs">{cur.name}</p>
                </div>
                <input type="number" style={{ ...inputStyle, width: "130px" }} value={editing.prices?.[cur.code] || 0}
                  onChange={e => setEditing({ ...editing, prices: { ...editing.prices, [cur.code]: Number(e.target.value) } })} min={0} />
                {cur.code !== "KSH" && (editing.prices?.[cur.code] || 0) > 0 && (
                  <span className="text-emerald-400/60 text-xs font-mono">
                    ≈ KSh {((editing.prices[cur.code] || 0) * ((globalRates as any)[cur.code]?.selling || 1)).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer px-1">
          <input type="checkbox" checked={editing.visible !== false} onChange={e => setEditing({ ...editing, visible: e.target.checked })} className="w-4 h-4 accent-sky-500" />
          <span className="text-white/60 text-sm">Visible on website</span>
        </label>
        <div className="flex gap-4">
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save Service</>}</button>
          <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-white/60 text-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.04)" }}>
        <button onClick={() => setShowRatesPanel(!showRatesPanel)} className="w-full flex items-center justify-between px-6 py-4 text-left">
          <div>
            <h4 className="text-amber-300 font-heading font-semibold">📊 Global Exchange Rates → KSH</h4>
            <p className="text-white/30 text-xs font-mono mt-0.5">Controls price conversions on website. Click to {showRatesPanel ? "collapse" : "expand"}.</p>
          </div>
          <div className="flex items-center gap-3">
            {ratesLoaded && <span className="text-emerald-400 text-xs font-mono">● Loaded</span>}
            <span className="text-white/40 text-sm">{showRatesPanel ? "▲" : "▼"}</span>
          </div>
        </button>
        {showRatesPanel && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(globalRates).map(([cur, rates]: any) => (
                <div key={cur} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white/70 text-sm font-mono font-bold mb-3">{cur} → KSh</p>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-white/30 text-xs font-mono block mb-1">BUYING RATE</label>
                      <input type="number" style={inputStyle} value={rates.buying} onChange={e => setGlobalRates({ ...globalRates, [cur]: { ...rates, buying: Number(e.target.value) } })} />
                    </div>
                    <div className="flex-1">
                      <label className="text-white/30 text-xs font-mono block mb-1">SELLING RATE (shown on website)</label>
                      <input type="number" style={inputStyle} value={rates.selling} onChange={e => setGlobalRates({ ...globalRates, [cur]: { ...rates, selling: Number(e.target.value) } })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={saveRates} disabled={savingRates} className="btn-primary disabled:opacity-60">
              {savingRates ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save Exchange Rates to Website</>}
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{extras.services.length} services</p>
        <button onClick={() => setEditing({ id: Date.now().toString(), icon: "🔧", title: "New Service", description: "", prices: { KSH: 0, USD: 0, EUR: 0, CNY: 0, GBP: 0 }, exchange_rates: globalRates, feasibility: "", visible: true })} className="btn-primary">
          <Plus size={16} />Add Service
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.services.map((svc: any) => (
          <div key={svc.id} className="p-5 rounded-2xl group" style={{ ...box, opacity: svc.visible === false ? 0.5 : 1 }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{svc.icon}</span>
                <div>
                  <h4 className="text-white font-heading font-semibold">{svc.title}</h4>
                  <p className="text-white/40 text-xs line-clamp-1">{svc.description || svc.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleVisible(svc)} className="p-2 rounded-lg text-white/40 hover:text-sky-400">{svc.visible === false ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button onClick={() => setEditing({ ...svc, description: svc.description || svc.desc || "" })} className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"><Edit size={15} /></button>
                <button onClick={() => del(svc.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.filter(c => svc.prices?.[c.code] > 0).map(c => (
                <span key={c.code} className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}>{c.symbol}{(svc.prices[c.code]).toLocaleString()} {c.code}</span>
              ))}
              {!CURRENCIES.some(c => svc.prices?.[c.code] > 0) && <span className="text-white/20 text-xs font-mono italic">{svc.price || "No prices set yet"}</span>}
            </div>
            {svc.visible === false && <p className="text-amber-400 text-xs font-mono mt-2">● Hidden from website</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EXPERIENCE EDITOR ─────────────────────────────────────────────────────────
function ExperienceEditor({ extras, onRefresh }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/experience", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error();
      toast.success("Experience saved!"); await onRefresh(); setEditing(null);
    } catch { toast.error("Failed."); } finally { setSaving(false); }
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; try { const r = await fetch(`/api/experience/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error(); toast.success("Deleted"); await onRefresh(); } catch { toast.error("Delete failed."); } };
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
    } catch { toast.error("Failed to update."); }
  };

  if (editing) return (
    <div className="p-8">
      <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"><ArrowLeft size={16} />Back</button>
      <div className="max-w-2xl space-y-4">
        <h3 className="text-white font-heading font-bold text-xl">Edit Experience</h3>
        {[{ k: "role", l: "Role / Position" }, { k: "company", l: "Company" }, { k: "period", l: "Period (e.g. Jan 2023 – Present)" }, { k: "location", l: "Location" }].map(f => (
          <div key={f.k} className="p-5 rounded-xl" style={box}>
            <label className="text-white/40 text-xs font-mono block mb-1.5">{f.l.toUpperCase()}</label>
            <input style={inputStyle} value={editing[f.k] || ""} onChange={e => setEditing({ ...editing, [f.k]: e.target.value })} />
          </div>
        ))}
        <div className="p-5 rounded-xl" style={box}>
          <label className="text-white/40 text-xs font-mono block mb-1.5">HIGHLIGHTS (one per line)</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }} value={Array.isArray(editing.highlights) ? editing.highlights.join("\n") : ""} onChange={e => setEditing({ ...editing, highlights: e.target.value.split("\n").filter(Boolean) })} placeholder="Each line becomes a bullet point highlight" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer px-1">
          <input type="checkbox" checked={editing.visible !== false} onChange={e => setEditing({ ...editing, visible: e.target.checked })} className="w-4 h-4 accent-sky-500" />
          <span className="text-white/60 text-sm">Visible on website</span>
        </label>
        <div className="flex gap-4">
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save</>}</button>
          <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-white/60 text-sm" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{extras.experience.length} entries</p>
        <button onClick={() => setEditing({ id: Date.now().toString(), role: "", company: "", period: "", location: "", highlights: [], visible: true, sort_order: extras.experience.length })} className="btn-primary"><Plus size={16} />Add Experience</button>
      </div>
      <div className="space-y-4">
        {extras.experience.map((exp: any) => (
          <div key={exp.id} className="p-6 rounded-2xl group" style={{ ...box, opacity: exp.visible === false ? 0.5 : 1 }}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-heading font-bold">{exp.role}</h4>
                <p className="text-sky-400 font-medium text-sm">{exp.company}</p>
                <p className="text-white/40 text-xs font-mono">{exp.period} · {exp.location}</p>
                {exp.visible === false && <p className="text-amber-400 text-xs font-mono mt-1">● Hidden from website</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleVisible(exp)} className="p-2 rounded-lg text-white/40 hover:text-sky-400">{exp.visible === false ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button onClick={() => setEditing({ ...exp })} className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"><Edit size={15} /></button>
                <button onClick={() => del(exp.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={15} /></button>
              </div>
            </div>
            {exp.highlights?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {exp.highlights.slice(0, 2).map((h: string, i: number) => <li key={i} className="text-white/50 text-xs flex items-start gap-2"><span className="text-sky-500 mt-0.5">▸</span>{h}</li>)}
                {exp.highlights.length > 2 && <li className="text-white/30 text-xs">+{exp.highlights.length - 2} more</li>}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SOCIALS EDITOR ────────────────────────────────────────────────────────────
function SocialsEditor({ extras, onRefresh }: any) {
  const [socials, setSocials] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const merged = ALL_SOCIALS.map(s => {
      const existing = extras.socials.find((e: any) => e.id === s.id);
      return existing || { ...s, visible: false, sort_order: 99 };
    });
    setSocials(merged);
  }, [extras.socials]);

  // Save ALL socials to DB
  const saveAll = async (updatedSocials?: any[]) => {
    const toSave = updatedSocials || socials;
    setSaving(true);
    try {
      const res = await fetch("/api/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socials: toSave }),
      });
      if (!res.ok) throw new Error();
      toast.success("Social links saved!");
      await onRefresh();
    } catch { toast.error("Failed to save."); }
    finally { setSaving(false); setSavingId(null); }
  };

  // Toggle visible AND immediately save that single entry
  const toggleAndSave = async (id: string) => {
    setSavingId(id);
    const updated = socials.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setSocials(updated);
    await saveAll(updated);
  };

  const update = (id: string, field: string, value: any) => {
    setSocials(socials.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-heading font-bold text-xl">Social Media & Dev Hubs</h3>
          <p className="text-white/40 text-sm mt-1">Toggle saves instantly. Edit URLs then click Save All to update links.</p>
        </div>
        <button onClick={() => saveAll()} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving && !savingId ? <><Loader size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save All</>}
        </button>
      </div>
      <div className="space-y-3">
        {socials.map(s => (
          <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl"
            style={{ ...box, border: s.visible ? "1px solid rgba(14,165,233,0.3)" : "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-2xl w-10 text-center shrink-0">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium mb-1">{s.platform}</p>
              <input
                style={{ ...inputStyle, padding: "6px 10px", fontSize: "12px" }}
                value={s.url || ""}
                onChange={e => update(s.id, "url", e.target.value)}
                placeholder={`https://...`}
              />
            </div>
            {/* Toggle button — saves immediately */}
            <button
              onClick={() => toggleAndSave(s.id)}
              disabled={savingId === s.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 disabled:opacity-50"
              style={{
                background: s.visible ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${s.visible ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.12)"}`,
                color: s.visible ? "#38BDF8" : "rgba(255,255,255,0.35)",
                minWidth: "110px", justifyContent: "center",
              }}>
              {savingId === s.id
                ? <><Loader size={13} className="animate-spin" />Saving</>
                : s.visible
                  ? <><Eye size={14} />Visible</>
                  : <><EyeOff size={14} />Hidden</>
              }
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)" }}>
        <p className="text-sky-300/70 text-sm">💡 Toggling <strong>Visible/Hidden</strong> saves instantly. After editing URLs, click <strong>Save All</strong>. Hardcoded links (GitHub, LinkedIn, WhatsApp, Upwork, Kaggle, Portfolio) always show on the website regardless of this setting.</p>
      </div>
    </div>
  );
}

// ── SETTINGS EDITOR ───────────────────────────────────────────────────────────
function SettingsEditor({ data, onRefresh }: any) {
  const [owner, setOwner] = useState({ ...data.owner });
  const [saving, setSaving] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [savingResume, setSavingResume] = useState(false);

  // Load resume URL from settings
  useEffect(() => {
    if (data.owner?.resumeUrl) setResumeUrl(data.owner.resumeUrl);
  }, [data.owner]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...owner, resumeUrl }) });
      if (!res.ok) throw new Error();
      toast.success("Settings saved!"); await onRefresh();
    } catch { toast.error("Failed."); } finally { setSaving(false); }
  };

  return (
    <div className="p-8 w-full">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="p-8 rounded-2xl" style={box}>
          <h3 className="text-white font-heading font-bold text-lg mb-6">Personal Information</h3>
          <div className="space-y-4">
            {[{ k: "name", l: "Full Name" }, { k: "title", l: "Professional Title" }, { k: "tagline", l: "Tagline" }, { k: "email", l: "Email" }, { k: "location", l: "Location" }, { k: "availability", l: "Availability" }, { k: "company", l: "Company Name" }, { k: "experience", l: "Years of Experience" }].map(f => (
              <div key={f.k}>
                <label className="text-white/40 text-xs font-mono block mb-1.5">{f.l.toUpperCase()}</label>
                <input style={inputStyle} value={(owner as any)[f.k] || ""} onChange={e => setOwner({ ...owner, [f.k]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-white/40 text-xs font-mono block mb-1.5">BIO</label>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }} value={owner.bio || ""} onChange={e => setOwner({ ...owner, bio: e.target.value })} />
            </div>
            <div>
              <label className="text-white/40 text-xs font-mono block mb-1.5">PHONE NUMBERS (one per line)</label>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "70px" }} value={Array.isArray(owner.phone) ? owner.phone.join("\n") : (owner.phone || "")} onChange={e => setOwner({ ...owner, phone: e.target.value.split("\n").filter(Boolean) })} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Resume PDF */}
          <div className="p-6 rounded-2xl" style={{ ...box, border: "1px solid rgba(14,165,233,0.2)" }}>
            <h3 className="text-white font-heading font-bold text-lg mb-2 flex items-center gap-2"><FileUp size={18} className="text-sky-400" />Resume / CV PDF</h3>
            <p className="text-white/30 text-xs font-mono mb-4">Paste the public URL to your PDF resume. It will show as a preview on the About page and open when clicked.</p>
            <label className="text-white/40 text-xs font-mono block mb-1.5">RESUME PDF URL</label>
            <input style={inputStyle} value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} placeholder="https://drive.google.com/file/d/.../view or Cloudinary PDF URL" />
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sky-400 text-xs hover:underline">
                <ExternalLink size={12} />Preview resume link
              </a>
            )}
          </div>

          {/* Profile images */}
          <div className="p-6 rounded-2xl" style={{ ...box, border: "1px solid rgba(124,58,237,0.2)" }}>
            <h3 className="text-white font-heading font-bold text-lg mb-2">Profile Images</h3>
            <p className="text-white/30 text-xs font-mono mb-4">Upload images via Gallery → copy Cloudinary URL → paste below.</p>
            <div className="space-y-3">
              {[{ k: "heroImage", l: "Hero Image URL" }, { k: "avatarImage", l: "Avatar / Circular Image URL" }, { k: "aboutImage", l: "About Page Image URL" }, { k: "footerImage", l: "Footer Image URL" }].map(f => (
                <div key={f.k}>
                  <label className="text-white/40 text-xs font-mono block mb-1">{f.l.toUpperCase()}</label>
                  <input style={inputStyle} value={(owner as any)[f.k] || ""} onChange={e => setOwner({ ...owner, [f.k]: e.target.value })} placeholder="https://res.cloudinary.com/..." />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 rounded-2xl" style={box}>
            <h3 className="text-white font-heading font-bold text-lg mb-4">Homepage Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ k: "statProjects", l: "Projects Delivered", def: "20+" }, { k: "statAccuracy", l: "Model Accuracy", def: "94%" }, { k: "statCloud", l: "Cloud Platforms", def: "3" }, { k: "statClients", l: "Clients Served", def: "15+" }].map(f => (
                <div key={f.k}>
                  <label className="text-white/40 text-xs font-mono block mb-1">{f.l.toUpperCase()}</label>
                  <input style={inputStyle} value={(owner as any)[f.k] || f.def} onChange={e => setOwner({ ...owner, [f.k]: e.target.value })} placeholder={f.def} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary mt-6 w-full justify-center text-base py-4 disabled:opacity-60">
        {saving ? <><Loader size={18} className="animate-spin" />Saving...</> : <><Save size={18} />Save All Settings</>}
      </button>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>("dashboard");
  const { data, extras, loading, refresh } = usePortfolioData();

  useEffect(() => {
    fetch("/api/admin/verify").then(r => { if (r.ok) setAuthed(true); }).finally(() => setChecking(false));
  }, []);

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); };

  if (checking) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#050F1E" }}><div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div>;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#070F1F" }}><div className="text-center"><div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" /><p className="text-white/40 text-sm font-mono">Loading...</p></div></div>;

  const render = () => {
    switch (section) {
      case "dashboard": return <Dashboard data={data} extras={extras} />;
      case "projects": return <ProjectsEditor data={data} onRefresh={refresh} />;
      case "blog": return <BlogEditor data={data} onRefresh={refresh} />;
      case "gallery": return <GalleryEditor data={data} onRefresh={refresh} />;
      case "videos": return <VideosEditor data={data} onRefresh={refresh} />;
      case "services": return <ServicesEditor extras={extras} onRefresh={refresh} />;
      case "experience": return <ExperienceEditor extras={extras} onRefresh={refresh} />;
      case "socials": return <SocialsEditor extras={extras} onRefresh={refresh} />;
      case "settings": return <SettingsEditor data={data} onRefresh={refresh} />;
      default: return <Dashboard data={data} extras={extras} />;
    }
  };

  return (
    <div data-admin="true" className="flex h-screen w-screen overflow-hidden" style={{ background: "#070F1F", color: "white" }}>
      <Sidebar active={section} setActive={setSection} onLogout={logout} data={data} extras={extras} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 border-b shrink-0" style={{ background: "rgba(5,15,30,0.8)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div><h2 className="text-white font-heading font-bold text-xl capitalize">{section}</h2><p className="text-white/30 text-xs font-mono">Aquila Admin Portal v4</p></div>
          <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.08)" }}><Globe size={14} />View Site</a>
        </div>
        <main className="flex-1 overflow-y-auto">{render()}</main>
      </div>
    </div>
  );
}
