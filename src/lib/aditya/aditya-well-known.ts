import siteManifest from "../../../ADITYA/site-manifest.json";

import { getSiteUrl } from "@/lib/site-url";

export type AdityaWellKnown = {
  aditya: true;
  aditya_id: string;
  registry: string;
  version: string;
  connector_url: string;
  manifest_url: string;
  intent_endpoint: string;
  llms_txt: string;
};

const ADITYA_REGISTRY = "https://registry.aditya.io";
const ADITYA_PROTOCOL_VERSION = "1.0";

export function getAdityaWellKnown(): AdityaWellKnown {
  const siteUrl = getSiteUrl();
  return {
    aditya: true,
    aditya_id: siteManifest.site_id,
    registry: ADITYA_REGISTRY,
    version: ADITYA_PROTOCOL_VERSION,
    connector_url: `${siteUrl}/.well-known/aditya-connector.json`,
    manifest_url: `${siteUrl}/.well-known/aditya-manifest.json`,
    intent_endpoint: `${siteUrl}/api/agent/intent`,
    llms_txt: `${siteUrl}/llms.txt`,
  };
}
