import type { ComboPack } from "@/data/combos";
import type { PickleProduct, WeightOption } from "@/types/product";
import { isProductPurchasable } from "@/lib/product-stock";
import {
  expandProductQuery,
  isExplicitComboQuery,
} from "@/lib/aditya/product-aliases";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function formatAvailableWeights(options: WeightOption[]): string {
  return options.map((option) => option.label).join(", ");
}

function isHalfKgHint(hint: string): boolean {
  return /1\s*\/\s*2|half|500/.test(normalize(hint));
}

function isOneKgHint(hint: string): boolean {
  const norm = normalize(hint);
  return /1\s*kg|1kg/.test(norm) && !/1\s*\/\s*2/.test(norm);
}

function optionMatchesHalfKg(option: WeightOption): boolean {
  const label = normalize(option.label);
  return option.id === "500g" || /1\s*\/\s*2|500/.test(label);
}

function optionMatchesOneKg(option: WeightOption): boolean {
  const label = normalize(option.label);
  return (
    option.id === "1kg" ||
    (label.includes("1 kg") && !label.includes("1/2"))
  );
}

export type WeightMatchResult =
  | { ok: true; variant: WeightOption; defaulted?: boolean }
  | {
      ok: false;
      requestedLabel: string;
      available: WeightOption[];
    };

export function matchWeightOptionStrict(
  options: WeightOption[],
  weightHint: string | null,
): WeightMatchResult {
  if (options.length === 0) {
    return { ok: false, requestedLabel: weightHint ?? "unknown", available: [] };
  }

  if (!weightHint) {
    return { ok: true, variant: options[0], defaulted: true };
  }

  let variant: WeightOption | undefined;

  if (isHalfKgHint(weightHint)) {
    variant = options.find(optionMatchesHalfKg);
  } else if (isOneKgHint(weightHint)) {
    variant = options.find(optionMatchesOneKg);
  } else {
    const hint = normalize(weightHint);
    variant = options.find((option) => normalize(option.label).includes(hint));
  }

  if (variant) {
    return { ok: true, variant };
  }

  return {
    ok: false,
    requestedLabel: weightHint,
    available: options,
  };
}

function scoreProduct(product: PickleProduct, query: string): number {
  const q = normalize(query);
  if (!q) return 0;

  const name = normalize(product.name);
  const slug = normalize(product.slug);
  const telugu = normalize(product.nameTelugu ?? "");
  const querySlug = q.replace(/\s+/g, "-");

  let score = 0;

  if (name === q || slug === querySlug) {
    score = 100;
  } else if (slug === `${querySlug}-pickle` || name === `${q} pickle`) {
    score = 98;
  } else if (name.includes(q) || q.includes(name)) {
    score = 80 + q.length;
    const queryTokens = new Set(q.split(" ").filter(Boolean));
    const extraTokens = name
      .split(" ")
      .filter((token) => token !== "pickle" && !queryTokens.has(token));
    score -= extraTokens.length * 18;
  } else if (telugu && (telugu.includes(q) || q.includes(telugu))) {
    score = 75;
  } else {
    const tokens = q.split(" ").filter((token) => token.length > 2);
    const overlap = tokens.filter(
      (token) =>
        name.includes(token) ||
        slug.includes(token) ||
        telugu.includes(token),
    ).length;
    score = overlap > 0 ? 50 + overlap * 15 : 0;
  }

  const wantsAllam = /\ballam\b/.test(q);
  const wantsMamidikaya = /\b(mango|mamidikaya|mamidi)\b/.test(q);

  if (slug.includes("allam")) {
    score += wantsAllam ? 20 : -45;
  } else if (slug === "mamidikaya-pickle" && wantsMamidikaya && !wantsAllam) {
    score += 25;
  }

  return score;
}

function scoreCombo(combo: ComboPack, query: string): number {
  const q = normalize(query);
  if (!q) return 0;

  const fields = [combo.name, combo.nameTelugu, combo.description]
    .filter(Boolean)
    .map((value) => normalize(value!));

  if (fields.some((field) => field.includes(q) || q.includes(field))) {
    return 100;
  }

  if (/\b(combo|combos|999|five pickles|5 pickles)\b/.test(q)) {
    return 90;
  }

  if (q === "pack" && /\bcombo\b/.test(fields.join(" "))) {
    return 85;
  }

  return 0;
}

export function findProductForQuery(
  products: PickleProduct[],
  query: string,
): PickleProduct | null {
  const queryVariants = expandProductQuery(query);
  let best: PickleProduct | null = null;
  let bestScore = 0;

  for (const product of products) {
    if (!isProductPurchasable(product)) continue;

    for (const variant of queryVariants) {
      const score = scoreProduct(product, variant);
      if (score > bestScore) {
        bestScore = score;
        best = product;
      }
    }
  }

  return bestScore >= 50 ? best : null;
}

export function findComboForQuery(
  combos: ComboPack[],
  query: string,
): ComboPack | null {
  if (!isExplicitComboQuery(query)) return null;

  let best: ComboPack | null = null;
  let bestScore = 0;

  for (const combo of combos) {
    if (combo.available === false) continue;
    const score = scoreCombo(combo, query);
    if (score > bestScore) {
      bestScore = score;
      best = combo;
    }
  }

  return bestScore >= 50 ? best : null;
}

export type ResolvedProductCartLine = {
  type: "product";
  product: PickleProduct;
  variant: WeightOption;
};

export type ResolvedComboCartLine = {
  type: "combo";
  combo: ComboPack;
};

export type ResolvedCartLine = ResolvedProductCartLine | ResolvedComboCartLine;

export type ResolveCartLineResult =
  | { ok: true; line: ResolvedCartLine }
  | { ok: false; kind: "not_found"; query: string }
  | {
      ok: false;
      kind: "weight_unavailable";
      product: PickleProduct;
      requestedLabel: string;
      available: WeightOption[];
    };

export function buildWeightUnavailableMessage(
  productName: string,
  requestedLabel: string,
  available: WeightOption[],
): string {
  const sizes = formatAvailableWeights(available);
  return `${requestedLabel} is not available for ${productName}. Available sizes: ${sizes}.`;
}

export function resolveCartLine(
  products: PickleProduct[],
  combos: ComboPack[],
  productQuery: string,
  weightHint: string | null,
): ResolveCartLineResult {
  const product = findProductForQuery(products, productQuery);
  if (product) {
    const weightMatch = matchWeightOptionStrict(product.weightOptions, weightHint);
    if (!weightMatch.ok) {
      return {
        ok: false,
        kind: "weight_unavailable",
        product,
        requestedLabel: weightMatch.requestedLabel,
        available: weightMatch.available,
      };
    }

    return {
      ok: true,
      line: {
        type: "product",
        product,
        variant: weightMatch.variant,
      },
    };
  }

  const combo = findComboForQuery(combos, productQuery);
  if (combo) {
    return { ok: true, line: { type: "combo", combo } };
  }

  return { ok: false, kind: "not_found", query: productQuery };
}

/** @deprecated Use resolveCartLine result type instead */
export function resolveCartItem(
  products: PickleProduct[],
  productQuery: string,
  weightHint: string | null,
) {
  const result = resolveCartLine(products, [], productQuery, weightHint);
  if (!result.ok || result.line.type !== "product") return null;
  return { product: result.line.product, variant: result.line.variant };
}
