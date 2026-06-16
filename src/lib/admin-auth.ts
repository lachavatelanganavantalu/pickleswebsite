import { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "";
const DEV_ADMIN_SECRET = "lachava-dev-only-admin-session";

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }
  return DEV_ADMIN_SECRET;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME?.trim() && process.env.ADMIN_PASSWORD?.trim());
}

export function createAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(timestamp + ADMIN_USERNAME)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token: string): boolean {
  try {
    const [timestamp, signature] = token.split(".");
    if (!timestamp || !signature) return false;
    const expected = crypto
      .createHmac("sha256", sessionSecret())
      .update(timestamp + ADMIN_USERNAME)
      .digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    return Date.now() - parseInt(timestamp, 10) < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get("admin_session")?.value;
  return !!token && verifyAdminToken(token);
}
