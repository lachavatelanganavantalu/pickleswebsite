import siteManifest from "../../../ADITYA/site-manifest.json";

export type AdityaWellKnown = {
  aditya: true;
  aditya_id: string;
  registry: string;
  version: string;
};

const ADITYA_REGISTRY = "https://registry.aditya.io";
const ADITYA_PROTOCOL_VERSION = "1.0";

export function getAdityaWellKnown(): AdityaWellKnown {
  return {
    aditya: true,
    aditya_id: siteManifest.site_id,
    registry: ADITYA_REGISTRY,
    version: ADITYA_PROTOCOL_VERSION,
  };
}
