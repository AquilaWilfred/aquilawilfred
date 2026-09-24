import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ew_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function computeToken(password: string): string {
  const secret = process.env.ADMIN_SECRET || "change_this_secret_in_env";
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export function isValidPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export function getSessionToken(): string {
  return computeToken(process.env.ADMIN_PASSWORD || "");
}

export function setSessionCookie(): void {
  cookies().set(COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(): void {
  cookies().delete(COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === getSessionToken();
}
