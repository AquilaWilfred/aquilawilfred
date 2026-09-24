"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Globe } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechDecorations from "@/components/ui/TechLoader";
import { portfolioData } from "@/data/portfolio";

const { owner } = portfolioData;

const CURRENCIES = [
  { code: "KSH", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

const PROCESS = [
  { step: "01", title: "Discovery Call", desc: "We discuss your goals, requirements, timeline and budget to ensure alignment." },
  { step: "02", title: "Research & Planning", desc: "I research the best approach and deliver a detailed project plan." },
  { step: "03", title: "Agile Development", desc: "Iterative development with regular updates, demos, and feedback loops." },
  { step: "04", title: "Testing & QA", desc: "Rigorous testing, performance optimisation and security audits." },
  { step: "05", title: "Deployment", desc: "Production deployment with monitoring, CI/CD, and documentation." },
  { step: "06", title: "Support & Handover", desc: "Comprehensive handover, documentation, and ongoing support options." },
];

const WHY = [
  { icon: "🎯", title: "Full Ownership", desc: "Complete responsibility from strategy through deployment." },
  { icon: "🔬", title: "Research-First", desc: "Grounded in the right algorithm and proven engineering patterns." },
  { icon: "💬", title: "Clear Communication", desc: "Complex concepts translated into measurable business outcomes." },
  { icon: "🏗️", title: "Clean Architecture", desc: "Well-documented, maintainable code your team can extend." },
  { icon: "🚀", title: "Continuous Learning", desc: "Forefront of AI/ML research and best practices." },
  { icon: "🌍", title: "Global Mindset", desc: "Nairobi-based, world-ready. Flexible scheduling for any timezone." },
];

export default function ServicesPage() {
  // Hardcoded services always visible as base
  const [services, setServices] = useState<any[]>(
    portfolioData.services.map((s: any, i: number) => ({
      ...s, id: String(i + 1), visible: true, prices: { KSH: 0, USD: 0, EUR: 0, CNY: 0, GBP: 0 },
      description: s.desc || "",
    }))
  );
  const [rates, setRates] = useState<any>({ USD: { buying: 129, selling: 131 }, EUR: { buying: 140, selling: 142 }, CNY: { buying: 18, selling: 19 }, GBP: { buying: 163, selling: 165 } });
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false); // never truly empty now
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then(r => r.json()),
      fetch("/api/currency").then(r => r.json()),
    ]).then(([svc, cur]) => {
      if (svc.data?.length) {
        const dbServices = svc.data.filter((s: any) => s.visible !== false);
        // Accumulate: hardcoded services not in DB stay visible
        const dbTitles = new Set(dbServices.map((s: any) => s.title?.toLowerCase().trim()));
        const hardcodedNotInDB = portfolioData.services
          .filter((s: any) => !dbTitles.has(s.title?.toLowerCase().trim()))
          .map((s: any, i: number) => ({
            ...s, id: `hc-${i}`, visible: true,
            prices: { KSH: 0, USD: 0, EUR: 0, CNY: 0, GBP: 0 },
            description: s.desc || "",
          }));
        setServices([...dbServices, ...hardcodedNotInDB]);
      }
      // If DB empty → hardcoded initial state stays
      if (cur.data) setRates(cur.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatPrice = (svc: any) => {
    const cur = CURRENCIES.find(c => c.code === currency)!;
    const price = svc.prices?.[currency];
    if (!price || price === 0) {
      // Fall back to static price string from portfolio data
      const staticSvc = portfolioData.services.find((s: any) => s.title === svc.title);
      return staticSvc?.price || staticSvc?.desc?.match(/From .*/)?.[0] || "Contact for pricing";
    }
    const formatted = price.toLocaleString();
    if (currency === "KSH") return `KSh ${formatted}`;
    const kshEquiv = Math.round(price * (rates[currency]?.selling || 1));
    return `${cur.symbol}${formatted} ≈ KSh ${kshEquiv.toLocaleString()}`;
  };

  return (
    <>
      <Navbar />
      <TechDecorations pageName="Services" />
      <main className="pt-24 pb-24 min-h-screen">

        {/* Hero */}
        <section className="bg-hero grid-bg py-20">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 text-center pt-10">
            <span className="inline-block bg-sky-100 text-sky-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">WHAT I OFFER</span>
            <h1 className="section-title mb-4">Professional <span className="text-gradient">Services</span></h1>
            <p className="text-sky-900/60 text-lg max-w-xl mx-auto">End-to-end technology solutions delivered with full ownership and scientific rigor.</p>
          </div>
        </section>

        {/* Services with currency toggle */}
        <section className="py-20 bg-section-alt">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">

            {/* Currency selector */}
            <div className="flex items-center justify-end gap-3 mb-10">
              <Globe size={16} className="text-sky-600" />
              <span className="text-sky-900/60 text-sm font-mono">Show prices in:</span>
              <div className="flex gap-2 flex-wrap">
                {CURRENCIES.map(c => (
                  <button key={c.code} onClick={() => setCurrency(c.code)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
                    style={{
                      background: currency === c.code ? "linear-gradient(135deg,#0EA5E9,#7C3AED)" : "rgba(14,165,233,0.08)",
                      color: currency === c.code ? "white" : "#0369A1",
                      border: `1px solid ${currency === c.code ? "transparent" : "rgba(14,165,233,0.2)"}`,
                    }}>
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="card p-7 animate-pulse">
                    <div className="w-10 h-10 bg-sky-100 rounded-xl mb-4" />
                    <div className="h-4 bg-sky-100 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-sky-50 rounded mb-1 w-full" />
                    <div className="h-3 bg-sky-50 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {services.map(svc => (
                  <div key={svc.id} className="card p-7 group cursor-default flex flex-col">
                    <div className="text-4xl mb-4">{svc.icon}</div>
                    <h3 className="font-heading font-bold text-sky-950 text-lg mb-2">{svc.title}</h3>
                    <p className="text-sky-900/60 text-sm leading-relaxed mb-4 flex-1">{svc.description || svc.desc}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-emerald-600 text-sm font-mono font-bold">{formatPrice(svc)}</span>
                      <Link href="/contact" className="text-sky-500 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Enquire <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Expandable article */}
                    {svc.feasibility && (
                      <div>
                        <button
                          onClick={() => setExpanded(expanded === svc.id ? null : svc.id)}
                          className="flex items-center gap-1 text-xs text-sky-500 font-mono hover:text-sky-600 transition-colors"
                        >
                          {expanded === svc.id ? "Hide details" : "Read more"}
                          <ChevronDown size={12} style={{ transform: expanded === svc.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                        </button>
                        {expanded === svc.id && (
                          <div
                            className="mt-3 pt-3 border-t border-sky-100 text-sky-900/70 text-sm leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: svc.feasibility }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* KSH equivalence note */}
            {currency !== "KSH" && (
              <p className="text-center text-sky-900/40 text-xs font-mono mt-6">
                * KSh equivalences calculated at current selling rate: 1 {currency} = KSh {rates[currency]?.selling?.toLocaleString() || "—"}
              </p>
            )}
          </div>
        </section>

        {/* Why work with me */}
        <section className="py-20 bg-gradient-to-br from-sky-900 via-sky-950 to-violet-950">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-white text-3xl mb-2">Why Work With Aquila?</h2>
              <p className="text-white/60">The complete package — technical depth meets business focus</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHY.map(v => (
                <div key={v.title} className="flex gap-4 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span className="text-2xl">{v.icon}</span>
                  <div><h4 className="font-heading font-semibold text-white mb-1">{v.title}</h4><p className="text-white/60 text-sm">{v.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 bg-section-alt">
          <div className="max-w-screen-2xl mx-auto px-8 lg:px-16">
            <div className="text-center mb-12">
              <span className="inline-block bg-violet-100 text-violet-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">HOW I WORK</span>
              <h2 className="section-title">My <span className="text-gradient">Process</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROCESS.map(p => (
                <div key={p.step} className="card p-7">
                  <div className="font-display text-5xl font-black text-gradient opacity-30 mb-3">{p.step}</div>
                  <h3 className="font-heading font-bold text-sky-950 mb-2">{p.title}</h3>
                  <p className="text-sky-900/60 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-hero">
          <div className="max-w-3xl mx-auto px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="pulse-dot" />
              <span className="text-emerald-600 text-sm font-mono font-semibold">{owner.availability}</span>
            </div>
            <h2 className="section-title mb-5">Ready to Start Your Project?</h2>
            <p className="text-sky-900/60 mb-8 text-lg">Let&apos;s discuss how I can help transform your ideas into production-grade solutions.</p>
            <Link href="/contact" className="btn-primary text-lg py-4 px-8">Get a Free Consultation <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
