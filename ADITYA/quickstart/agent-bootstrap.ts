export type SiteManifestLite = {
  site_id: string;
  site_name: string;
  version: string;
  stack_hint?: string | null;
};

export function buildAgentBootstrap(manifest: SiteManifestLite) {
  return {
    siteId: manifest.site_id,
    siteName: manifest.site_name,
    stackHint: manifest.stack_hint ?? "react-next",
    manifestVersion: manifest.version,
  };
}
