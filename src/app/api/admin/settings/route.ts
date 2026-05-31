import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings-db";
import type { SiteSettings } from "@/types/site-settings";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSiteSettings());
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as SiteSettings;
    const saved = await saveSiteSettings(body);
    return NextResponse.json(saved);
  } catch (err) {
    console.error("PUT /api/admin/settings:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
