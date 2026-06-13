import { NextResponse } from "next/server";
import { isRazorpayConfigured } from "@/lib/razorpay-config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ configured: isRazorpayConfigured() });
}
