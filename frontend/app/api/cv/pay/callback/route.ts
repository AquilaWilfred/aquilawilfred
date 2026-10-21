import { NextRequest, NextResponse } from "next/server";
import { markFailed, markPaid } from "@/lib/cv/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Safaricom doesn't sign callbacks, so the secret in the URL is what proves it's them.
  if (!process.env.MPESA_CALLBACK_SECRET || req.nextUrl.searchParams.get("s") !== process.env.MPESA_CALLBACK_SECRET)
    return NextResponse.json({}, { status: 403 });

  const body = await req.json().catch(() => null);
  const cb = body?.Body?.stkCallback;
  try {
    if (cb?.CheckoutRequestID) {
      if (cb.ResultCode === 0) {
        const items: { Name: string; Value?: unknown }[] = cb.CallbackMetadata?.Item ?? [];
        const get = (n: string) => items.find(i => i.Name === n)?.Value;
        await markPaid(cb.CheckoutRequestID, String(get("MpesaReceiptNumber") ?? ""), Number(get("Amount")));
      } else {
        await markFailed(cb.CheckoutRequestID, String(cb.ResultDesc ?? ""), cb.ResultCode === 1032);
      }
    }
  } catch (e) { console.error("callback error", e); }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}