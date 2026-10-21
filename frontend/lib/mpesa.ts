import { CV_PRICE } from "./mpesa-public";
export { CV_PRICE };

const BASE = process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

export const PASS_HOURS = 24;

/** 0712…, 0112…, +254…, 254… → 2547XXXXXXXX / 2541XXXXXXXX, or null */
export function normPhone(input: string): string | null {
  const m = input.replace(/[\s-]/g, "").match(/^(?:\+?254|0)([17]\d{8})$/);
  return m ? `254${m[1]}` : null;
}

const stamp = () => new Date(Date.now() + 3 * 3600e3).toISOString().replace(/\D/g, "").slice(0, 14); // EAT

const creds = () => {
  const ts = stamp();
  const shortcode = process.env.MPESA_SHORTCODE!;
  const password = Buffer.from(shortcode + process.env.MPESA_PASSKEY + ts).toString("base64");
  return { ts, shortcode, password };
};

async function token(): Promise<string> {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const r = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }, cache: "no-store",
  });
  if (!r.ok) throw new Error("M-Pesa auth failed");
  return (await r.json()).access_token;
}

export async function stkPush(phone: string, amount: number, ref: string) {
  const { ts, shortcode, password } = creds();
  const r = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode, Password: password, Timestamp: ts,
      TransactionType: process.env.MPESA_TYPE || "CustomerPayBillOnline",
      Amount: amount, PartyA: phone, PartyB: process.env.MPESA_PARTYB || shortcode, PhoneNumber: phone,
      CallBackURL: `${process.env.MPESA_CALLBACK_URL}?s=${process.env.MPESA_CALLBACK_SECRET}`,
      AccountReference: ref, TransactionDesc: "CV pass",
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (j.ResponseCode !== "0") throw new Error(j.errorMessage || j.ResponseDescription || "STK push failed");
  return { checkoutId: j.CheckoutRequestID as string, merchantId: j.MerchantRequestID as string };
}

/** Asks Safaricom directly. null = still processing. Backup for missed callbacks. */
export async function stkQuery(checkoutId: string): Promise<{ code: number; desc: string } | null> {
  const { ts, shortcode, password } = creds();
  const r = await fetch(`${BASE}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ BusinessShortCode: shortcode, Password: password, Timestamp: ts, CheckoutRequestID: checkoutId }),
  });
  const j = await r.json().catch(() => null);
  if (!j || j.ResultCode === undefined) return null;
  return { code: Number(j.ResultCode), desc: String(j.ResultDesc ?? "") };
}