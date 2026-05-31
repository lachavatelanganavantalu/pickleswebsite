import type { ComboPack } from "@/data/combos";
import { PickleProduct } from "@/types/product";

export interface SearchResult {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  imagePath?: string;
  priceLabel?: string;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function matchesQuery(text: string | undefined, query: string): boolean {
  if (!text) return false;
  return normalize(text).includes(query);
}

export function searchCatalog(
  products: PickleProduct[],
  rawQuery: string,
  combos: ComboPack[] = []
): SearchResult[] {
  const query = normalize(rawQuery);
  if (!query) return [];

  const productResults: SearchResult[] = products
    .filter(
      (p) =>
        matchesQuery(p.name, query) ||
        matchesQuery(p.nameTelugu, query) ||
        matchesQuery(p.subtitle, query) ||
        matchesQuery(p.description, query) ||
        matchesQuery(p.slug, query) ||
        matchesQuery(
          p.category === "veg"
            ? "veg vegetarian"
            : p.category === "combo"
              ? "combo pack offer"
              : "non-veg non veg meat",
          query
        )
    )
    .map((p) => {
      const prices = p.weightOptions.map((w) => w.priceINR);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return {
        id: p.id,
        href: `/products/${p.slug}`,
        title: p.nameTelugu ? `${p.name} (${p.nameTelugu})` : p.name,
        subtitle: p.subtitle,
        imagePath: p.imagePath,
        priceLabel: min === max ? `₹${min}` : `₹${min} – ₹${max}`,
      };
    });

  const comboResults: SearchResult[] = combos
    .filter(
      (c) =>
        matchesQuery(c.name, query) ||
        matchesQuery(c.nameTelugu, query) ||
        matchesQuery(c.description, query) ||
        matchesQuery(c.descriptionTelugu, query) ||
        matchesQuery(c.items, query) ||
        matchesQuery(c.itemsTelugu, query) ||
        matchesQuery("combo pack offer 999", query)
    )
    .map((c) => ({
      id: c.id,
      href: "/combos",
      title: c.nameTelugu ? `${c.name} (${c.nameTelugu})` : c.name,
      subtitle: c.items,
      imagePath: c.imagePath,
      priceLabel: `₹${c.priceINR}`,
    }));

  return [...comboResults, ...productResults];
}
