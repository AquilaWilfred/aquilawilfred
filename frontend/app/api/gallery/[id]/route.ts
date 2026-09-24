import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get the item first so we can delete its storage file if it's a Supabase Storage URL
  const { data: item } = await supabase.from("gallery").select("image").eq("id", params.id).single();
  
  if (item?.image && item.image.includes("supabase")) {
    // Extract storage path and delete from bucket
    const urlParts = item.image.split("/storage/v1/object/public/gallery-images/");
    if (urlParts[1]) {
      await supabase.storage.from("gallery-images").remove([urlParts[1]]);
    }
  }

  const { error } = await supabase.from("gallery").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
