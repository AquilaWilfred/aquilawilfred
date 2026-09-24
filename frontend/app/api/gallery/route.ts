import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Log what we received so we can see it in the terminal
  console.log("Gallery POST body:", JSON.stringify(body, null, 2));

  const row = {
    id: body.id || Date.now().toString(),
    title: body.title || "Untitled",
    category: body.category || "General",
    image: body.image,
    tags: Array.isArray(body.tags) ? body.tags : [],
    source: body.source || "url",
    public_id: body.publicId || null,
    file_format: body.format || null,
    file_bytes: body.bytes ? Number(body.bytes) : null,
    img_width: body.width ? Number(body.width) : null,
    img_height: body.height ? Number(body.height) : null,
    visible: body.visible !== false,
  };

  console.log("Gallery row to insert:", JSON.stringify(row, null, 2));

  const { data, error } = await supabase
    .from("gallery")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    // Log the FULL error object so we can see exactly what Supabase says
    console.error("Supabase gallery error:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }

  return NextResponse.json({ data });
}
