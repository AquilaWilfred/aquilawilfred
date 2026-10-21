import { NextRequest, NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import { CV_PRICE, normPhone, stkPush } from "@/lib/mpesa";
import { db } from "@/lib/cv/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const phone = normPhone(String(body?.phone ?? ""));
  if (!phone) return NextResponse.json({ error: "Enter a valid Safaricom number, e.g. 0712 345 678" }, { status: 400 });

  try {
    const sb = db();
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await sb.from("cv_orders").select("id", { count: "exact", head: true }).eq("phone", phone).gte("created_at", since);
    if ((count ?? 0) >= 2) return NextResponse.json({ error: "Please wait a minute before trying again." }, { status: 429 });

    const id = randomUUID();
    const { error } = await sb.from("cv_orders").insert({
      id, phone, amount: CV_PRICE, access_token: randomBytes(24).toString("hex"),
    });
    if (error) throw error;

    try {
      const { checkoutId, merchantId } = await stkPush(phone, CV_PRICE, id.slice(0, 8));
      await sb.from("cv_orders").update({ checkout_request_id: checkoutId, merchant_request_id: merchantId }).eq("id", id);
      return NextResponse.json({ orderId: id });
    } catch (e) {
      console.error("STK push failed", e);
      await sb.from("cv_orders").update({ status: "failed", result_desc: "STK push failed" }).eq("id", id);
      return NextResponse.json({ error: "Could not send the M-Pesa prompt. Check the number and try again." }, { status: 502 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payments are unavailable right now." }, { status: 500 });
  }
}