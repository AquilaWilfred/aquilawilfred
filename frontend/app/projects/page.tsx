"use client";
import { useState, useEffect } from "react";
import { ExternalLink, Code2, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { portfolioData } from "@/data/portfolio";

type Project = typeof portfolioData.projects[0];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(portfolioData.projects);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch from the advanced API
  useEffect(() => {
    const params = new URLSearchParams();
    if (cat !== "All") params.set("category", cat);
    if (search) params.set("search", search);
    params.set("sort", "updated");
    params.set("limit", "50");

    setLoading(true);

    fetch(`/api/projects/github_projects?${params.toString()}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.length) {
          setProjects(data);
        }
        // if empty → keep hardcoded
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cat, search]);

  const cats = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-hero grid-bg">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-16 pb-24">
          {/* Header */}
          <div className="text-center mb-12 pt-10">
            <span className="inline-block bg-violet-100 text-violet-700 text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest">
              PORTFOLIO
            </span>
            <h1 className="section-title mb-4">
              My <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-sky-900/60 text-lg max-w-xl mx-auto">
              Production-ready solutions across AI/ML, full stack, mobile & data engineering.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={16} />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sky-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all ${
                    cat === c ? "btn-primary py-2 px-4" : "btn-outline py-2 px-4"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card h-80 animate-pulse bg-sky-50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="card overflow-hidden group cursor-pointer"
                  onClick={() => setSel(p)}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 to-transparent" />
                    {p.featured && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
                        ★
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 text-sky-700 text-xs font-mono font-bold px-3 py-1 rounded-full">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-7">
                    <h3 className="font-heading font-bold text-sky-950 text-lg mb-2 leading-tight">
                      {p.title}
                    </h3>
                    <p className="text-sky-900/60 text-sm mb-4 line-clamp-2">
                      {p.description}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {Object.entries(p.stats)
                        .filter(([k]) => k !== "updated")
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="text-center bg-sky-50 rounded-xl p-2 border border-sky-100"
                          >
                            <div className="text-sky-600 text-xs font-bold font-mono">{v}</div>
                            <div className="text-sky-900/40 text-xs capitalize">{k}</div>
                          </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.tech.slice(0, 3).map((t) => (
                        <span key={t} className="skill-tag">
                          {t}
                        </span>
                      ))}
                      {p.tech.length > 3 && (
                        <span className="skill-tag">+{p.tech.length - 3}</span>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={p.github}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-sky-600 hover:text-sky-800 text-sm font-medium"
                      >
                        <Code2 size={14} /> Code
                      </a>
                      <a
                        href={p.live}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                      >
                        <ExternalLink size={14} /> Live
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal (same as before) */}
      {sel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/80 backdrop-blur-sm"
          onClick={() => setSel(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 overflow-hidden rounded-t-3xl">
              <img src={sel.image} alt={sel.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/60 to-transparent" />
              <button
                onClick={() => setSel(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/40"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-heading font-bold text-sky-950 text-2xl">{sel.title}</h2>
                <span className="bg-sky-100 text-sky-700 text-xs font-mono px-3 py-1 rounded-full ml-4 shrink-0">
                  {sel.category}
                </span>
              </div>
              <p className="text-sky-900/70 leading-relaxed mb-6">{sel.longDesc}</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {Object.entries(sel.stats)
                  .filter(([k]) => k !== "updated")
                  .map(([k, v]) => (
                    <div key={k} className="text-center bg-sky-50 rounded-xl p-3 border border-sky-100">
                      <div className="text-sky-600 font-bold font-mono text-sm">{v}</div>
                      <div className="text-sky-900/40 text-xs capitalize mt-1">{k}</div>
                    </div>
                  ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {sel.tech.map((t) => (
                  <span key={t} className="skill-tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                <a href={sel.github} className="btn-outline">
                  <Code2 size={14} /> View Code
                </a>
                <a href={sel.live} className="btn-primary">
                  <ExternalLink size={14} /> Live Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}