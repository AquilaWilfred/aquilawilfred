import { NextRequest, NextResponse } from "next/server";
import { isValidPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password required." }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      // Small delay to slow brute force
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }
    setSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
