import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminToken, isAdminRequest } from "@/lib/admin-auth";

const COOKIE = "admin_session";
const MAX_AGE = 24 * 60 * 60;

function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAdminRequest(req) });
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const adminUser = process.env.ADMIN_USERNAME ?? "";
    const adminPass = process.env.ADMIN_PASSWORD ?? "";

    if (!adminUser || !adminPass) {
      return NextResponse.json(
        { error: "Admin credentials not configured" },
        { status: 503 }
      );
    }

    if (!safeEqual(username, adminUser) || !safeEqual(password, adminPass)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookie(token));
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
