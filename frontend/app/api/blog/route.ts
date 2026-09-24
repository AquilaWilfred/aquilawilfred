import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });

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
    excerpt: fields.excerpt,
    content: fields.content,
    tags: fields.tags || [],
    date: fields.date || new Date().toISOString().split("T")[0],
    read_time: fields.readTime,
    image: fields.image,
    published: fields.published || false,
  };

  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
