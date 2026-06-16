import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { PublicCustomerUser } from "@/types/customer-user";

const COOKIE = "customer_session";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const DEV_CUSTOMER_SECRET = "lachava-dev-only-customer-session";

function sessionSecret(): string {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CUSTOMER_SESSION_SECRET or SESSION_SECRET must be set in production."
    );
  }
  return DEV_CUSTOMER_SECRET;
}

export function createCustomerToken(userId: string, phone: string): string {
  const timestamp = Date.now().toString();
  const payload = `${timestamp}.${userId}.${phone}`;
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyCustomerToken(token: string): { userId: string; phone: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 4) return null;
    const [timestamp, userId, phone, signature] = parts;
    const payload = `${timestamp}.${userId}.${phone}`;
    const expected = crypto
      .createHmac("sha256", sessionSecret())
      .update(payload)
      .digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    if (Date.now() - parseInt(timestamp, 10) > MAX_AGE * 1000) return null;
    if (!userId || !phone) return null;
    return { userId, phone };
  } catch {
    return null;
  }
}

export function customerSessionCookie(token: string) {
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

export function getCustomerSession(req: NextRequest): { userId: string; phone: string } | null {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function setCustomerSession(res: NextResponse, user: PublicCustomerUser): void {
  const token = createCustomerToken(user.id, user.phone);
  res.cookies.set(customerSessionCookie(token));
}

export function clearCustomerSession(res: NextResponse): void {
  res.cookies.set({
    name: COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function toPublicUser(user: {
  id: string;
  phone: string;
  createdAt: string;
}): PublicCustomerUser {
  return { id: user.id, phone: user.phone, createdAt: user.createdAt };
}
