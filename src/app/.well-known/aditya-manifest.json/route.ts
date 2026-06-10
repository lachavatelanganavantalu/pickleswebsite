import { NextResponse } from "next/server";
import siteManifest from "../../../../../ADITYA/site-manifest.json";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();

  return NextResponse.json(
    {
      ...siteManifest,
      homepage_url: siteUrl,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
