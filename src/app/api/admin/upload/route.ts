import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { validateCatalogImageDataUrl } from "@/lib/catalog-media";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { dataUrl } = body as { dataUrl?: string };

    if (typeof dataUrl !== "string") {
      return NextResponse.json({ error: "Image data required" }, { status: 400 });
    }

    const validationError = validateCatalogImageDataUrl(dataUrl);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    return NextResponse.json({ ok: true, dataUrl });
  } catch (err) {
    console.error("POST /api/admin/upload:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
