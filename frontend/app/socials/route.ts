import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("socials")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  // Upsert all socials at once (body.socials is an array)
  if (Array.isArray(body.socials)) {
    const { error } = await supabase.from("socials").upsert(body.socials, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Single upsert
  const row = {
    id: body.id || body.platform?.toLowerCase().replace(/\s+/g, "_"),
    platform: body.platform,
    url: body.url || "",
    icon: body.icon || "🔗",
    visible: body.visible !== false,
    sort_order: body.sort_order || 0,
  };
  const { data, error } = await supabase.from("socials").upsert(row, { onConflict: "id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
