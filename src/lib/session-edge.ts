/**
 * Edge-compatible HMAC session verification for Next.js middleware.
 * Mirrors server cookie formats in customer-auth.ts and admin-auth.ts.
 */

import {
  ORDER_ACCESS_COOKIE,
  hasOrderPaymentAccessCookie,
} from "@/lib/order-payment-access-cookie";

const CUSTOMER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const ADMIN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const DEV_CUSTOMER_SECRET = "lachava-dev-only-customer-session";
const DEV_ADMIN_SECRET = "lachava-dev-only-admin-session";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function customerSessionSecret(): string {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (isProduction()) return "";
  return DEV_CUSTOMER_SECRET;
}

function adminSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (isProduction()) return "";
  return DEV_ADMIN_SECRET;
}

function adminUsername(): string {
  return process.env.ADMIN_USERNAME ?? "";
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyCustomerSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const secret = customerSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [timestamp, userId, phone, signature] = parts;
  if (!timestamp || !userId || !phone || !signature) return false;
  if (Date.now() - Number(timestamp) > CUSTOMER_MAX_AGE_MS) return false;

  const payload = `${timestamp}.${userId}.${phone}`;
  const expected = await hmacSha256Hex(secret, payload);
  return timingSafeEqual(signature, expected);
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const username = adminUsername();
  const secret = adminSessionSecret();
  if (!username || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [timestamp, signature] = parts;
  if (!timestamp || !signature) return false;
  if (Date.now() - Number(timestamp) > ADMIN_MAX_AGE_MS) return false;

  const expected = await hmacSha256Hex(secret, timestamp + username);
  return timingSafeEqual(signature, expected);
}

export { ORDER_ACCESS_COOKIE, hasOrderPaymentAccessCookie };
