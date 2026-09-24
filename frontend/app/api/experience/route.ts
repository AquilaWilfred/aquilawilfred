import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const row = {
    id: body.id || Date.now().toString(),
    role: body.role,
    company: body.company,
    period: body.period,
    location: body.location,
    highlights: body.highlights || [],
    visible: body.visible !== false,
    sort_order: body.sort_order || 0,
  };
  const { data, error } = await supabase.from("experience").upsert(row, { onConflict: "id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
