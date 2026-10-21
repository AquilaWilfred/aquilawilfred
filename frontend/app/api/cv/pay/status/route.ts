import { NextRequest, NextResponse } from "next/server";
import { stkQuery } from "@/lib/mpesa";
import { db, markFailed, markPaid } from "@/lib/cv/orders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("orderId") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Bad order" }, { status: 400 });

  const sb = db();
  const load = () => sb.from("cv_orders").select("*").eq("id", id).maybeSingle();
  let { data: o } = await load();
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Callback not here after 15s (slow network, or tunnel down)? Ask Safaricom directly.
  if (o.status === "pending" && o.checkout_request_id && Date.now() - new Date(o.created_at).getTime() > 15_000) {
    const q = await stkQuery(o.checkout_request_id).catch(() => null);
    if (q) {
      if (q.code === 0) await markPaid(o.checkout_request_id);
      else await markFailed(o.checkout_request_id, q.desc, q.code === 1032);
      ({ data: o } = await load());
    }
  }

  return NextResponse.json({
    status: o!.status,
    message: o!.result_desc,
    ...(o!.status === "paid" ? { token: o!.access_token, expiresAt: o!.expires_at } : {}),
  });
}