"use client";
import { useState, useEffect } from "react";
import { portfolioData } from "@/data/portfolio";

export interface SocialLink {
  id: string;
  platform: string;
  icon: string;
  url: string;
  visible: boolean;
}

// These ALWAYS show — they are permanent hardcoded signatures
// DB can add MORE or update URLs, but can NEVER remove these
const HARDCODED_SOCIALS: SocialLink[] = [
  { id: "github",    platform: "GitHub",    icon: "🐙", url: portfolioData.owner.socials.github,    visible: true },
  { id: "linkedin",  platform: "LinkedIn",  icon: "💼", url: portfolioData.owner.socials.linkedin,  visible: true },
  { id: "whatsapp",  platform: "WhatsApp",  icon: "💬", url: "https://wa.me/254112554165",          visible: true },
  { id: "upwork",    platform: "Upwork",    icon: "🟢", url: portfolioData.owner.socials.upwork,    visible: true },
  { id: "kaggle",    platform: "Kaggle",    icon: "🔬", url: portfolioData.owner.socials.kaggle,    visible: true },
  { id: "portfolio", platform: "Portfolio", icon: "🌐", url: portfolioData.owner.socials.portfolio, visible: true },
];

export function useSocials(): SocialLink[] {
  // Start with hardcoded — never blank on first render
  const [socials, setSocials] = useState<SocialLink[]>(HARDCODED_SOCIALS);

  useEffect(() => {
    fetch("/api/socials")
      .then(r => r.json())
      .then(({ data }) => {
        // MERGE strategy:
        // 1. Start with hardcoded as the base (always present)
        // 2. If DB has an entry for a hardcoded ID, update the URL only (never hide hardcoded)
        // 3. Add any EXTRA DB entries that are visible and have a URL
        
        if (!data?.length) return; // DB empty → hardcoded stays as-is

        // Build a map of DB entries by id
        const dbMap: Record<string, any> = {};
        data.forEach((s: any) => { dbMap[s.id] = s; });

        // Update hardcoded entries with DB URLs if available
        const merged = HARDCODED_SOCIALS.map(h => {
          const db = dbMap[h.id];
          if (db && db.url) {
            // DB has a URL for this — use it, but ALWAYS keep visible=true for hardcoded
            return { ...h, url: db.url, icon: db.icon || h.icon };
          }
          return h; // keep hardcoded as-is
        });

        // Add extra DB entries not in hardcoded, only if visible and have URL
        const hardcodedIds = new Set(HARDCODED_SOCIALS.map(h => h.id));
        const extras = data.filter((s: any) => !hardcodedIds.has(s.id) && s.visible && s.url);
        extras.forEach((s: any) => merged.push(s));

        setSocials(merged);
      })
      .catch(() => {}); // Network fail → hardcoded stays
  }, []);

  return socials;
}
