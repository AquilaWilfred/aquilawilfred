"use client";
import { useState } from "react";
import { User } from "lucide-react";

interface Props {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showName?: boolean;
  showTitle?: boolean;
  name?: string;
  title?: string;
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm:   { ring: 44,  inner: 40,  icon: 18, font: "text-xs" },
  md:   { ring: 60,  inner: 56,  icon: 24, font: "text-sm" },
  lg:   { ring: 88,  inner: 80,  icon: 32, font: "text-base" },
  xl:   { ring: 120, inner: 112, icon: 44, font: "text-lg" },
  hero: { ring: 200, inner: 184, icon: 72, font: "text-2xl" },
};

export default function OwnerAvatar({ size="md", showName=false, showTitle=false, name="Amon Aquila Wilfred", title="AI/ML · Full Stack Engineer", className="", animated=true }: Props) {
  const [imgSrc, setImgSrc] = useState<string|null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("eaglewills_owner_photo") || null;
    }
    return null;
  });
  const s = sizeMap[size];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Avatar ring */}
      <div
        className={`relative ${animated ? "group" : ""}`}
        style={{ width: s.ring, height: s.ring }}
      >
        {/* Animated gradient ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #0EA5E9, #7C3AED, #059669, #0EA5E9)",
            backgroundSize: "300% 300%",
            animation: animated ? "gradientSpin 4s linear infinite" : "none",
            padding: "2px",
          }}
        >
          <div className="w-full h-full rounded-full bg-white" />
        </div>

        {/* Glow pulse */}
        {animated && (
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: "0 0 30px rgba(14,165,233,0.5), 0 0 60px rgba(124,58,237,0.3)" }}
          />
        )}

        {/* Photo or placeholder */}
        <div
          className="absolute rounded-full overflow-hidden flex items-center justify-center"
          style={{
            inset: (s.ring - s.inner) / 2,
            background: imgSrc ? "transparent" : "linear-gradient(135deg, #E0F2FE, #EDE9FE)",
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={name}
              className="w-full h-full object-cover object-top"
              style={{ transform: animated ? "scale(1)" : "none", transition: "transform 0.5s" }}
              onMouseEnter={e => animated && ((e.target as HTMLElement).style.transform = "scale(1.08)")}
              onMouseLeave={e => animated && ((e.target as HTMLElement).style.transform = "scale(1)")}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <User size={s.icon} className="text-sky-300 mb-1" />
              {size === "hero" && (
                <span className="text-sky-400 text-xs font-mono text-center px-4 leading-tight">
                  Add photo via<br/>Admin Portal
                </span>
              )}
            </div>
          )}
        </div>

        {/* Online indicator */}
        {size !== "sm" && (
          <div
            className="absolute bottom-1 right-1 rounded-full border-2 border-white"
            style={{ width: Math.max(10, s.ring * 0.12), height: Math.max(10, s.ring * 0.12), background: "#059669", boxShadow: "0 0 8px rgba(5,150,105,0.6)" }}
          />
        )}
      </div>

      {showName && (
        <div className="text-center">
          <p className={`font-heading font-bold text-sky-950 ${s.font}`}>{name.split(" ")[0]} <span className="text-gradient">{name.split(" ").slice(1).join(" ")}</span></p>
          {showTitle && <p className="text-sky-900/50 text-xs font-mono mt-0.5">{title}</p>}
        </div>
      )}

      <style>{`
        @keyframes gradientSpin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
