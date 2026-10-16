// app/admin/_components/Dashboard.tsx

"use client";

import {
  FolderKanban,
  FileText,
  ImageIcon,
  Video,
  Briefcase as BriefcaseIcon,
  Users,
  TrendingUp,
} from "lucide-react";
import { box } from "@/lib/admin-styles";
import { Extras } from "@/types/admin";

interface DashboardProps {
  data: any;
  extras: Extras;
}

export default function Dashboard({ data, extras }: DashboardProps) {
  const stats = [
    { label: "Projects", value: data.projects.length, color: "#38BDF8", icon: <FolderKanban size={22} /> },
    {
      label: "Blog Posts",
      value: data.blog.filter((b: any) => b.published).length,
      color: "#A78BFA",
      icon: <FileText size={22} />,
    },
    { label: "Gallery", value: data.gallery.length, color: "#6EE7B7", icon: <ImageIcon size={22} /> },
    { label: "Videos", value: data.videos.length, color: "#FBBF24", icon: <Video size={22} /> },
    {
      label: "Services",
      value: extras.services.filter((s: any) => s.visible !== false).length,
      color: "#FB7185",
      icon: <BriefcaseIcon size={22} />,
    },
    { label: "Experience", value: extras.experience.length, color: "#34D399", icon: <Users size={22} /> },
  ];

  const statuses: [string, string, string][] = [
    ["Contact Form → Gmail", "Live ✓", "#6EE7B7"],
    ["Image Upload → Cloudinary CDN", "Live ✓", "#6EE7B7"],
    ["Database → Supabase", "Live ✓", "#6EE7B7"],
    ["Admin Auth → Secure Cookie", "Live ✓", "#6EE7B7"],
    ["Favicon → aquiladp.svg", "Set ✓", "#6EE7B7"],
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-6" style={box}>
            <div className="flex items-center justify-between mb-3">
              <div
                className="p-2 rounded-xl"
                style={{ background: `${s.color}18`, color: s.color }}
              >
                {s.icon}
              </div>
              <TrendingUp size={14} className="text-emerald-400 opacity-50" />
            </div>
            <div className="font-display font-black text-4xl mb-1" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-white/50 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-7" style={box}>
        <h3 className="text-white font-heading font-bold text-lg mb-4">
          System Status
        </h3>
        {statuses.map(([label, status, color]) => (
          <div
            key={label}
            className="flex items-center justify-between p-3 rounded-xl mb-2"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-white/60 text-sm">{label}</span>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: `${color}18`, color }}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}