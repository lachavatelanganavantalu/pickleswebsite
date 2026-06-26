import { NextResponse } from "next/server";
import siteManifest from "@/lib/aditya/site-manifest";
import { getAssistantManifestForRuntime } from "@/lib/assistant-manifest-db";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();
  const snapshot = await getAssistantManifestForRuntime();

  return NextResponse.json(
    {
      ...siteManifest,
      homepage_url: siteUrl,
      version: snapshot.version || siteManifest.version,
      catalog: snapshot.catalog,
      inactive_products: snapshot.inactiveProducts,
      assistant_manifest: {
        generatedAt: snapshot.generatedAt,
        productCount: snapshot.productCount,
        activeProductCount: snapshot.activeProductCount,
        purchasableProductCount: snapshot.purchasableProductCount,
        comboCount: snapshot.comboCount,
      },
      workflows: [...siteManifest.workflows, ...snapshot.productWorkflows],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
