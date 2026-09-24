"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Download, MapPin, FileText, ExternalLink, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
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
  const [resumeUrl, setResumeUrl] = useState("/myResume.pdf");

  useEffect(() => {
    fetch("/api/experience").then(r => r.json()).then(({ data }) => {
      if (data?.length) setExperience(data.filter((e: any) => e.visible !== false));
    }).catch(() => {});
    fetch("/api/settings").then(r => r.json()).then(({ data }) => {
      if (data) { setOwnerData((p: any) => ({ ...p, ...data })); if (data.resumeUrl) setResumeUrl(data.resumeUrl); }
    }).catch(() => {});
  }, []);

  return (<>
    <Navbar />
    <TechDecorations />
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
                {resumeUrl && <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-outline"><Download size={16} /> Download CV</a>}
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
      {resumeUrl && (
        <section className="py-20 bg-gradient-to-br from-sky-950 via-violet-950 to-sky-950 relative overflow-hidden">
          <div className="blob w-96 h-96 top-0 right-0 opacity-10" style={{ background: "#38BDF8" }} />
          <div className="blob w-72 h-72 bottom-0 left-0 opacity-10" style={{ background: "#A78BFA", animationDelay: "2s" }} />
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 relative z-10">
            <div className="text-center mb-12">
              <span className="inline-block bg-white/10 text-white text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">MY RESUME</span>
              <h2 className="font-heading font-bold text-white text-3xl mb-3">Curriculum Vitae</h2>
              <p className="text-white/50 text-sm">Click to open the full document</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="group block relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                <iframe src={resumeUrl.includes("drive.google.com") ? resumeUrl.replace("/view", "/preview") : `${resumeUrl}#page=1&view=FitH&toolbar=0&navpanes=0`}
                  className="w-full pointer-events-none" style={{ height: "500px", border: "none", background: "#fff" }} title="Resume Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/95 via-sky-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-12">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-xl"><FileText size={28} className="text-white" /></div>
                    <p className="text-white font-heading font-bold text-xl mb-2">Open Full Resume</p>
                    <p className="text-white/60 text-sm flex items-center justify-center gap-2"><ExternalLink size={14} />Opens in new tab</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between" style={{ background: "rgba(5,15,40,0.9)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center"><FileText size={16} className="text-white" /></div>
                    <div><p className="text-white text-sm font-heading font-semibold">{ownerData.name} — CV</p><p className="text-white/40 text-xs font-mono">Click to open full document</p></div>
                  </div>
                  <div className="flex items-center gap-2 bg-sky-500 px-4 py-2 rounded-xl"><Download size={14} className="text-white" /><span className="text-white text-sm font-semibold">Download</span></div>
                </div>
              </a>
            </div>
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
    <Footer />
  </>);
}