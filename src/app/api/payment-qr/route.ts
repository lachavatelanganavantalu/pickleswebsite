import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings-db";
import { parseDataUrlImage } from "@/lib/payment-qr";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const download = new URL(req.url).searchParams.get("download") === "1";
    const settings = await getSiteSettings();
    const dataUrl = settings.payment.qrImageDataUrl;
    if (!dataUrl) {
      return NextResponse.json({ error: "QR not uploaded yet" }, { status: 404 });
    }

    const parsed = parseDataUrlImage(dataUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid QR image data" }, { status: 404 });
    }

    const ext = parsed.mime.includes("png") ? "png" : parsed.mime.includes("jpeg") ? "jpg" : "png";

    return new NextResponse(new Uint8Array(parsed.buffer), {
      headers: {
        "Content-Type": parsed.mime,
        "Cache-Control": "public, max-age=300",
        ...(download
          ? { "Content-Disposition": `attachment; filename="lachava-payment-qr.${ext}"` }
          : {}),
      },
    });
  } catch (err) {
    console.error("GET /api/payment-qr:", err);
    return NextResponse.json({ error: "Could not load QR" }, { status: 500 });
  }
}
