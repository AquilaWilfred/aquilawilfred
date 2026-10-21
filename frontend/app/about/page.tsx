"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, ChevronUp, Download, Eye, MapPin, Minus, PanelLeft, Plus, Sparkles, X } from "lucide-react";
import { useMemo } from "react";
import { buildCvHtml, printPdf, withTemplate, TEMPLATES, DEFAULT_LAYOUT, type CV, norm } from "@/lib/cv/engine";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { portfolioData, profileImages } from "@/data/portfolio";

const photoStories = [
  {
    src: profileImages.hero,
    objectPos: "center top",
    mood: "FOCUS MODE",
    moodColor: "#38BDF8",
    title: "The Architect",
    caption: "Half body. Bold. Certain. This is the version of Aquila that stares at a blank Jupyter notebook at 2am and sees not emptiness — but infinite possibility. The cognitive weight of building AI systems that matter sits comfortably here.",
    tag: "AI/ML · Deep Work",
  },
  {
    src: profileImages.about,
    objectPos: "center top",
    mood: "JOY IN MOTION",
    moodColor: "#6EE7B7",
    title: "Full Life, Full Stack",
    caption: "Standing. Happy. Grounded. This is what it feels like when a model finally converges, when a pipeline clears 1M records without error, when a client says 'this changed our business.' The fullness of that win lives in this posture.",
    tag: "Celebrating Wins · Nairobi",
  },
  {
    src: profileImages.contact,
    objectPos: "center 20%",
    mood: "FORWARD MOMENTUM",
    moodColor: "#A78BFA",
    title: "Walking Into the Future",
    caption: "Smooth stride. Confident pace. In the XcognVis universe, standing still is not an option. Every step is intentional — from model ideation to production deployment. This is the energy that powers 50,000+ daily predictions.",
    tag: "Innovation · Always Moving",
  },
  {
    src: profileImages.avatar,
    objectPos: "center center",
    mood: "THE BRAND",
    moodColor: "#FBBF24",
    title: "Eagle. Wills. Always.",
    caption: "The Aquila avatar — a visual identity born from the intersection of intelligence and artistry. In a world of data and algorithms, this is the human imagination at the core of every system built under XcognVis.Com.",
    tag: "Identity · Brand · Vision",
  },
];

// ── CV GALLERY: small cards, click to open the full preview ──────────────────
function CvThumb({ cv }: { cv: CV }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const html = useMemo(() => {
    try { return buildCvHtml(cv, false); } catch { return ""; }
  }, [cv]);

  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 794));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: "210 / 297" }}>
      <iframe
        title="CV thumbnail" srcDoc={html} sandbox="allow-scripts" tabIndex={-1} aria-hidden
        style={{ position: "absolute", left: 0, top: 0, width: 794, height: 1123, border: 0,
          transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}
      />
    </div>
  );
}

const PITCH = 1128.74; // one A4 page (296mm) plus the 10px gap, in the screen preview

function PageThumb({ html, index, active, onClick }: { html: string; index: number; active: boolean; onClick: () => void }) {
  const W = 112, s = W / 794, h = 1118.74 * s;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 w-full group" aria-label={`Go to page ${index + 1}`}>
      <div className={`relative overflow-hidden bg-white rounded-sm transition-all ${active ? "ring-2 ring-sky-400" : "ring-1 ring-white/20 group-hover:ring-white/50"}`}
        style={{ width: W, height: h }}>
        <iframe title={`Page ${index + 1}`} srcDoc={html} sandbox="allow-scripts" scrolling="no" tabIndex={-1} aria-hidden
          style={{ position: "absolute", left: 0, top: 0, width: 794, height: (index + 1) * 1119, border: 0, pointerEvents: "none",
            transformOrigin: "top left", transform: `translateY(${-index * 1118.74 * s}px) scale(${s})` }} />
      </div>
      <span className={`text-xs font-mono ${active ? "text-sky-300" : "text-white/50"}`}>{index + 1}</span>
    </button>
  );
}

const ZMIN = 0.4, ZMAX = 2.5;

// Bottom edge of the site navbar, so the viewer can start right under it.
function navbarBottom() {
  const n = document.querySelector("header") ?? document.querySelector("nav");
  const b = n ? Math.round(n.getBoundingClientRect().bottom) : 0;
  return b > 0 && b < 240 ? b : 96;
}

function CvModal({ cv, initial, name, onClose }: { cv: CV; initial: string; name: string; onClose: () => void }) {
  const [tpl, setTpl] = useState(initial);
  const [pages, setPages] = useState(1);
  const [toc, setToc] = useState<{ t: string; p: number; y: number }[]>([]);
  const [cur, setCur] = useState(0);
  const [avail, setAvail] = useState(900);
  const [zoom, setZoom] = useState<number | null>(null); // null = fit to width
  const [top, setTop] = useState(navbarBottom);
  const [side, setSide] = useState(() => window.innerWidth >= 768);
  const [tab, setTab] = useState<"pages" | "outline">("pages");
  const scroller = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const keep = useRef<number | null>(null);

  const shown = useMemo(() => withTemplate(cv, tpl), [cv, tpl]);
  const html = useMemo(() => {
    try { return buildCvHtml(shown, true); }
    catch (e) { console.error("CV render failed", e); return "<p style='font-family:sans-serif;padding:24px'>CV preview unavailable.</p>"; }
  }, [shown]);
  const thumbHtml = useMemo(() => { try { return buildCvHtml(shown, false); } catch { return ""; } }, [shown]);

  const fit = Math.min(1.5, Math.max(0.3, (avail - 32) / 794));
  const scale = zoom ?? fit;

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || typeof e.data?.cvPages !== "number") return;
      setPages(e.data.cvPages);
      if (Array.isArray(e.data.toc)) setToc(e.data.toc);
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);

  useEffect(() => {
    if (!scroller.current) return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(scroller.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => setTop(navbarBottom());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  // After a zoom change, keep looking at the same part of the CV.
  useLayoutEffect(() => {
    if (keep.current != null && scroller.current) {
      scroller.current.scrollTop = keep.current * scale;
      keep.current = null;
    }
  }, [scale]);

  const setZ = (z: number | null) => {
    const next = z === null ? fit : Math.min(ZMAX, Math.max(ZMIN, Math.round(z * 100) / 100));
    if (next !== scale && scroller.current) keep.current = scroller.current.scrollTop / scale;
    setZoom(z === null ? null : next);
  };

  const goTo = (y: number) => scroller.current?.scrollTo({ top: Math.max(0, y * scale), behavior: "smooth" });
  const goPage = (i: number) => goTo(Math.min(pages - 1, Math.max(0, i)) * PITCH);
  const onScroll = () => {
    const el = scroller.current; if (!el) return;
    const mid = el.scrollTop / scale + el.clientHeight / scale / 2;
    setCur(Math.min(pages - 1, Math.max(0, Math.floor((mid - 10) / PITCH))));
  };
  const pickTemplate = (id: string) => {
    setTpl(id); setPages(1); setToc([]); setCur(0);
    scroller.current?.scrollTo({ top: 0 });
  };

  const H = 20 + pages * 1129;
  const iconBtn = "p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 disabled:opacity-30 disabled:hover:bg-white/10";

  return createPortal(
    // starts below the site navbar, so the navbar always stays visible and clickable
    <div onClick={onClose} className="fixed left-0 right-0 bottom-0 z-40 p-2 md:p-3"
      style={{ top, background: "rgba(2,6,23,0.88)", backdropFilter: "blur(8px)" }}>
      <div onClick={e => e.stopPropagation()}
        className="flex flex-col w-full h-full rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shadow-2xl">

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-white/10">
          <button onClick={() => setSide(s => !s)} aria-label="Toggle sidebar" className={`${iconBtn} ${side ? "!bg-sky-500/30" : ""}`}>
            <PanelLeft size={16} />
          </button>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_IDS.map(id => (
              <button key={id} onClick={() => pickTemplate(id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-heading font-semibold border transition-all ${tpl === id ? "bg-sky-500 border-sky-400 text-white" : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"}`}>
                {TEMPLATES[id].label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            {/* zoom */}
            <div className="flex items-center gap-1">
              <button onClick={() => setZ(scale - 0.1)} disabled={scale <= ZMIN} aria-label="Zoom out" className={iconBtn}><Minus size={16} /></button>
              <button onClick={() => setZ(null)} title="Fit to width"
                className="min-w-[3.5rem] px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-sm font-mono">
                {Math.round(scale * 100)}%
              </button>
              <button onClick={() => setZ(scale + 0.1)} disabled={scale >= ZMAX} aria-label="Zoom in" className={iconBtn}><Plus size={16} /></button>
            </div>
            <span className="w-px h-6 bg-white/15 mx-1 hidden sm:block" />
            {/* page nav */}
            <button onClick={() => goPage(cur - 1)} disabled={cur <= 0} aria-label="Previous page" className={iconBtn}><ChevronUp size={16} /></button>
            <span className="text-white/80 text-sm font-mono min-w-[3.5rem] text-center">{cur + 1} / {pages}</span>
            <button onClick={() => goPage(cur + 1)} disabled={cur >= pages - 1} aria-label="Next page" className={iconBtn}><ChevronDown size={16} /></button>
            <button onClick={() => printPdf(shown)}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-colors ml-1">
              <Download size={15} /> <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button onClick={onClose} aria-label="Close" className={iconBtn}><X size={16} /></button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* sidebar: pages + outline */}
          {side && (
            <aside className="w-40 shrink-0 flex flex-col border-r border-white/10 bg-slate-950/60">
              <div className="flex p-2 gap-1 border-b border-white/10">
                {(["pages", "outline"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize ${tab === t ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"}`}>{t}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {tab === "pages" ? (
                  <div className="flex flex-col items-center gap-4">
                    {Array.from({ length: pages }, (_, i) => (
                      <PageThumb key={`${tpl}-${i}`} html={thumbHtml} index={i} active={cur === i} onClick={() => goPage(i)} />
                    ))}
                  </div>
                ) : toc.length ? (
                  <ul className="space-y-1">
                    {toc.map((s, i) => (
                      <li key={i}>
                        <button onClick={() => goTo(10 + s.p * PITCH + s.y - 12)}
                          className="w-full text-left px-2 py-1.5 rounded-md text-xs text-white/70 hover:bg-white/10 hover:text-white flex justify-between gap-2">
                          <span className="truncate">{s.t}</span>
                          <span className="font-mono text-white/40 shrink-0">{s.p + 1}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-white/40 text-xs">No sections yet.</p>}
              </div>
            </aside>
          )}

          {/* full preview, scrolls both ways when zoomed in */}
          <div ref={scroller} onScroll={onScroll} className="flex-1 min-w-0 overflow-auto" style={{ background: "#94A3B8" }}>
            <div className="mx-auto" style={{ width: 794 * scale, height: H * scale }}>
              <iframe key={tpl} ref={frame} title={`${name} CV`} srcDoc={html} sandbox="allow-scripts allow-popups" scrolling="no"
                style={{ width: 794, height: H, border: 0, display: "block", transform: `scale(${scale})`, transformOrigin: "top left" }} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const TEMPLATE_IDS = Object.keys(TEMPLATES);

function CvShowcase({ cv, name }: { cv: CV; name: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const cards = useMemo(() => TEMPLATE_IDS.map(id => ({ id, cv: withTemplate(cv, id) })), [cv]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {cards.map(({ id, cv: tcv }) => (
          <div key={id} className="group flex flex-col">
            <button onClick={() => setOpen(id)} aria-label={`View ${TEMPLATES[id].label} CV`}
              className="relative block rounded-xl overflow-hidden border border-white/15 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-sky-400/60">
              <CvThumb cv={tcv} />
              <div className="absolute inset-0 flex items-center justify-center bg-sky-950/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-2 bg-white text-sky-900 text-sm font-semibold px-4 py-2 rounded-lg shadow">
                  <Eye size={15} /> View
                </span>
              </div>
            </button>
            <div className="mt-4 text-center">
              <p className="font-heading font-semibold text-white">{TEMPLATES[id].label}</p>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">{TEMPLATES[id].blurb}</p>
              <div className="flex justify-center gap-2 mt-3">
                <button onClick={() => setOpen(id)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-white text-xs font-semibold">
                  <Eye size={13} /> View
                </button>
                <button onClick={() => printPdf(tcv)}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 px-3 py-1.5 rounded-lg text-white text-xs font-semibold">
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {open && <CvModal cv={cv} initial={open} name={name} onClose={() => setOpen(null)} />}
    </>
  );
}
// ── LIGHTBOX — full image, no crop ───────────────────────────────────────────
function Lightbox({ story, onClose }: { story: typeof photoStories[0]; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "lbFadeIn 0.22s ease",
      }}
    >
      <style>{`
        @keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lbScale  { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* ESC hint */}
      <button onClick={onClose} style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", color:"rgba(255,255,255,0.6)", padding:"6px 14px", cursor:"pointer", fontSize:"12px", fontFamily:"monospace", display:"flex", alignItems:"center", gap:"6px" }}>
        <X size={13}/> ESC
      </button>

      {/* Mood tag */}
      <div style={{ position:"absolute", top:20, left:24, background:"rgba(0,0,0,0.7)", border:`1px solid ${story.moodColor}50`, borderRadius:"99px", padding:"5px 14px" }}>
        <span style={{ color:story.moodColor, fontSize:"11px", fontFamily:"monospace", fontWeight:700, letterSpacing:"0.15em" }}>● {story.mood}</span>
      </div>

      {/* Image + caption panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display:"flex", flexDirection:"column",
          maxWidth:"90vw", maxHeight:"92vh",
          borderRadius:"20px", overflow:"hidden",
          border:`1px solid ${story.moodColor}25`,
          boxShadow:`0 40px 120px rgba(0,0,0,0.9), 0 0 80px ${story.moodColor}15`,
          animation:"lbScale 0.3s cubic-bezier(0.34,1.2,0.64,1)",
        }}
      >
        {/* Full image — objectFit:contain so NOTHING is cropped */}
        <img
          src={story.src}
          alt={story.title}
          style={{
            maxWidth:"88vw",
            maxHeight:"72vh",
            objectFit:"contain",   // ← key: full image, no crop
            background:"#080E1C",
            display:"block",
          }}
        />

        {/* Caption strip */}
        <div style={{ background:"rgba(5,10,25,0.98)", padding:"18px 24px", borderTop:`2px solid ${story.moodColor}30`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px" }}>
            <div style={{ flex:1 }}>
              <p style={{ color:"white", fontWeight:800, fontSize:"16px", margin:"0 0 3px" }}>{story.title}</p>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"11px", fontFamily:"monospace", margin:"0 0 8px" }}>{story.tag}</p>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"13px", lineHeight:1.65, margin:0, fontStyle:"italic", maxWidth:"620px" }}>{story.caption}</p>
            </div>
            <div style={{ background:`${story.moodColor}15`, border:`1px solid ${story.moodColor}35`, borderRadius:"10px", padding:"5px 14px", flexShrink:0 }}>
              <span style={{ color:story.moodColor, fontSize:"10px", fontFamily:"monospace", fontWeight:700 }}>FULL VIEW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PHOTO CARD ────────────────────────────────────────────────────────────────
function PhotoCard({ story, tall = false, delay = 0 }: { story: typeof photoStories[0]; tall?: boolean; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [captionPhase, setCaptionPhase] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const timers = useRef<any[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    if (hovered) {
      timers.current = [
        setTimeout(() => setCaptionPhase(1), 0),
        setTimeout(() => setCaptionPhase(2), 280),
        setTimeout(() => setCaptionPhase(3), 560),
      ];
    } else {
      setCaptionPhase(0);
    }
    return () => timers.current.forEach(clearTimeout);
  }, [hovered]);

  return (
    <>
      {lightbox && <Lightbox story={story} onClose={() => setLightbox(false)} />}
      <div
        ref={ref}
        className="relative rounded-3xl overflow-hidden group"
        style={{
          height: tall ? 500 : 240,
          cursor: "zoom-in",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) ${delay}ms`,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setLightbox(true)}
      >
        {/* Photo */}
        <img
          src={story.src}
          alt={story.title}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: story.objectPos,
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: hovered
            ? "linear-gradient(to top,rgba(5,15,40,0.97) 0%,rgba(5,15,40,0.55) 50%,rgba(5,15,40,0.08) 100%)"
            : "linear-gradient(to top,rgba(5,15,40,0.72) 0%,rgba(5,15,40,0.08) 60%,transparent 100%)",
          transition: "background 0.5s ease",
        }} />

        {/* Mood tag — top left */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          border: `1px solid ${story.moodColor}40`,
          borderRadius: "99px", padding: "4px 12px",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-10px)",
          transition: `opacity 0.5s ease ${delay + 200}ms, transform 0.5s ease ${delay + 200}ms`,
        }}>
          <span style={{ color: story.moodColor, fontSize: "10px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.15em" }}>● {story.mood}</span>
        </div>

        {/* Zoom hint on hover — top right */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "8px", padding: "4px 10px",
          opacity: captionPhase >= 1 ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", fontFamily: "monospace" }}>🔍 click to expand</span>
        </div>

        {/* Caption */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 24px" }}>
          <div style={{
            display: "inline-block", background: `${story.moodColor}20`,
            border: `1px solid ${story.moodColor}40`, borderRadius: "6px",
            padding: "2px 10px", marginBottom: "6px",
            opacity: captionPhase >= 1 ? 1 : 0,
            transform: captionPhase >= 1 ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}>
            <span style={{ color: story.moodColor, fontSize: "10px", fontFamily: "monospace", fontWeight: 700 }}>{story.tag}</span>
          </div>

          <h3 style={{
            color: "white", fontSize: "18px", fontWeight: 800, margin: "0 0 6px", lineHeight: 1.2,
            opacity: captionPhase >= 2 ? 1 : 0,
            transform: captionPhase >= 2 ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}>{story.title}</h3>

          <p style={{
            color: "rgba(255,255,255,0.7)", fontSize: "12px", lineHeight: 1.65,
            margin: 0, fontStyle: "italic",
            opacity: captionPhase >= 3 ? 1 : 0,
            transform: captionPhase >= 3 ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
            display: "-webkit-box", WebkitLineClamp: tall ? 4 : 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{story.caption}</p>
        </div>

        {/* Accent line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "3px",
          background: `linear-gradient(90deg,${story.moodColor},transparent)`,
          opacity: hovered ? 1 : 0, transition: "opacity 0.4s ease",
        }} />
      </div>
    </>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [activeExp, setActiveExp] = useState<number | null>(null);
  const [experience, setExperience] = useState<any[]>(portfolioData.experience);
  const [ownerData, setOwnerData] = useState<any>(portfolioData.owner);
  const [cv, setCv] = useState<CV | null>(null);
  const [cvReady, setCvReady] = useState(false);
  const [heroPreview, setHeroPreview] = useState(false);

  const fallbackCv = useMemo(() => norm({
    name: ownerData.name || "Aquila Wilfred",
    headline: ownerData.title || "AI Engineer & Software Developer",
    email: ownerData.email || "",
    phone: ownerData.phone || "",
    location: ownerData.location || "Nairobi, Kenya",
    photo: profileImages.avatar || "",
    summary: ownerData.bio || "",
    links: [],
    skills: [{ group: "Core", items: "AI, product strategy, software engineering" }],
    languages: "English",
    education: [{
      title: "Professional profile",
      org: ownerData.company || "Independent consulting",
      period: "Available",
      body: "<p>Building AI, automation and digital products that turn ideas into measurable outcomes.</p>",
    }],
    experience: [],
    projects: [],
    competitions: [],
    certifications: [],
    awards: [],
    volunteering: [],
    referees: [],
    layout: { ...DEFAULT_LAYOUT, ...TEMPLATES.classic.layout } as typeof DEFAULT_LAYOUT,
  }), [ownerData]);

  useEffect(() => {
    let alive = true;
    const getJson = (u: string) => fetch(u).then(r => r.json()).catch(() => null);

    getJson("/api/experience").then(p => {
      if (alive && Array.isArray(p?.data) && p.data.length) setExperience(p.data.filter((e: any) => e.visible !== false));
    });
    getJson("/api/settings").then(p => {
      if (alive && p?.data) setOwnerData((o: any) => ({ ...o, ...p.data }));
    });
    getJson("/api/cv").then(p => {
      if (!alive) return;
      const raw = p?.data;
      const c = raw && typeof raw === "object" && "data" in raw ? raw.data : raw;
      setCv(c && typeof c === "object" && Array.isArray((c as any).education) ? norm(c) : null);
      setCvReady(true);
    });
    return () => { alive = false; };
  }, []); // run once; depending on fallbackCv re-triggered the fetches in a loop

  return (<>
    <Navbar />
    <main className="pt-24 pb-24 min-h-screen">

      {/* HERO */}
      <section className="bg-hero grid-bg py-24 relative overflow-hidden">
        <div className="blob w-[600px] h-[600px] top-[-100px] right-[-100px]" style={{ background: "rgba(124,58,237,0.1)" }} />
        <div className="blob w-[400px] h-[400px] bottom-[-50px] left-[10%]" style={{ background: "rgba(14,165,233,0.1)", animationDelay: "2s" }} />
        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative">
                <ProfileAvatar size="hero" variant="rounded" animated showRing />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white rounded-2xl shadow-card border border-sky-100 px-6 py-3 text-center">
                  <p className="font-heading font-bold text-sky-950">{ownerData.name}</p>
                  <p className="text-sky-500 text-sm">{ownerData.company}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 mt-8 lg:mt-0">
              <span className="inline-block bg-sky-100 text-sky-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest">ABOUT ME</span>
              <h1 className="section-title mb-5">
                {ownerData.name.split(" ").slice(0, 2).join(" ")}{" "}
                <span className="text-gradient">{ownerData.name.split(" ").slice(2).join(" ")}</span>
              </h1>
              <p className="text-sky-900/70 leading-relaxed mb-5 text-lg">{ownerData.bio}</p>
              <p className="text-sky-900/60 leading-relaxed mb-8">I work independently with complete ownership of every engagement — personally architecting solutions, writing production-grade code, and iterating until results exceed expectations.</p>
              <div className="flex items-center gap-2 mb-8">
                <MapPin size={16} className="text-emerald-500" />
                <span className="text-sky-700">{ownerData.location}</span>
                <span className="mx-2 text-sky-200">·</span>
                <div className="pulse-dot" />
                <span className="text-emerald-600 text-sm font-semibold ml-1">{ownerData.availability}</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">Work With Me <ArrowRight size={16} /></Link>
                <button onClick={() => setHeroPreview(true)} disabled={!cvReady} className="btn-outline"><Eye size={16} /> Preview</button>
                <Link href="/create-cv" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-sky-500 hover:opacity-90 transition">
                  <Sparkles size={16} /> Create yours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-gradient-to-r from-sky-600 via-violet-600 to-emerald-600">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[{ v: "4+", l: "Years Experience" }, { v: "20+", l: "Projects Delivered" }, { v: "94%", l: "Model Accuracy" }, { v: "3", l: "Cloud Platforms" }].map(s => (
              <div key={s.l}><div className="font-display font-black text-5xl mb-2 drop-shadow-lg">{s.v}</div><div className="text-white/80 font-heading font-medium">{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* PHOTO STORIES */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-10">
            <span className="inline-block bg-violet-100 text-violet-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">THE PERSON BEHIND THE CODE</span>
            <h2 className="section-title">Meet <span className="text-gradient">{ownerData.name.split(" ")[0]}</span></h2>
            <p className="text-sky-900/40 text-xs mt-2 font-mono tracking-widest">HOVER TO READ THE STORY · CLICK TO VIEW FULL IMAGE</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-5"><PhotoCard story={photoStories[0]} tall delay={0} /></div>
            <div className="md:col-span-7 grid grid-cols-2 gap-5">
              <PhotoCard story={photoStories[1]} delay={150} />
              <PhotoCard story={photoStories[2]} delay={250} />
              <div className="col-span-2"><PhotoCard story={photoStories[3]} delay={350} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* RESUME */}
      {cvReady  && (
        <section className="py-20 bg-gradient-to-br from-sky-950 via-violet-950 to-sky-950 relative overflow-hidden">
          <div className="blob w-96 h-96 top-0 right-0 opacity-10" style={{ background: "#38BDF8" }} />
          <div className="blob w-72 h-72 bottom-0 left-0 opacity-10" style={{ background: "#A78BFA", animationDelay: "2s" }} />
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 relative z-10">
            <div className="text-center mb-10">
              <span className="inline-block bg-white/10 text-white text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">MY RESUME</span>
              <h2 className="font-heading font-bold text-white text-3xl mb-3">Curriculum Vitae</h2>
              <p className="text-white/50 text-sm">Click a template to preview it full size, then download it.</p>
            </div>
            <CvShowcase cv={cv ?? fallbackCv} name={ownerData.name} />
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      <section className="py-24 bg-section-alt">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-14">
            <span className="inline-block bg-sky-100 text-sky-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">CAREER</span>
            <h2 className="section-title">Professional <span className="text-gradient">Experience</span></h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-[calc(2rem+2px)] top-0 bottom-0 w-1 rounded-full" style={{ background: "linear-gradient(to bottom,#0EA5E9,#7C3AED,#059669)" }} />
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <div key={exp.id || i} className="relative pl-20 cursor-pointer" onClick={() => setActiveExp(activeExp === i ? null : i)}>
                  <div className={`absolute left-6 top-8 w-5 h-5 rounded-full border-4 border-white z-10 transition-all ${activeExp === i ? "scale-125" : "scale-100"}`}
                    style={{ background: "linear-gradient(135deg,#0EA5E9,#7C3AED)", boxShadow: activeExp === i ? "0 0 20px rgba(14,165,233,0.6)" : "0 4px 12px rgba(14,165,233,0.3)" }} />
                  <div className={`card p-8 transition-all ${activeExp === i ? "border-sky-300 shadow-card-hover" : ""}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-4">
                        <ProfileAvatar size="sm" showRing={false} animated={false} className="shrink-0" />
                        <div>
                          <h3 className="font-heading font-bold text-sky-950 text-xl">{exp.role}</h3>
                          <p className="text-sky-500 font-semibold">{exp.company}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sky-900/50 text-sm font-mono">{exp.period}</p>
                        <p className="text-sky-900/40 text-xs">{exp.location}</p>
                      </div>
                    </div>
                    {activeExp === i && (
                      <ul className="space-y-2 mt-4 border-t border-sky-100 pt-4">
                        {(exp.highlights || []).map((h: string, j: number) => (
                          <li key={j} className="flex gap-3 text-sky-900/60 text-sm leading-relaxed"><span className="text-emerald-500 mt-0.5 shrink-0">▸</span>{h}</li>
                        ))}
                      </ul>
                    )}
                    {activeExp !== i && <p className="text-sky-900/40 text-sm mt-2">Click to expand ↓</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="card p-10 flex flex-wrap items-start gap-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 flex items-center justify-center text-3xl border border-sky-100 shrink-0">🎓</div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-sky-950 text-xl">Bachelor of Science in Computer Science</h3>
              <p className="text-sky-500 font-semibold">Mount Kenya University (MKU) · Nairobi, Kenya</p>
              <p className="text-sky-900/40 text-sm font-mono mt-1">Currently Pursuing · Expected 2025</p>
              <p className="text-sky-900/60 text-sm mt-3 max-w-2xl leading-relaxed">Comprehensive programme covering software engineering, algorithms, data structures, OS, database management, computer networks, and modern computing.</p>
            </div>
            <div className="shrink-0"><ProfileAvatar size="md" showRing animated /></div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="py-20 bg-gradient-to-br from-sky-900 via-violet-900 to-emerald-900">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <ProfileAvatar size="lg" showRing animated className="mx-auto mb-8" />
          <p className="text-3xl font-heading italic text-white/90 mb-5 leading-relaxed">
            &quot;Learning is not weakness — it is wisdom and experience earned.&quot;
          </p>
          <p className="text-sky-300 font-mono text-sm">— {ownerData.name}, Founder, {ownerData.company}</p>
        </div>
      </section>
    </main>
    {heroPreview && (
      <CvModal cv={cv ?? fallbackCv} initial={(cv ?? fallbackCv).layout.template} name={ownerData.name} onClose={() => setHeroPreview(false)} />
    )}
    <Footer />
  </>);
}