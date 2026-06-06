/** Common shopper spellings → canonical product token for matching. */
export const PRODUCT_QUERY_ALIASES: Record<string, string[]> = {
  mutton: ["mutton", "matan", "matton"],
  chinthankaya: ["chinthankaya", "chinthakaya", "chinthakya", "chintakaya", "chintha"],
  usirikaya: ["usirikaya", "usiri", "usirika"],
  mamidikaya: ["mamidikaya", "mango", "mamidi"],
  "mamidikaya allam": ["mamidikaya allam", "mango allam", "mango ginger", "allam pickle"],
  nimmakaya: ["nimmakaya", "nimmakai", "lemon", "lime"],
  chicken: ["chicken", "chiken", "chickens"],
  chepala: [
    "chepala",
    "chepa",
    "fish",
    "fishes",
    "prawn",
    "prawns",
    "shrimp",
    "shrimps",
    "royyala",
    "royala",
  ],
  tomato: ["tomato", "tamato", "tomatoes"],
  kakarakaya: ["kakarakaya", "kakarakai", "bitter gourd", "bitterguard", "bitter gourd pickle"],
};

const GENERIC_QUERY_TOKENS = new Set(["pickle", "pickles"]);

function addWordStemVariants(variants: Set<string>, text: string) {
  for (const word of text.split(" ").filter(Boolean)) {
    if (word.endsWith("es") && word.length > 4) {
      variants.add(word.slice(0, -2));
    } else if (word.endsWith("s") && word.length > 3 && !word.endsWith("ss")) {
      variants.add(word.slice(0, -1));
    }
  }
}

export function expandProductQuery(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  const variants = new Set<string>([normalized]);
  addWordStemVariants(variants, normalized);

  for (const aliases of Object.values(PRODUCT_QUERY_ALIASES)) {
    const matched = [...variants].some((candidate) =>
      aliases.some((alias) => {
        if (candidate === alias) return true;
        const pattern = new RegExp(
          `\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        );
        return pattern.test(candidate);
      }),
    );

    if (matched) {
      for (const alias of aliases) variants.add(alias);
    }
  }

  return [...variants];
}

export function isGenericProductToken(token: string): boolean {
  return GENERIC_QUERY_TOKENS.has(token);
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
