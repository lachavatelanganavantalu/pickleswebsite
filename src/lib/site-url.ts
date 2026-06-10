/** Canonical public site URL for metadata, OG tags, and absolute links. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  if (process.env.NODE_ENV === "production") {
    return "https://pickleswebsite-xi.vercel.app";
  }

  return "http://localhost:3001";
}
