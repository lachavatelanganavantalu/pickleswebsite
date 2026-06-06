import { comboPacks } from "@/data/combos";
import { defaultProducts } from "@/data/default-products";
import { defaultSiteSettings } from "@/data/default-site-settings";
import { isBuyIntent } from "@/lib/aditya/parse-buy-intent";
import {
  expandProductQuery,
  isExplicitComboQuery,
  isGenericProductToken,
} from "@/lib/aditya/product-aliases";
import {
  findComboForQuery,
  findProductForQuery,
} from "@/lib/aditya/resolve-cart-item";
import { NAV_VERB_PREFIX } from "@/lib/aditya/site-navigation";
import type { AdityaIntentResponse } from "@/lib/aditya/types";

export const UNKNOWN_PICKLE_MESSAGE =
  "We don't have that pickle to serve you. Thank you for letting us know your favourite pickle — please message us via WhatsApp.";

const SEARCH_PREFIXES = [
  "search for ",
  "search ",
  "find ",
  "lookup ",
  "show me ",
  "look for ",
];

const OFF_MENU_PICKLE_TERMS = [
  "gongura",
  "avakaya",
  "prawn",
  "prawns",
  "royyala",
  "royyalu",
  "royala",
  "shrimp",
  "shrimps",
];

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function stripNavVerbs(text: string): string {
  return text.replace(NAV_VERB_PREFIX, "").replace(/\s+/g, " ").trim();
}

export function getShopWhatsAppUrl(prefill?: string): string {
  const num =
    defaultSiteSettings.contact.whatsapp.replace(/\D/g, "") || "916302112848";
  const base = `https://wa.me/${num}`;
  if (!prefill?.trim()) return base;
  return `${base}?text=${encodeURIComponent(prefill.trim())}`;
}

export function extractPickleProductQuery(intent: string): string {
  const norm = normalize(intent);

  for (const prefix of SEARCH_PREFIXES) {
    if (norm.startsWith(prefix)) {
      return norm.slice(prefix.length).trim();
    }
  }

  return stripNavVerbs(norm)
    .replace(
      /\b(page|product|pickle|pickles|buy|order|add|get|purchase|want|need|show|open|view|see|for)\b/g,
      " ",
    )
    .replace(/\b(1\s*\/\s*2\s*kg|half\s*kg|500\s*g|500g|1\s*kg|1kg)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function looksLikePickleProductQuery(query: string): boolean {
  const norm = normalize(query);
  if (!norm || norm.length < 3) return false;
  if (isExplicitComboQuery(norm)) return false;

  if (
    OFF_MENU_PICKLE_TERMS.some((term) =>
      new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(norm),
    )
  ) {
    return true;
  }

  if (/\bpickles?\b/.test(norm)) {
    const rest = norm
      .replace(/\bpickles?\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const tokens = rest.split(" ").filter((token) => token && !isGenericProductToken(token));
    if (tokens.length > 0) return true;
  }

  const variants = expandProductQuery(norm);
  if (variants.length > 1) return true;

  return false;
}

export function isUnknownPickleQuery(query: string): boolean {
  if (!looksLikePickleProductQuery(query)) return false;
  if (findProductForQuery(defaultProducts, query)) return false;
  if (findComboForQuery(comboPacks, query)) return false;
  return true;
}

export function buildUnknownPickleIntentResponse(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
  productQuery?: string,
): AdityaIntentResponse {
  const query = productQuery?.trim() || extractPickleProductQuery(intent);
  const prefill = query
    ? `Hi, I'd like to know about ${query} pickle.`
    : undefined;

  return {
    matched: true,
    workflow_id: "unknown_pickle",
    workflow_name: "Pickle not available",
    intent,
    assistant_reply: UNKNOWN_PICKLE_MESSAGE,
    requires_human: false,
    actions: [
      {
        action_id: "whatsapp_pickle_request",
        kind: "navigate",
        label: "Message on WhatsApp",
        path: getShopWhatsAppUrl(prefill),
        requires_human: false,
        wait_after_ms: 150,
      },
    ],
    activity: [],
    bootstrap,
  };
}

export function matchUnknownPickleIntent(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
): AdityaIntentResponse | null {
  if (isBuyIntent(intent)) return null;

  const query = extractPickleProductQuery(intent);
  if (!isUnknownPickleQuery(query)) return null;

  return buildUnknownPickleIntentResponse(intent, bootstrap, query);
}
