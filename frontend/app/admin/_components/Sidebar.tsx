// app/admin/_components/Sidebar.tsx

"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  ImageIcon,
  Video,
  Settings,
  LogOut,
  Briefcase as BriefcaseIcon,
  Users,
  Link2,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Globe,
} from "lucide-react";
import { Section, Extras } from "@/types/admin";
import { profileImages, portfolioData } from "@/data/portfolio";

const { owner } = portfolioData;
const STORAGE_KEY = "admin-sidebar-collapsed";

interface SidebarProps {
  active: Section;
  setActive: (s: Section) => void;
  onLogout: () => void;
  data: any;
  extras: Extras;
}

export default function Sidebar({
  active,
  setActive,
  onLogout,
  data,
  extras,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Restore saved state after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const links: {
    s: Section;
    icon: React.ReactNode;
    label: string;
    badge: number | null;
  }[] = [
    { s: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard", badge: null },
    { s: "projects", icon: <FolderKanban size={18} />, label: "Projects", badge: data.projects.length },
    {
      s: "blog",
      icon: <BookOpen size={18} />,
      label: "Blog Posts",
      badge: data.blog.filter((b: any) => b.published).length,
    },
    { s: "gallery", icon: <ImageIcon size={18} />, label: "Gallery", badge: data.gallery.length },
    { s: "videos", icon: <Video size={18} />, label: "Videos", badge: data.videos.length },
    { s: "services", icon: <BriefcaseIcon size={18} />, label: "Services", badge: null },
    { s: "experience", icon: <Users size={18} />, label: "Experience", badge: extras.experience.length },
    {
      s: "socials",
      icon: <Link2 size={18} />,
      label: "Social Links",
      badge: extras.socials.filter((s: any) => s.visible).length,
    },
    { s: "settings", icon: <Settings size={18} />, label: "Settings", badge: null },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-[76px]" : "w-64"
      } flex flex-col h-screen sticky top-0 shrink-0 transition-[width] duration-200 ease-in-out`}
      style={{
        background: "rgba(5,15,30,0.98)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo — same company logo + brand text as the Navbar */}
      <div
        className={`border-b relative ${collapsed ? "p-3" : "p-5"}`}
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
            <img
              src={(owner as any).companyLogo || "/icon.png"}
              alt={owner.company}
              className="w-full h-full object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.src.endsWith("/icon.png")) img.src = "/icon.png";
              }}
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display font-black text-sm text-white truncate">
                Aquila, B.Sc.(CS)
              </div>
              <div className="text-sky-400/60 text-xs font-mono truncate">
                {owner.company}
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
          style={{
            background: "rgba(5,15,30,1)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {links.map((l) => (
          <button
            key={l.s}
            onClick={() => setActive(l.s)}
            title={collapsed ? l.label : undefined}
            className={`w-full flex items-center rounded-xl text-sm font-medium transition-all group relative ${
              collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
            }`}
            style={{
              background:
                active === l.s
                  ? "linear-gradient(135deg,rgba(14,165,233,0.2),rgba(124,58,237,0.15))"
                  : "transparent",
              color: active === l.s ? "#38BDF8" : "rgba(255,255,255,0.45)",
              border:
                active === l.s
                  ? "1px solid rgba(14,165,233,0.25)"
                  : "1px solid transparent",
            }}
          >
            <span
              className={`relative ${
                active === l.s
                  ? "text-sky-400"
                  : "text-white/30 group-hover:text-white/60 transition-colors"
              }`}
            >
              {l.icon}
              {/* Dot indicator when collapsed and the section has items */}
              {collapsed && l.badge !== null && l.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-sky-400" />
              )}
            </span>

            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{l.label}</span>
                {l.badge !== null && (
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(14,165,233,0.15)", color: "#38BDF8" }}
                  >
                    {l.badge}
                  </span>
                )}
                {active === l.s && (
                  <ChevronRight size={14} className="text-sky-400 shrink-0" />
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="p-3 border-t space-y-0.5"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {/* Avatar pill — same avatar/name/status as the Navbar */}
        <div
          className={`flex items-center rounded-xl mb-1 ${
            collapsed ? "justify-center py-2" : "gap-3 px-3 py-2.5"
          }`}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          title={collapsed ? owner.name : undefined}
        >
          <div className="relative shrink-0">
            <img
              src={profileImages.avatar}
              alt={owner.name}
              className="w-8 h-8 rounded-full object-cover object-top border border-sky-400/40"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500"
              style={{ border: "2px solid rgb(5,15,30)" }}
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate leading-tight">
                {owner.name}
              </p>
              <span className="text-emerald-400 text-xs">Available</span>
            </div>
          )}
        </div>

        <a
          href="/"
          target="_blank"
          title={collapsed ? "View Live Site" : undefined}
          className={`flex items-center rounded-xl text-white/40 hover:text-white text-sm transition-colors ${
            collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
          }`}
        >
          <Globe size={16} />
          {!collapsed && (
            <>
              View Live Site
              <ChevronRight size={12} className="ml-auto" />
            </>
          )}
        </a>
        <button
          onClick={onLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center rounded-xl text-red-400/70 hover:text-red-400 text-sm transition-colors ${
            collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
          }`}
        >
          <LogOut size={16} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}