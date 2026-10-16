// hooks/usePortfolioData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { portfolioData } from "@/data/portfolio";
import { DEFAULT_RATES, ALL_SOCIALS, API_ROUTES } from "@/lib/admin-constants";
import { Extras } from "@/types/admin";

type PortfolioData = typeof portfolioData;

interface UsePortfolioDataReturn {
  data: PortfolioData;
  extras: Extras;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function usePortfolioData(): UsePortfolioDataReturn {
  const [data, setData] = useState<PortfolioData>({
    ...portfolioData,
    projects: [],
    blog: [],
    gallery: [],
    videos: [],
  });
  const [extras, setExtras] = useState<Extras>({
    experience: [],
    services: [],
    socials: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [
        githubRes,
        customRes,
        blog,
        gal,
        vid,
        settings,
        exp,
        svc,
        soc,
      ] = await Promise.all([
        fetch("/api/projects/github_projects?limit=100").then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
        fetch(API_ROUTES.projects).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
        fetch(API_ROUTES.blog).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
        fetch(API_ROUTES.gallery).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
        fetch(API_ROUTES.videos).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
        fetch(API_ROUTES.settings).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: null };
        }),
        fetch(API_ROUTES.experience).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
        fetch(API_ROUTES.services).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
        fetch(API_ROUTES.socials).then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : { data: [] };
        }),
      ]);

      // ========== Merge GitHub + Customizations ==========
      const githubProjects = githubRes.data || [];
      const customizations = customRes.data || [];

      const customMap = new Map<string, any>(
        customizations.map((c: any) => [String(c.githubId || c.id), c])
        );

        const mergedProjects = githubProjects.map((gh: any) => {
        const custom: any = customMap.get(String(gh.id));

        if (custom) {
          return {
            id: gh.id,
            title: custom.title || "", // Display title (shown in parentheses)
            githubTitle: gh.title, // Original GitHub title
            description: custom.description || gh.description,
            longDesc: custom.longDesc || custom.long_desc || gh.longDesc || gh.description,
            tech: gh.tech || [],
            stats: gh.stats || {},
            category: gh.category,
            image: custom.image || gh.image,
            featured: custom.featured ?? gh.featured,
            github: gh.github,
            live: custom.live || gh.live,
            isCustomized: true,
          };
        }

        return {
          id: gh.id,
          title: "", // no custom display title yet
          githubTitle: gh.title,
          description: gh.description,
          longDesc: gh.longDesc || gh.description,
          tech: gh.tech || [],
          stats: gh.stats || {},
          category: gh.category,
          image: gh.image,
          featured: gh.featured,
          github: gh.github,
          live: gh.live,
          isCustomized: false,
        };
      });

      setData((d) => ({
        ...d,
        projects:
          mergedProjects.length > 0
            ? mergedProjects
            : portfolioData.projects.map((p) => ({
                ...p,
                githubTitle: p.title,
                title: "",
              })),
        blog: (blog.data?.length ? blog.data : portfolioData.blog).map(
          (row: any) => ({
            id: row.id,
            title: row.title,
            excerpt: row.excerpt,
            content: row.content,
            tags: row.tags || [],
            date: row.date,
            readTime: row.read_time || row.readTime,
            image: row.image,
            published: row.published,
          })
        ),
        gallery: gal.data?.length ? gal.data : portfolioData.gallery,
        videos: vid.data?.length ? vid.data : portfolioData.videos,
        owner: settings.data ? { ...d.owner, ...settings.data } : d.owner,
      }));

      // ========== Services ==========
      const dbServices = svc.data?.length
        ? svc.data
        : portfolioData.services.map((s: any, i: number) => ({
            ...s,
            id: String(i + 1),
            visible: true,
            sort_order: i,
            prices: { KSH: 0, USD: 0, EUR: 0, CNY: 0, GBP: 0 },
            exchange_rates: DEFAULT_RATES,
            feasibility: "",
            description: s.desc || "",
          }));

      // ========== Experience ==========
      const dbExp = exp.data?.length
        ? exp.data
        : portfolioData.experience.map((e: any, i: number) => ({
            ...e,
            id: String(i + 1),
            visible: true,
            sort_order: i,
          }));

      // ========== Socials ==========
      const dbSoc = ALL_SOCIALS.map((s: any) => {
        const dbEntry = (soc.data || []).find((e: any) => e.id === s.id);
        const hardcodedUrl = (portfolioData.owner.socials as any)[s.id] || "";
        if (dbEntry) return dbEntry;
        return {
          ...s,
          url: hardcodedUrl,
          visible: !!hardcodedUrl,
          sort_order: 99,
        };
      });

      setExtras({ experience: dbExp, services: dbServices, socials: dbSoc });
    } catch (err) {
      console.error("Failed to load portfolio data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, extras, loading, refresh };
}