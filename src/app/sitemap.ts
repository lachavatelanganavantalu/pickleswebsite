import type { MetadataRoute } from "next";
import { defaultProducts } from "@/data/default-products";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "",
  "/products",
  "/veg-pickles",
  "/non-veg-pickles",
  "/combos",
  "/about",
  "/faq",
  "/pricing",
  "/contact",
  "/cart",
  "/track",
  "/privacy-policy",
  "/terms-and-conditions",
  "/return-refund-policy",
  "/shipping-policy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/products" || path === "/combos" ? 0.9 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = defaultProducts.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
