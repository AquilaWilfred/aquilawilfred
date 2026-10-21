// app/admin/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Section } from "@/types/admin";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import {
  Login,
  Sidebar,
  Dashboard,
  CvBuilder,
  ProjectsEditor,
  BlogEditor,
  GalleryEditor,
  VideosEditor,
  ServicesEditor,
  ExperienceEditor,
  SocialsEditor,
  SettingsEditor,
} from "./_components";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>("dashboard");
  const { data, extras, loading, refresh } = usePortfolioData();

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((r) => {
        if (r.ok) setAuthed(true);
      })
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  if (checking)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#050F1E" }}
      >
        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#070F1F" }}
      >
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm font-mono">Loading...</p>
        </div>
      </div>
    );

  const render = () => {
    switch (section) {
      case "dashboard":
        return <Dashboard data={data} extras={extras} />;
      case "cv":
        return <CvBuilder />;
      case "projects":
        return <ProjectsEditor data={data} onRefresh={refresh} />;
      case "blog":
        return <BlogEditor data={data} onRefresh={refresh} />;
      case "gallery":
        return <GalleryEditor data={data} onRefresh={refresh} />;
      case "videos":
        return <VideosEditor data={data} onRefresh={refresh} />;
      case "services":
        return <ServicesEditor extras={extras} onRefresh={refresh} />;
      case "experience":
        return <ExperienceEditor extras={extras} onRefresh={refresh} />;
      case "socials":
        return <SocialsEditor extras={extras} onRefresh={refresh} />;
      case "settings":
        return <SettingsEditor data={data} onRefresh={refresh} />;
      default:
        return <Dashboard data={data} extras={extras} />;
    }
  };

  return (
    <div
      data-admin="true"
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#070F1F", color: "white" }}
    >
      <Sidebar
        active={section}
        setActive={setSection}
        onLogout={logout}
        data={data}
        extras={extras}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div
          className="flex items-center justify-between px-8 py-4 border-b shrink-0"
          style={{
            background: "rgba(5,15,30,0.8)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div>
            <h2 className="text-white font-heading font-bold text-xl capitalize">
              {section}
            </h2>
            <p className="text-white/30 text-xs font-mono">
              Aquila Admin Portal v4
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Globe size={14} />
            View Site
          </a>
        </div>
        <main className="flex-1 overflow-y-auto">{render()}</main>
      </div>
    </div>
  );
}