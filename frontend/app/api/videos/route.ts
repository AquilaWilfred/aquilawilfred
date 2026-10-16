import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { portfolioData } from "@/data/portfolio";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ data: portfolioData.videos });
  }

  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data?.length ? data : portfolioData.videos });
  } catch (error: any) {
    console.error("videos GET fallback:", error?.message || error);
    return NextResponse.json({ data: portfolioData.videos });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const row = {
    id: body.id || Date.now().toString(),
    title: body.title,
    url: body.url,
    thumbnail: body.thumbnail || "",
    category: body.category || "Demo",
    visible: body.visible !== false,
  };

  const { data, error } = await supabase!
    .from("videos")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
