import { NextResponse } from "next/server";
import siteManifest from "@/lib/aditya/site-manifest";
import { getAdityaWellKnown } from "@/lib/aditya/aditya-well-known";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();

  return NextResponse.json(
    {
      connector: "aditya",
      connector_type: "AdityaConnector",
      ...getAdityaWellKnown(),
      site_name: siteManifest.site_name,
      homepage_url: siteUrl,
      llms_txt: `${siteUrl}/llms.txt`,
      manifest_url: `${siteUrl}/.well-known/aditya-manifest.json`,
      intent_endpoint: `${siteUrl}/api/agent/intent`,
      health_endpoint: `${siteUrl}/api/agent/health`,
      methods: {
        intent: {
          http_method: "POST",
          content_type: "application/json",
          body_schema: { intent: "string" },
        },
      },
      human_confirmation_required: [
        "checkout",
        "payment",
        "password_change",
        "account_deletion",
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
