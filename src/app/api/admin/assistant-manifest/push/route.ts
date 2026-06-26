import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { pushAssistantManifest } from "@/lib/assistant-manifest-db";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await pushAssistantManifest();
    return NextResponse.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      version: snapshot.version,
      productCount: snapshot.productCount,
      activeProductCount: snapshot.activeProductCount,
      purchasableProductCount: snapshot.purchasableProductCount,
      comboCount: snapshot.comboCount,
      inactiveProducts: snapshot.inactiveProducts,
    });
  } catch (err) {
    console.error("POST /api/admin/assistant-manifest/push:", err);
    return NextResponse.json({ error: "Failed to push assistant manifest" }, { status: 500 });
  }
}
