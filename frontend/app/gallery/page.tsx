"use client";
import { useState, useEffect } from "react";
import { ZoomIn, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
import { portfolioData } from "@/data/portfolio";

type GalleryItem = typeof portfolioData.gallery[0];

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(portfolioData.gallery);
  const [cat, setCat] = useState("All");
  const [lb, setLb] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then(({ data }) => { if (data?.length) setGallery(data); })
      .catch(() => {});
  }, []);

  const cats = ["All", ...Array.from(new Set(gallery.map(g => g.category)))];
  const filtered = cat === "All" ? gallery : gallery.filter(g => g.category === cat);
  return (<>
    <Navbar/><TechDecorations pageName="Gallery"/>
    <main className="pt-24 pb-24 min-h-screen bg-hero grid-bg">
      <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
        <div className="text-center mb-16 pt-10">
          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">VISUAL SHOWCASE</span>
          <h1 className="section-title mb-4">Project <span className="text-gradient">Gallery</span></h1>
          <p className="text-sky-900/60 text-lg max-w-xl mx-auto">Screenshots, visualizations, and project highlights.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              className={`px-5 py-2 rounded-full text-sm font-heading font-semibold transition-all ${cat===c?"btn-primary py-2 px-5":"btn-outline py-2 px-5"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filtered.map((item,i)=>(
            <div key={item.id} className="break-inside-avoid card overflow-hidden group cursor-pointer" onClick={()=>setLb(item)}>
              <div className="relative overflow-hidden" style={{height:i%3===0?"280px":"200px"}}>
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur w-12 h-12 rounded-full flex items-center justify-center">
                    <ZoomIn size={20} className="text-white"/>
                  </div>
                </div>
                <span className="absolute top-3 right-3 bg-white/90 text-sky-700 text-xs font-mono font-bold px-2 py-1 rounded-full">{item.category}</span>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-sky-950 mb-2">{item.title}</h3>
                <div className="flex flex-wrap gap-1">{item.tags.map(t=><span key={t} className="skill-tag">{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
    {lb && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/90 backdrop-blur-sm" onClick={()=>setLb(null)}>
        <div className="relative max-w-5xl w-full" onClick={e=>e.stopPropagation()}>
          <button onClick={()=>setLb(null)} className="absolute -top-12 right-0 bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/40"><X size={20}/></button>
          <img src={lb.image} alt={lb.title} className="w-full rounded-2xl object-cover max-h-[75vh]"/>
          <div className="bg-white rounded-xl p-5 mt-4 flex items-center justify-between">
            <div><h3 className="font-heading font-bold text-sky-950">{lb.title}</h3><div className="flex gap-2 mt-1">{lb.tags.map(t=><span key={t} className="skill-tag">{t}</span>)}</div></div>
            <span className="bg-sky-100 text-sky-700 text-xs font-mono font-bold px-3 py-1 rounded-full">{lb.category}</span>
          </div>
        </div>
      </div>
    )}
    <Footer/>
  </>);
}
