import type { CheckoutDeliveryDraft } from "@/lib/checkout-draft";
import {
  parseDeliverySection,
  splitProductsAndDelivery,
} from "@/lib/aditya/parse-delivery";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s/+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const BUY_PREFIX = /^(buy|add|order|get|purchase|add to cart)\s+/i;

const PRODUCT_SPLIT =
  /\s*(?:\+|,|\band\b|\&|\bwith\b|\bplus\b)\s*/i;

const WEIGHT_PATTERNS: Array<{ pattern: RegExp; hint: string }> = [
  {
    pattern: /\b(1\s*\/\s*2\s*kg|half\s*kg|500\s*gm|500gm|500\s*g|500g|500\s*grams?)\b/i,
    hint: "1/2 kg",
  },
  { pattern: /\b(1\s*kg|1kg)\b/i, hint: "1 kg" },
];

export type ParsedBuyIntent = {
  productQuery: string;
  weightHint: string | null;
  quantity: number;
};

export type ParsedBuyOrder = {
  products: ParsedBuyIntent[];
  delivery: CheckoutDeliveryDraft | null;
};

function stripBuyPrefix(intent: string): string {
  return intent.trim().replace(BUY_PREFIX, "").trim();
}

function splitProductSegments(productSection: string): string[] {
  return productSection
    .split(PRODUCT_SPLIT)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function isBuyIntent(intent: string): boolean {
  const raw = intent.trim();
  if (!raw) return false;
  if (BUY_PREFIX.test(raw)) return true;
  if (/\s+for\s+/i.test(raw)) return true;
  if (/[,+]/.test(raw)) return true;
  if (PRODUCT_SPLIT.test(raw)) return true;

  const norm = normalize(intent);
  if (/\b(1\s*\/\s*2\s*kg|1\s*kg|500\s*gm|500gm|500\s*g|500g)\b/.test(norm)) {
    return true;
  }

  const { productSection } = splitProductsAndDelivery(stripBuyPrefix(raw));
  return splitProductSegments(productSection).length > 1;
}

function parseBuyIntentSegment(segment: string): ParsedBuyIntent | null {
  let text = normalize(segment);

  if (!text) return null;

  let weightHint: string | null = null;
  for (const { pattern, hint } of WEIGHT_PATTERNS) {
    if (pattern.test(text)) {
      weightHint = hint;
      text = text.replace(pattern, " ").replace(/\s+/g, " ").trim();
      break;
    }
  }

  let quantity = 1;
  const qtyMatch = text.match(/^(\d+)\s*(?:x\s+)?(?!\/?\s*\d*\s*kg\b|\s*kg\b|\s*g\b)/i);
  if (qtyMatch) {
    quantity = Math.max(1, Number.parseInt(qtyMatch[1], 10) || 1);
    text = text.slice(qtyMatch[0].length).trim();
  }

  const isComboLike = /\b(combo|pack|999)\b/.test(text);
  if (!isComboLike) {
    text = text.replace(/\b(pickle|pickles)\b/g, " ").replace(/\s+/g, " ").trim();
  } else {
    text = text.replace(/\s+/g, " ").trim();
  }

  const productQuery = text.length > 0 ? text : segment.trim();
  if (!productQuery) return null;

  if (/^\d{10}$/.test(productQuery.replace(/\D/g, ""))) return null;
  if (/[\w.+-]+@[\w.-]+\.\w+/.test(segment)) return null;
  if (/^(telangana|andhra pradesh|india)$/i.test(productQuery)) return null;
  if (/^\d{6}$/.test(productQuery)) return null;
  if (/india[-\s]*\d{6}/i.test(segment)) return null;

  return { productQuery, weightHint, quantity };
}

export function parseBuyOrder(intent: string): ParsedBuyOrder {
  const withoutPrefix = stripBuyPrefix(intent);
  const { productSection, deliverySection } = splitProductsAndDelivery(withoutPrefix);

  const products = splitProductSegments(productSection)
    .map(parseBuyIntentSegment)
    .filter((line): line is ParsedBuyIntent => line !== null);

  const delivery = deliverySection ? parseDeliverySection(deliverySection) : null;

  return { products, delivery };
}

export function parseBuyIntentLines(intent: string): ParsedBuyIntent[] {
  const { products } = parseBuyOrder(intent);
  if (products.length > 0) return products;
  return [{ productQuery: intent.trim(), weightHint: null, quantity: 1 }];
}

export function parseBuyIntent(intent: string): ParsedBuyIntent {
  const lines = parseBuyIntentLines(intent);
  return lines[0] ?? { productQuery: intent.trim(), weightHint: null, quantity: 1 };
}

export function splitBuySegments(intent: string): string[] {
  const { productSection } = splitProductsAndDelivery(stripBuyPrefix(intent));
  return splitProductSegments(productSection);
}
