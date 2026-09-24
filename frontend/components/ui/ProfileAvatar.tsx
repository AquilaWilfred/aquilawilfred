"use client";
import { useState } from "react";
import { profileImages } from "@/data/portfolio";

interface Props {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  variant?: "circle" | "rounded" | "badge";
  animated?: boolean;
  showRing?: boolean;
  className?: string;
  src?: string;
  fullBody?: boolean; // show full body without cropping
}

const sizeMap = {
  sm:   { outer: 44,  inner: 40,  ring: 3,  badge: 12 },
  md:   { outer: 72,  inner: 66,  ring: 3,  badge: 18 },
  lg:   { outer: 100, inner: 92,  ring: 4,  badge: 22 },
  xl:   { outer: 140, inner: 130, ring: 5,  badge: 28 },
  hero: { outer: 340, inner: 320, ring: 6,  badge: 36 },
};

export default function ProfileAvatar({ size = "md", variant = "circle", animated = true, showRing = true, className = "", src, fullBody = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const dim = sizeMap[size];
  const imgSrc = src || (fullBody ? profileImages.hero : profileImages.avatar);
  const radius = variant === "circle" ? "50%" : variant === "rounded" ? "20%" : "50%";

  // Full body mode — taller container, image covers full height
  const imgStyle: React.CSSProperties = fullBody
    ? { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }
    : { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" };

  // For hero full body, make height taller than width
  const heroHeight = fullBody && size === "hero" ? dim.inner * 1.4 : dim.inner;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: dim.outer,
        height: fullBody && size === "hero" ? dim.outer * 1.4 : dim.outer,
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transform: animated && hovered ? "scale(1.04)" : "scale(1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated gradient ring */}
      {showRing && (
        <div className="absolute inset-0" style={{ borderRadius: radius, background: "linear-gradient(135deg,#0EA5E9,#7C3AED,#059669,#0EA5E9)", backgroundSize: "300% 300%", animation: "gradientShift 4s ease infinite", padding: dim.ring }}>
          <style>{`@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
          <div style={{ width: "100%", height: "100%", borderRadius: `calc(${radius} - 2px)`, background: "white" }} />
        </div>
      )}

      {/* Glow */}
      {animated && hovered && (
        <div className="absolute inset-0 blur-2xl opacity-40" style={{ borderRadius: radius, background: "linear-gradient(135deg,#0EA5E9,#7C3AED)", zIndex: -1 }} />
      )}

      {/* Image */}
      <div style={{
        width: dim.inner,
        height: heroHeight,
        borderRadius: `calc(${radius} - 2px)`,
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        boxShadow: hovered ? "0 20px 60px rgba(14,165,233,0.4)" : "0 8px 30px rgba(12,74,110,0.2)",
        transition: "box-shadow 0.3s ease",
      }}>
        <img src={imgSrc} alt="Amon Aquila Wilfred" style={imgStyle} />
        {animated && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.15) 60%,transparent 80%)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
        )}
      </div>

      {/* Online badge */}
      {size !== "sm" && (
        <div style={{ position: "absolute", bottom: dim.ring + 4, right: dim.ring + 4, width: dim.badge, height: dim.badge, borderRadius: "50%", background: "#059669", border: "3px solid white", boxShadow: "0 2px 8px rgba(5,150,105,0.5)", zIndex: 2 }} />
      )}
    </div>
  );
}

export function ProfileChip({ label, size = 36 }: { label?: string; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "2px solid #0EA5E9", verticalAlign: "middle", flexShrink: 0, boxShadow: "0 2px 12px rgba(14,165,233,0.3)" }}>
        <img src={profileImages.avatar} alt="Amon Aquila Wilfred" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
      </span>
      {label && <span className="font-medium text-sky-700">{label}</span>}
    </span>
  );
}
