import { NextRequest, NextResponse } from "next/server";
import { getComboById } from "@/lib/combos-db";
import { parseDataUrlImage } from "@/lib/payment-qr";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const combo = await getComboById(id);
    if (!combo?.imageDataUrl) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const parsed = parseDataUrlImage(combo.imageDataUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(parsed.buffer), {
      headers: {
        "Content-Type": parsed.mime,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("GET /api/media/combo/[id]:", err);
    return NextResponse.json({ error: "Could not load image" }, { status: 500 });
  }
}
