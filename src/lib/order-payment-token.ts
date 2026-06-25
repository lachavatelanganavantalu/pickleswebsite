import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ORDER_ACCESS_COOKIE,
  parseOrderPaymentAccessCookie,
} from "@/lib/order-payment-access-cookie";

export { ORDER_ACCESS_COOKIE, parseOrderPaymentAccessCookie };
const TOKEN_BYTES = 32;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

const DEV_PAYMENT_SECRET = "lachava-dev-only-order-payment-token";

function paymentTokenSecret(): string {
  const secret =
    process.env.ORDER_PAYMENT_SECRET?.trim() ||
    process.env.CUSTOMER_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ORDER_PAYMENT_SECRET, CUSTOMER_SESSION_SECRET, or SESSION_SECRET must be set in production."
    );
  }
  return DEV_PAYMENT_SECRET;
}

export function generatePaymentAccessToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashPaymentAccessToken(token: string): string {
  return crypto.createHmac("sha256", paymentTokenSecret()).update(token).digest("hex");
}

export function verifyPaymentAccessToken(token: string, hash: string | undefined): boolean {
  if (!token || !hash) return false;
  const expected = hashPaymentAccessToken(token);
  const tokenBuf = Buffer.from(expected, "utf8");
  const hashBuf = Buffer.from(hash, "utf8");
  if (tokenBuf.length !== hashBuf.length) return false;
  return crypto.timingSafeEqual(tokenBuf, hashBuf);
}

export function getOrderPaymentTokenFromRequest(
  req: NextRequest,
  orderId: string
): string | null {
  const fromCookie = parseOrderPaymentAccessCookie(req.cookies.get(ORDER_ACCESS_COOKIE)?.value);
  if (fromCookie?.orderId === orderId) return fromCookie.token;

  const header = req.headers.get("x-order-access-token")?.trim();
  if (header) return header;

  return req.nextUrl.searchParams.get("access")?.trim() || null;
}

export function orderPaymentAccessGranted(
  req: NextRequest,
  orderId: string,
  tokenHash: string | undefined
): boolean {
  const token = getOrderPaymentTokenFromRequest(req, orderId);
  return verifyPaymentAccessToken(token ?? "", tokenHash);
}

export function setOrderPaymentAccessCookie(
  res: NextResponse,
  orderId: string,
  token: string
): void {
  res.cookies.set({
    name: ORDER_ACCESS_COOKIE,
    value: `${orderId}.${token}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearOrderPaymentAccessCookie(res: NextResponse): void {
  res.cookies.set({
    name: ORDER_ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
