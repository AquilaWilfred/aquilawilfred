"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, ArrowRight, Code2, Star, ChevronDown, MapPin, Phone, ExternalLink, Award } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { portfolioData, profileImages } from "@/data/portfolio";

const { owner, projects, skills, services } = portfolioData;

const roles = ["Data Scientist","AI/ML Specialist","Full Stack Engineer","Android Developer","Data Engineer","BI Consultant"];

const codeSnippet = `# Aquila — Intelligence at Scale
import tensorflow as tf
from langchain import RAGChain

class EagleWillsAI:
    accuracy = Above 0.80
    
    async def solve(self, problem: str):
        model = await self.load_model()
        insight = model.predict(problem)
        return {"value": insight, "acc": "80%"}

# Transform data → business value 🚀
ai = EagleWillsAI()
result = await ai.solve("your_challenge")`;

export default function HomePage() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setRoleIdx(i => (i+1)%roles.length), 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const role = roles[roleIdx];
    setTyped("");
    let i = 0;
    const t = setInterval(() => { setTyped(role.slice(0,++i)); if(i>=role.length) clearInterval(t); }, 55);
    return () => clearInterval(t);
  }, [roleIdx]);

  const featured = projects.filter(p => p.featured);

  return (
    <>
      <Navbar />
      <TechDecorations />
      <main>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex flex-col justify-center bg-hero grid-bg overflow-hidden">
          <div className="blob w-[700px] h-[700px] top-[-150px] left-[-200px]" style={{background:"rgba(14,165,233,0.15)"}}/>
          <div className="blob w-[500px] h-[500px] bottom-[-100px] right-[-150px]" style={{background:"rgba(124,58,237,0.12)",animationDelay:"2s"}}/>
          <div className="blob w-[400px] h-[400px] top-[30%] right-[15%]" style={{background:"rgba(5,150,105,0.08)",animationDelay:"4s"}}/>

          <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-8 lg:px-16 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[82vh]">

              {/* Left text */}
              <div>
                <h1 className="font-display font-black mb-4 leading-none" style={{fontSize:"clamp(3.5rem,9vw,7.5rem)",letterSpacing:"-0.02em"}}>
                  <span className="text-gradient">AQUILA</span><br/>
                  <span style={{color:"#082F49"}}>WILFRED</span>
                </h1>

                {/* Owner name with inline avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <ProfileAvatar size="sm" showRing={true} animated={true}/>
                  <div>
                    <p className="text-sky-800 font-heading font-semibold text-lg">{owner.name}</p>
                    <p className="text-sky-600/70 text-sm">{owner.company}</p>
                  </div>
                </div>

                <div className="h-12 flex items-center mb-6">
                  <span className="text-2xl font-heading font-bold text-sky-600 typing-cursor">{typed}</span>
                </div>

                <p className="text-sky-900/70 text-lg leading-relaxed mb-8 max-w-xl">
                  Building intelligent end-to-end systems that transform raw data into measurable business value.{" "}
                  <span className="text-sky-600 font-bold">{owner.experience} years</span> of expertise across AI, Web, Mobile & Data.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <Link href="/projects" className="btn-primary">View My Work <ArrowRight size={16}/></Link>
                  <Link href="/contact" className="btn-outline"><Mail size={16}/> Get In Touch</Link>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <a href={owner.socials.github} className="flex items-center gap-2 text-sky-700 hover:text-sky-500 transition-colors text-sm font-medium"><Github size={18}/>GitHub</a>
                  <a href={owner.socials.linkedin} className="flex items-center gap-2 text-sky-700 hover:text-sky-500 transition-colors text-sm font-medium"><Linkedin size={18}/>LinkedIn</a>
                  <div className="flex items-center gap-2 text-sky-700 text-sm"><MapPin size={16} className="text-emerald-500"/>{owner.location}</div>
                </div>
              </div>

              {/* Right: Profile photo + code */}
              <div className="flex flex-col gap-6">
                {/* Large profile photo */}
                <div className="flex justify-center">
                  <div className="relative">
                    <ProfileAvatar size="hero" variant="rounded" animated={true} showRing={true}/>
                    {/* Floating badge cards */}
                    <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-card border border-sky-100 px-4 py-3 flex items-center gap-3" style={{animation:"floatForever 5s ease-in-out infinite"}}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
                        <Award size={18} className="text-white"/>
                      </div>
                      <div>
                        <p className="text-sky-950 font-bold text-sm">94% Accuracy</p>
                        <p className="text-sky-500 text-xs">ML Models</p>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-card border border-sky-100 px-4 py-3 flex items-center gap-3" style={{animation:"floatForever 6s ease-in-out infinite 1s"}}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <Star size={18} className="text-white"/>
                      </div>
                      <div>
                        <p className="text-sky-950 font-bold text-sm">4+ Years</p>
                        <p className="text-sky-500 text-xs">Experience</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={28} className="text-sky-400"/>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-16 bg-gradient-to-r from-sky-600 via-violet-600 to-emerald-600">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {[{value:"4+",label:"Years Experience"},{value:"20+",label:"Projects Shipped"},{value:"94%",label:"Model Accuracy"},{value:"50K+",label:"Daily Predictions"}].map(s=>(
                <div key={s.label}>
                  <div className="font-display font-black text-5xl mb-2 drop-shadow-lg">{s.value}</div>
                  <div className="text-white/80 font-heading font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT STRIP ── */}
        <section className="py-20 bg-white">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="flex justify-center lg:justify-start">
                <ProfileAvatar size="xl" variant="rounded" animated showRing/>
              </div>
              <div className="lg:col-span-2">
                <span className="inline-block bg-sky-100 text-sky-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">THE PERSON BEHIND THE CODE</span>
                <h2 className="section-title mb-4">Hi, I'm <span className="text-gradient">{owner.name}</span></h2>
                <p className="text-sky-900/70 text-lg leading-relaxed mb-6">{owner.bio}</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/about" className="btn-primary">Learn More About Me <ArrowRight size={16}/></Link>
                  <Link href="/contact" className="btn-outline"><Mail size={16}/> Let's Talk</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section className="py-24 bg-section-alt">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
            <div className="text-center mb-16">
              <span className="inline-block bg-sky-100 text-sky-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">WHAT I DO</span>
              <h2 className="section-title mb-4">End-to-End <span className="text-gradient">Technology Solutions</span></h2>
              <p className="text-sky-900/60 text-lg max-w-2xl mx-auto">From AI model architecture to mobile apps — complete ownership, zero hand-offs.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {services.map(s=>(
                <div key={s.title} className="card p-7 group">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="font-heading font-bold text-sky-950 text-lg mb-2">{s.title}</h3>
                  <p className="text-sky-900/60 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <span className="text-emerald-600 text-sm font-mono font-bold">{s.price}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/services" className="btn-outline">View All Services <ArrowRight size={16}/></Link>
            </div>
          </div>
        </section>

        {/* ── FEATURED PROJECTS ── */}
        <section className="py-24" style={{background:"white"}}>
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="inline-block bg-violet-100 text-violet-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">PORTFOLIO</span>
                <h2 className="section-title">Featured <span className="text-gradient">Projects</span></h2>
              </div>
              <Link href="/projects" className="btn-outline hidden md:flex">All Projects <ArrowRight size={16}/></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {featured.map(p=>(
                <div key={p.id} className="card overflow-hidden group">
                  <div className="relative h-52 overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/20 to-transparent"/>
                    <span className="absolute top-3 right-3 bg-white/90 text-sky-700 text-xs font-mono font-bold px-3 py-1 rounded-full">{p.category}</span>
                    {p.featured && <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">★ Featured</span>}
                    {/* Author tag on card */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <img src={profileImages.avatar} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover object-top"/>
                      <span className="text-white text-xs font-medium">by {owner.name.split(" ")[0]}</span>
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-heading font-bold text-sky-950 text-lg mb-2 leading-tight">{p.title}</h3>
                    <p className="text-sky-900/60 text-sm mb-4 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {p.tech.slice(0,3).map(t=><span key={t} className="skill-tag">{t}</span>)}
                      {p.tech.length>3 && <span className="skill-tag">+{p.tech.length-3}</span>}
                    </div>
                    <div className="flex gap-4">
                      <a href={p.github} className="flex items-center gap-1.5 text-sky-600 hover:text-sky-800 text-sm font-medium transition-colors"><Code2 size={14}/>Code</a>
                      <a href={p.live} className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors"><Star size={14}/>Live</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SKILLS ── */}
        <section className="py-24 bg-hero">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 text-center">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">EXPERTISE</span>
            <h2 className="section-title mb-4">Full-Spectrum <span className="text-gradient">Skills</span></h2>
            <div className="flex flex-wrap gap-3 justify-center max-w-5xl mx-auto mb-12">
              {Object.values(skills).flat().slice(0,48).map(skill=>(
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
            <Link href="/skills" className="btn-primary">Explore All Skills <ArrowRight size={16}/></Link>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 bg-gradient-to-br from-sky-900 via-violet-900 to-emerald-900 relative overflow-hidden">
          <div className="blob w-96 h-96 top-0 left-0 opacity-20" style={{background:"#38BDF8"}}/>
          <div className="blob w-80 h-80 bottom-0 right-0 opacity-20" style={{background:"#A78BFA",animationDelay:"3s"}}/>
          <div className="relative z-10 max-w-screen-xl mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-6">
                  <ProfileAvatar size="lg" showRing animated src={profileImages.avatar}/>
                  <div>
                    <p className="text-white font-heading font-bold text-lg">{owner.name}</p>
                    <p className="text-white/60 text-sm">{owner.company}</p>
                    <div className="flex items-center gap-2 mt-1"><div className="pulse-dot"/><span className="text-emerald-300 text-xs font-mono">Available</span></div>
                  </div>
                </div>
                <h2 className="font-display font-black text-4xl md:text-5xl mb-5 leading-tight">
                  Ready to Build Something<br/><span style={{background:"linear-gradient(135deg,#38BDF8,#A78BFA,#6EE7B7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Extraordinary?</span>
                </h2>
                <p className="text-white/70 text-lg mb-8">{owner.availability} — I respond within 24 hours.</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact" className="btn-primary" style={{background:"white",color:"#0C4A6E"}}>
                    <Mail size={16}/> Start a Conversation
                  </Link>
                  <a href={`tel:${owner.phone[0]}`} className="btn-outline" style={{borderColor:"rgba(255,255,255,0.4)",color:"white"}}>
                    <Phone size={16}/>{owner.phone[0]}
                  </a>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <ProfileAvatar size="hero" variant="rounded" animated showRing/>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer/>
    </>
  );
}
