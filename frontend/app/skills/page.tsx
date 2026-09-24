"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
import { portfolioData } from "@/data/portfolio";
const { skills } = portfolioData;
const colors: Record<string,string> = {"AI & Machine Learning":"#0EA5E9","NLP & Conversational AI":"#7C3AED","Full Stack Web":"#059669","Android Development":"#F59E0B","Data Engineering":"#06B6D4","Cloud & DevOps":"#EF4444","Data Science":"#8B5CF6","Systems & Languages":"#EC4899"};
const bgs: Record<string,string> = {"AI & Machine Learning":"#E0F2FE","NLP & Conversational AI":"#EDE9FE","Full Stack Web":"#D1FAE5","Android Development":"#FEF3C7","Data Engineering":"#CFFAFE","Cloud & DevOps":"#FEE2E2","Data Science":"#EDE9FE","Systems & Languages":"#FCE7F3"};
export default function SkillsPage() {
  const [active,setActive] = useState<string|null>(null);
  return (<>
    <Navbar/><TechDecorations pageName="Skills"/>
    <main className="pt-24 pb-24 min-h-screen bg-hero grid-bg">
      <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
        <div className="text-center mb-16 pt-10">
          <span className="inline-block bg-sky-100 text-sky-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">EXPERTISE</span>
          <h1 className="section-title mb-4">Skills & <span className="text-gradient">Competencies</span></h1>
          <p className="text-sky-900/60 text-lg max-w-xl mx-auto">Full-spectrum technical expertise — 4+ years of hands-on production experience.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button onClick={()=>setActive(null)} className={`px-5 py-2 rounded-full text-sm font-heading font-semibold transition-all ${!active?"btn-primary py-2 px-5":"btn-outline py-2 px-5"}`}>All</button>
          {Object.keys(skills).map(c=>(
            <button key={c} onClick={()=>setActive(active===c?null:c)}
              className="px-5 py-2 rounded-full text-sm font-heading font-semibold transition-all hover:scale-105"
              style={{background:active===c?colors[c]:"white",color:active===c?"white":colors[c]||"#0284C7",border:`2px solid ${colors[c]||"#0EA5E9"}30`}}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(skills).filter(([c])=>!active||active===c).map(([cat,items])=>{
            const color=colors[cat]||"#0EA5E9";const bg=bgs[cat]||"#E0F2FE";
            return (
              <div key={cat} className="card p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-3 h-3 rounded-full" style={{background:color,boxShadow:`0 0 8px ${color}`}}/>
                  <h3 className="font-heading font-bold text-sky-950 text-lg">{cat}</h3>
                  <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full font-bold" style={{background:bg,color}}>{items.length} skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(skill=>(
                    <span key={skill} className="text-xs font-mono px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 cursor-default"
                      style={{background:bg,border:`1px solid ${color}30`,color}}>{skill}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-10 bg-white rounded-2xl px-12 py-6 shadow-card border border-sky-100">
            {[{v:Object.values(skills).flat().length,l:"Total Skills"},{v:Object.keys(skills).length,l:"Categories"},{v:"4+",l:"Years Exp"}].map(s=>(
              <div key={s.l} className="text-center">
                <div className="font-display font-black text-3xl text-gradient">{s.v}</div>
                <div className="text-sky-900/50 text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
    <Footer/>
  </>);
}
