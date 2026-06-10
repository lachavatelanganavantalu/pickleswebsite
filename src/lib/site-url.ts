const PRODUCTION_SITE_URL = "https://www.lachavapickles.store";

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/** Canonical public site URL for metadata, OG tags, robots.txt, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return normalizeSiteUrl(fromEnv);

  // Always use the custom domain on Vercel production — never a per-deploy *.vercel.app host.
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return normalizeSiteUrl(`https://${vercel.replace(/^https?:\/\//, "")}`);
  }

  return "http://localhost:3001";
}
