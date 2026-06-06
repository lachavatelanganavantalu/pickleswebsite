/** Common shopper spellings → canonical product token for matching. */
export const PRODUCT_QUERY_ALIASES: Record<string, string[]> = {
  mutton: ["mutton", "matan"],
  chinthankaya: ["chinthankaya", "chinthakaya", "chinthakya", "chintakaya", "chintha"],
  usirikaya: ["usirikaya", "usiri", "usirika"],
  mamidikaya: ["mamidikaya", "mango", "mamidi"],
  "mamidikaya allam": ["mamidikaya allam", "mango allam", "mango ginger", "allam pickle"],
  nimmakaya: ["nimmakaya", "nimmakai", "lemon"],
  chicken: ["chicken", "chiken"],
  chepala: ["chepala", "fish", "prawn", "chepa"],
  tomato: ["tomato", "tamato"],
  kakarakaya: ["kakarakaya", "kakarakai", "bitter gourd"],
};

export function expandProductQuery(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  const variants = new Set<string>([normalized]);

  for (const aliases of Object.values(PRODUCT_QUERY_ALIASES)) {
    const matched = aliases.some((alias) => {
      if (normalized === alias) return true;
      const pattern = new RegExp(
        `\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      );
      return pattern.test(normalized);
    });

    if (matched) {
      for (const alias of aliases) variants.add(alias);
    }
  }

  return [...variants];
}

export function isExplicitComboQuery(query: string): boolean {
  const q = query
    .toLowerCase()
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    /\b(combo|combos|combo pack|pickles combo|5 pickles|five pickles|999)\b/.test(q) ||
    q === "999" ||
    q === "pack"
  );
}
