"use client";
import { Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { Play, Youtube } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
import { portfolioData } from "@/data/portfolio";

type Video = typeof portfolioData.videos[0];

function getYTId(url: string) { const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/); return m ? m[1] : null; }

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>(portfolioData.videos);
  const [active, setActive] = useState<Video | null>(portfolioData.videos[0] || null);

  useEffect(() => {
    fetch("/api/videos")
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.length) {
          setVideos(data);
          setActive(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  const embedUrl = active ? `https://www.youtube.com/embed/${getYTId(active.url)}?autoplay=1&rel=0` : null;
  return (<>
    <Navbar/><TechDecorations pageName="Video Studio"/>
    <main className="pt-24 pb-24 min-h-screen bg-hero grid-bg">
      <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
        <div className="text-center mb-12 pt-10">
          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">MEDIA</span>
          <h1 className="section-title mb-4">Video <span className="text-gradient">Studio</span></h1>
          <p className="text-sky-900/60 text-lg">Demos, tutorials, and project walkthroughs</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main player — 3/4 of screen width */}
          <div className="xl:col-span-3">
            <div className="card overflow-hidden">
              <div className="relative bg-sky-950" style={{paddingBottom:"56.25%"}}>
                {embedUrl?(
                  <iframe className="absolute inset-0 w-full h-full" src={embedUrl} title={active?.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                ):(
                  <div className="absolute inset-0 flex items-center justify-center text-sky-400">Select a video</div>
                )}
              </div>
              {active && (
                <div className="p-7 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-heading font-bold text-sky-950 text-xl mb-2">{active.title}</h2>
                      <span className="bg-sky-100 text-sky-700 text-xs font-mono font-bold px-3 py-1 rounded-full">{active.category}</span>
                    </div>
                    <a href={active.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-900/40 hover:text-red-500 transition-colors text-sm">
                      <Youtube size={18}/> Watch on YouTube
                    </a>
                  </div>
                </div>
              )}
            </div>
          <div className="mt-auto relative overflow-hidden rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 p-8 text-center shadow-[0_0_40px_rgba(56,189,248,0.08)]">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(56,189,248,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.4) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
          {/* Glowing orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-sky-400" />
              <div className="p-2 rounded-lg bg-sky-400/10 border border-sky-400/20">
                <Brain size={28} className="text-sky-300" />
              </div>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-sky-400" />
            </div>

            <p className="text-xs font-mono tracking-[0.3em] text-sky-400/70 uppercase mb-2">Extreme Cognitive Vision</p>
            <h3 className="font-heading font-bold text-white text-xl mb-2 leading-tight">
              Neural Signal Aggregator
            </h3>
            <p className="text-sky-300/50 text-sm max-w-xs mx-auto">
                Pipe raw model outputs, research vectors, and inference streams into a unified cognitive layer.
            </p>
          </div>
        </div>
          </div>
          {/* Playlist sidebar */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-sky-950 text-lg">Playlist</h3>
            {videos.map(v=>(
              <div key={v.id} onClick={()=>setActive(v)} className={`card overflow-hidden cursor-pointer transition-all ${active?.id===v.id?"ring-2 ring-sky-500 shadow-blue":""}`}>
                <div className="relative h-28 overflow-hidden group">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                  <div className="absolute inset-0 bg-sky-950/50 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                      <Play size={16} className="text-white ml-0.5"/>
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 bg-white/90 text-sky-700 text-xs px-2 py-0.5 rounded font-mono font-bold">{v.category}</span>
                </div>
                <div className="p-4"><p className="text-sky-950 text-sm font-medium line-clamp-2">{v.title}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
    <Footer/>
  </>);
}
