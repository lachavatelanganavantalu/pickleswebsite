import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings-db";
import { parseDataUrlImage } from "@/lib/payment-qr";

export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    const dataUrl = settings.payment.qrImageDataUrl;
    if (!dataUrl) {
      return NextResponse.json({ error: "QR not uploaded yet" }, { status: 404 });
    }

    const parsed = parseDataUrlImage(dataUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid QR image data" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(parsed.buffer), {
      headers: {
        "Content-Type": parsed.mime,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("GET /api/payment-qr:", err);
    return NextResponse.json({ error: "Could not load QR" }, { status: 500 });
  }
}
