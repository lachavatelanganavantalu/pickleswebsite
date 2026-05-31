import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdminRequest } from "@/lib/admin-auth";
import { invalidateSiteSettingsCache, getSiteSettings, saveSiteSettings } from "@/lib/site-settings-db";

const QR_PATH = path.join(process.cwd(), "public", "payment-qr.png");

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dataUrl } = await req.json();
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const base64 = dataUrl.split(",")[1];
    if (!base64) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    await fs.writeFile(QR_PATH, Buffer.from(base64, "base64"));

    const settings = await getSiteSettings();
    const next = await saveSiteSettings({
      ...settings,
      payment: {
        ...settings.payment,
        qrImagePath: `/payment-qr.png?v=${Date.now()}`,
      },
    });

    invalidateSiteSettingsCache();
    return NextResponse.json({ ok: true, qrImagePath: next.payment.qrImagePath });
  } catch (err) {
    console.error("POST /api/admin/payment-qr:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
