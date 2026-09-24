import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";

// Stores global exchange rates in owner_settings under key "exchange_rates"
export async function GET() {
  const { data } = await supabase
    .from("owner_settings")
    .select("data")
    .eq("id", 2)
    .single();
  const rates = data?.data || {
    USD: { buying: 129, selling: 131 },
    EUR: { buying: 140, selling: 142 },
    CNY: { buying: 18, selling: 19 },
    GBP: { buying: 163, selling: 165 },
  };
  return NextResponse.json({ data: rates });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { error } = await supabase
    .from("owner_settings")
    .upsert({ id: 2, data: body }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
