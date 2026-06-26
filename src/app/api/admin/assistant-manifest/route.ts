import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  assistantManifestHasPendingChanges,
  buildLiveAssistantManifest,
  getAssistantManifestSnapshot,
} from "@/lib/assistant-manifest-db";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [stored, live] = await Promise.all([
      getAssistantManifestSnapshot(),
      buildLiveAssistantManifest(),
    ]);

    const hasPendingChanges = assistantManifestHasPendingChanges(stored, live);

    return NextResponse.json({
      published: stored
        ? {
            generatedAt: stored.generatedAt,
            productCount: stored.productCount,
            activeProductCount: stored.activeProductCount,
            purchasableProductCount: stored.purchasableProductCount,
            comboCount: stored.comboCount,
            inactiveProducts: stored.inactiveProducts,
          }
        : null,
      live: {
        productCount: live.productCount,
        activeProductCount: live.activeProductCount,
        purchasableProductCount: live.purchasableProductCount,
        comboCount: live.comboCount,
        inactiveProducts: live.inactiveProducts,
      },
      hasPendingChanges,
    });
  } catch (err) {
    console.error("GET /api/admin/assistant-manifest:", err);
    return NextResponse.json({ error: "Failed to load assistant manifest status" }, { status: 500 });
  }
}
