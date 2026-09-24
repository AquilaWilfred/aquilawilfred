"use client";
import { useEffect, useState } from "react";

const techImages = [
  { name: "Python", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop", color: "#3776AB" },
  { name: "Kotlin", url: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=300&auto=format&fit=crop", color: "#7F52FF" },
  { name: "PostgreSQL", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop", color: "#336791" },
  { name: "React & TS", url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&auto=format&fit=crop", color: "#61DAFB" },
  { name: "Rust", url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&auto=format&fit=crop", color: "#FF6F00" },
];

// Repeat the list so one "half" of the track is wider than any normal screen.
// The track renders this half twice and slides left by exactly 50%, then loops
// with no visible jump.
const half = [...techImages, ...techImages, ...techImages, ...techImages];

interface Props {
  pageName?: string;
  /** Seconds for one full loop. Higher = slower. */
  speed?: number;
}

export default function TechDecorations({ speed = 40 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay so page content loads first, THEN the strip appears
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const renderHalf = (copy: number) =>
    half.map((tech, i) => (
      <div
        key={`${copy}-${i}-${tech.name}`}
        className="tech-strip-item shrink-0"
        aria-hidden={copy === 1 ? true : undefined}
      >
        <div
          className="relative h-[90px] w-[90px] overflow-hidden rounded-2xl border-2 transition-transform duration-300 hover:scale-110"
          style={{
            backgroundColor: tech.color,
            borderColor: tech.color + "40",
            boxShadow: `0 8px 32px ${tech.color}30, 0 0 0 1px ${tech.color}20`,
          }}
        >
          <img
            src={tech.url}
            alt={tech.name}
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover"
            onError={(e) => {
              // If an image fails, fall back to the solid brand colour + label
              e.currentTarget.style.display = "none";
            }}
          />
          <div
            className="absolute inset-0 flex items-end"
            style={{
              background: `linear-gradient(to top, ${tech.color}DD, ${tech.color}44, transparent)`,
            }}
          >
            <span className="px-2 pb-1 font-mono text-[9px] font-bold leading-tight text-white">
              {tech.name}
            </span>
          </div>
        </div>
      </div>
    ));

  return (
    <>
      <style>{`
        @keyframes tech-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .tech-strip-track {
          display: flex;
          width: max-content;
          animation: tech-marquee var(--tech-speed, 40s) linear infinite;
        }
        .tech-strip-item { margin-right: 16px; } /* margin, not gap, so -50% loops exactly */
        .tech-strip:hover .tech-strip-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .tech-strip-track { animation: none; }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="tech-strip pointer-events-auto py-3"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div
            className="tech-strip-track"
            style={{ ["--tech-speed" as string]: `${speed}s` }}
          >
            {renderHalf(0)}
            {renderHalf(1)}
          </div>
        </div>
      </div>
    </>
  );
}