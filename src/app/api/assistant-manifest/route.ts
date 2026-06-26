import { NextResponse } from "next/server";
import {
  buildLiveAssistantManifest,
  getAssistantManifestSnapshot,
} from "@/lib/assistant-manifest-db";

export async function GET() {
  try {
    const stored = await getAssistantManifestSnapshot();
    const live = stored ? null : await buildLiveAssistantManifest();

    const snapshot = stored ?? live!;
    return NextResponse.json({
      generatedAt: snapshot.generatedAt,
      version: snapshot.version,
      source: stored ? "published" : "live",
      productCount: snapshot.productCount,
      activeProductCount: snapshot.activeProductCount,
      purchasableProductCount: snapshot.purchasableProductCount,
      comboCount: snapshot.comboCount,
      inactiveProducts: snapshot.inactiveProducts,
      catalog: snapshot.catalog,
    });
  } catch (err) {
    console.error("GET /api/assistant-manifest:", err);
    return NextResponse.json({ error: "Failed to load assistant manifest" }, { status: 500 });
  }
}
