import { NextResponse } from "next/server";
import siteManifest from "@/lib/aditya/site-manifest";
import { getAdityaWellKnown } from "@/lib/aditya/aditya-well-known";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();

  return NextResponse.json({
    status: "ok",
    aditya: getAdityaWellKnown(),
    site_id: siteManifest.site_id,
    site_name: siteManifest.site_name,
    homepage_url: siteUrl,
    intent_endpoint: `${siteUrl}/api/agent/intent`,
    manifest_url: `${siteUrl}/.well-known/aditya-manifest.json`,
    connector_url: `${siteUrl}/.well-known/aditya-connector.json`,
    llms_txt: `${siteUrl}/llms.txt`,
    workflows: siteManifest.workflows?.length ?? 0,
  });
}
