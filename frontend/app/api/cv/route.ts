import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";
import { norm } from "@/lib/cv/engine";

export const dynamic = "force-dynamic"; // otherwise Next can cache this GET and serve a stale CV

const CV_ROW = 2; // row 1 is your owner settings

export async function GET() {
  if (!supabase) return NextResponse.json({ data: null });
  try {
    const { data, error } = await supabase.from("owner_settings").select("data").eq("id", CV_ROW).single();
    if (error || !data) return NextResponse.json({ data: null });
    return NextResponse.json({ data: data.data }); // { name, data: CV }
  } catch {
    return NextResponse.json({ data: null });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body?.data || typeof body.data !== "object" || !Array.isArray(body.data.education))
    return NextResponse.json({ error: "Invalid CV" }, { status: 400 });

  const clean = norm(body.data); // store only what the renderer can display

  const { error } = await supabase
    .from("owner_settings")
    .upsert({ id: CV_ROW, data: { name: String(body.name || "CV"), data: clean } }, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}