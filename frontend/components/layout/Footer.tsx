"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Zap } from "lucide-react";
import { portfolioData, profileImages } from "@/data/portfolio";
import { useSocials } from "@/hooks/useSocials";
import SocialIcon from "@/components/ui/SocialIcon";

const { owner } = portfolioData;

// Hardcoded services — always shown as emergency fallback
const HARDCODED_SERVICES = portfolioData.services.map(s => s.title);

export default function Footer() {
  const liveSocials = useSocials(); // starts with hardcoded, upgrades to DB
  const [ownerData, setOwnerData] = useState<any>(owner);
  const [services, setServices] = useState<string[]>(HARDCODED_SERVICES);

  useEffect(() => {
    // Load owner settings — merge on top of hardcoded
    fetch("/api/settings").then(r => r.json()).then(({ data }) => {
      if (data) setOwnerData((prev: any) => ({ ...prev, ...data }));
    }).catch(() => {});

    // Load services — merge with hardcoded fallback
    fetch("/api/services").then(r => r.json()).then(({ data }) => {
      if (data?.length) {
        const visible = data.filter((s: any) => s.visible !== false).map((s: any) => s.title);
        if (visible.length > 0) setServices(visible);
        // If DB returns nothing visible → hardcoded stays
      }
    }).catch(() => {});
  }, []);

  const phone = Array.isArray(ownerData.phone) ? ownerData.phone : (ownerData.phone ? [ownerData.phone] : owner.phone);
  const avatar = ownerData.heroImage || ownerData.footerImage || profileImages.footer;

  return (
    <footer className="bg-sky-950 text-white relative overflow-hidden">
      <div className="loading-bar absolute top-0 left-0 right-0" />
      <div className="blob w-96 h-96 bottom-[-100px] left-[-100px] opacity-10" style={{ background: "#38BDF8" }} />
      <div className="blob w-72 h-72 top-[-50px] right-[-50px] opacity-10" style={{ background: "#A78BFA", animationDelay: "3s" }} />

      {/* Owner identity strip */}
      <div className="relative z-10 border-b border-sky-800/50">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img src={ownerData.companyLogo} alt={ownerData.name}
              className="w-30 h-20 bg-white rounded-xl object-cover object-top shrink-0" />
            <div className="text-center sm:text-left">
              <p className="font-heading font-bold text-white text-2xl">{ownerData.name}</p>
              <p className="text-sky-300 text-sm">{ownerData.company} · Founder & Lead Engineer</p>
              <p className="text-sky-400/60 text-xs font-mono mt-1">{ownerData.title}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <div className="pulse-dot" />
                <span className="text-emerald-300 text-xs font-mono">{ownerData.availability}</span>
              </div>
            </div>
            {/* Social icons */}
            <div className="sm:ml-auto flex gap-3 flex-wrap justify-center">
              {liveSocials.slice(0, 6).map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" title={s.platform}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-colors text-white/70 hover:text-white">
                  <SocialIcon id={s.id} size={18} />
                </a>
              ))}
              <a href={`mailto:${ownerData.email}`}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-colors text-white/70 hover:text-white">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center">
                <Zap size={17} className="text-white" />
              </div>
              <span className="font-display font-black text-xl text-gradient">Aquila</span>
            </div>
            <p className="text-sky-300/70 text-sm leading-relaxed mb-3">{ownerData.tagline} — {ownerData.company}</p>
            <p className="text-sky-400/50 text-xs leading-relaxed">{ownerData.bio?.slice(0, 120)}...</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-white">Navigation</h4>
            <div className="space-y-2">
              {["/", "/about", "/projects", "/skills", "/services", "/blog", "/gallery", "/videos", "/contact"].map(href => (
                <Link key={href} href={href} className="block text-sky-300/60 hover:text-sky-200 text-sm transition-colors capitalize">
                  {href === "/" ? "Home" : href.slice(1)}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-white">Services</h4>
            <div className="space-y-2">
              {services.slice(0, 8).map(title => (
                <Link key={title} href="/services"
                  className="block text-sky-300/60 hover:text-sky-200 text-sm transition-colors">
                  {title}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact + Connect */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-white">Contact</h4>
            <div className="space-y-3 mb-6">
              <a href={`mailto:${ownerData.email}`}
                className="flex items-center gap-2 text-sky-300/60 hover:text-white text-sm transition-colors">
                <Mail size={14} className="text-sky-400 shrink-0" />{ownerData.email}
              </a>
              {phone.map((p: string) => (
                <a key={p} href={`tel:${p}`}
                  className="flex items-center gap-2 text-sky-300/60 hover:text-white text-sm transition-colors">
                  <Phone size={14} className="text-sky-400 shrink-0" />{p}
                </a>
              ))}
              <div className="flex items-center gap-2 text-sky-300/60 text-sm">
                <MapPin size={14} className="text-emerald-400 shrink-0" />{ownerData.location}
              </div>
            </div>
            <h4 className="font-heading font-bold mb-3 text-white text-sm">Connect</h4>
            <div className="space-y-2">
              {liveSocials.slice(0, 5).map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-300/60 hover:text-white text-sm transition-colors">
                  <span className="text-sky-400"><SocialIcon id={s.id} size={14} /></span>
                  {s.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-sky-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sky-400/50 text-sm">© {new Date().getFullYear()} Aquila · {ownerData.name} · {ownerData.company}</p>
          <p className="text-sky-400/30 text-xs font-mono">Built with Next.js · TypeScript · Tailwind CSS · Supabase</p>
        </div>
      </div>
    </footer>
  );
}
