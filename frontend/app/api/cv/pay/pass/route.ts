import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/cv/orders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!/^[0-9a-f]{48}$/.test(token)) return NextResponse.json({ valid: false });
  const { data } = await db().from("cv_orders").select("expires_at,status").eq("access_token", token).maybeSingle();
  const ok = !!data && data.status === "paid" && !!data.expires_at && new Date(data.expires_at) > new Date();
  return NextResponse.json(ok ? { valid: true, expiresAt: data!.expires_at } : { valid: false });
}