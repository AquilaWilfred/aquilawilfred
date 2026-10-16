import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";
import { getProjectOverrides, setProjectOverride } from "@/lib/project-overrides";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ data: getProjectOverrides() });
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = data?.length ? data : [];
    const inMemory = getProjectOverrides();
    const merged = rows.length > 0 ? rows : inMemory;
    return NextResponse.json({ data: merged });
  } catch (error: any) {
    console.error("projects GET fallback:", error?.message || error);
    return NextResponse.json({ data: getProjectOverrides() });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { id, githubId, ...fields } = body;
    const projectId = String(githubId || id || Date.now().toString());

    // ========== Validate Live URL ==========
    let liveUrl = (fields.live || "").trim();

    if (liveUrl && liveUrl !== "#") {
      // Add https:// if missing
      if (!/^https?:\/\//i.test(liveUrl)) {
        liveUrl = `https://${liveUrl}`;
      }

      try {
        const parsed = new URL(liveUrl);

        // Must be http or https
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json(
            { error: "Live URL must start with http:// or https://" },
            { status: 400 }
          );
        }

        const hostname = parsed.hostname;

        // Reject single-word hostnames like "wrong", "localhost" is allowed only in development
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
        const hasValidDomain = hostname.includes(".") && hostname.split(".").length >= 2;

        if (!isLocalhost && !hasValidDomain) {
          return NextResponse.json(
            { error: "Please enter a valid domain (e.g. myproject.com or myapp.vercel.app)" },
            { status: 400 }
          );
        }

        // Extra safety: hostname should not be just a single word
        if (!isLocalhost && !/\.[a-z]{2,}$/i.test(hostname)) {
          return NextResponse.json(
            { error: "Invalid domain. Example: example.com, site.me, app.io" },
            { status: 400 }
          );
        }

      } catch {
        return NextResponse.json(
          { error: "Invalid Live URL. Please enter a valid link." },
          { status: 400 }
        );
      }
    } else {
      liveUrl = "None"; // Default value if no live URL is provided
    }

    const row = {
      id: projectId,
      github_id: String(githubId || id || projectId),
      title: fields.title ?? "",
      github_title: fields.githubTitle ?? "",
      description: fields.description ?? "",
      long_desc: fields.longDesc ?? fields.long_desc ?? "",
      tech: fields.tech ?? [],
      stats: fields.stats ?? {},
      category: fields.category ?? "Web Engineering",
      image: fields.image ?? "",
      featured: Boolean(fields.featured),
      github: fields.github ?? "#",
      live: liveUrl,
      is_customized: true,
    };

    setProjectOverride({
      ...row,
      githubId: row.github_id,
      githubTitle: row.github_title,
      longDesc: row.long_desc,
      isCustomized: true,
    });

    if (!supabase) {
      return NextResponse.json({ data: row, source: "memory" });
    }

    const { data, error } = await supabase
      .from("projects")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("projects POST failed:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
