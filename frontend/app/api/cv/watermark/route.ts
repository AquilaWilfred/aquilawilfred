import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";
import { normWm } from "@/lib/cv/engine";

export const dynamic = "force-dynamic";
const ROW = 3; // row 1 = owner settings, row 2 = your CV, row 3 = watermark

export async function GET() {
  if (!supabase) return NextResponse.json({ data: normWm({}) });
  try {
    const { data } = await supabase.from("owner_settings").select("data").eq("id", ROW).maybeSingle();
    return NextResponse.json({ data: normWm(data?.data) });
  } catch {
    return NextResponse.json({ data: normWm({}) });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const clean = normWm(body?.data);
  if (body?.data?.image && !clean.image)
    return NextResponse.json({ error: "Logo must be a PNG, JPG or WebP under 500 KB" }, { status: 400 });

  const { error } = await supabase.from("owner_settings").upsert({ id: ROW, data: clean }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}