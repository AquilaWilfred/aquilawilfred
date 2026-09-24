import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;

  const row = {
    id: id || Date.now().toString(),
    title: fields.title,
    description: fields.description,
    long_desc: fields.longDesc,
    tech: fields.tech || [],
    stats: fields.stats || {},
    category: fields.category,
    image: fields.image,
    featured: fields.featured || false,
    github: fields.github || "#",
    live: fields.live || "#",
  };

  const { data, error } = await supabase
    .from("projects")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
