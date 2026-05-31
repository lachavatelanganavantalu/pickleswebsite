import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { invalidateSiteSettingsCache, getSiteSettings, saveSiteSettings } from "@/lib/site-settings-db";
import { parseDataUrlImage, paymentQrDisplayUrl } from "@/lib/payment-qr";

export const runtime = "nodejs";

const MAX_DATA_URL_LENGTH = 2_500_000;

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dataUrl } = await req.json();
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json({ error: "Image too large — use a smaller QR PNG/JPG" }, { status: 400 });
    }
    if (!parseDataUrlImage(dataUrl)) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const next = await saveSiteSettings({
      ...settings,
      payment: {
        ...settings.payment,
        qrImageDataUrl: dataUrl,
        qrImagePath: paymentQrDisplayUrl({
          ...settings,
          payment: { ...settings.payment, qrImageDataUrl: dataUrl },
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    invalidateSiteSettingsCache();
    const qrImagePath = paymentQrDisplayUrl(next);
    return NextResponse.json({ ok: true, qrImagePath });
  } catch (err) {
    console.error("POST /api/admin/payment-qr:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
