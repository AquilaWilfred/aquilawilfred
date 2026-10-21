import { supabase } from "@/lib/supabase-server";
import { PASS_HOURS } from "@/lib/mpesa";

export const db = () => {
  if (!supabase) throw new Error("Database not configured");
  return supabase;
};

export async function markPaid(checkoutId: string, receipt = "", amount?: number) {
  const sb = db();
  const { data: o } = await sb.from("cv_orders").select("id,amount,status").eq("checkout_request_id", checkoutId).maybeSingle();
  if (!o || o.status !== "pending") return;
  if (amount !== undefined && amount !== o.amount) {
    await sb.from("cv_orders").update({ status: "failed", result_desc: "Amount mismatch" }).eq("id", o.id);
    return;
  }
  await sb.from("cv_orders").update({
    status: "paid", mpesa_receipt: receipt,
    expires_at: new Date(Date.now() + PASS_HOURS * 3600e3).toISOString(),
  }).eq("id", o.id).eq("status", "pending");
}

export async function markFailed(checkoutId: string, desc: string, cancelled = false) {
  await db().from("cv_orders")
    .update({ status: cancelled ? "cancelled" : "failed", result_desc: desc })
    .eq("checkout_request_id", checkoutId).eq("status", "pending");
}