import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings-db";
import { publicSiteSettings } from "@/lib/payment-qr";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(publicSiteSettings(settings));
}
