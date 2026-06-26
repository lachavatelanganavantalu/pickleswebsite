import type { ComboPack } from "@/data/combos";
import type { PickleProduct } from "@/types/product";
import { SITE_NAV_DESTINATIONS, NAV_VERB_PREFIX } from "@/lib/aditya/site-navigation";
import { findProductForQuery } from "@/lib/aditya/resolve-cart-item";
import { isBuyIntent } from "@/lib/aditya/parse-buy-intent";
import {
  buildUnknownPickleIntentResponse,
  isUnknownPickleQuery,
} from "@/lib/aditya/unknown-pickle-message";
import type { AdityaIntentResponse } from "@/lib/aditya/types";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const SEARCH_PREFIXES = [
  "search for ",
  "search ",
  "find ",
  "lookup ",
  "show me ",
  "look for ",
];

function stripNavVerbs(text: string): string {
  return text.replace(NAV_VERB_PREFIX, "").replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatchesText(text: string, phrase: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegex(normalize(phrase))}\\b`);
  return pattern.test(text);
}

function scorePhrase(text: string, phrase: string): number {
  const phraseNorm = normalize(phrase);
  if (!phraseNorm) return 0;
  if (text === phraseNorm) return 120 + phraseNorm.length;
  if (text.endsWith(` ${phraseNorm}`) || text.startsWith(`${phraseNorm} `)) {
    return 100 + phraseNorm.length;
  }
  if (phraseMatchesText(text, phraseNorm)) return 80 + phraseNorm.length;
  return 0;
}

function buildNavigateResponse(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
  destination: (typeof SITE_NAV_DESTINATIONS)[number],
): AdityaIntentResponse {
  const actions: AdityaIntentResponse["actions"] = [
    {
      action_id: `nav_${destination.id}`,
      kind: "navigate",
      label: destination.name,
      path: destination.path,
      requires_human: false,
      wait_after_ms: 150,
    },
  ];

  if (destination.requiresHuman) {
    actions.push({
      action_id: `pause_${destination.id}`,
      kind: "pause",
      label: destination.name,
      requires_human: true,
      human_handoff_message: destination.humanHandoffMessage ?? null,
    });
  }

  return {
    matched: true,
    workflow_id: destination.id,
    workflow_name: destination.name,
    intent,
    assistant_reply: destination.reply,
    requires_human: Boolean(destination.requiresHuman),
    pause_reason: destination.humanHandoffMessage,
    human_handoff_message: destination.humanHandoffMessage ?? null,
    actions,
    activity: [],
    bootstrap,
  };
}

function matchDestination(intent: string): (typeof SITE_NAV_DESTINATIONS)[number] | null {
  const raw = normalize(intent);
  const stripped = stripNavVerbs(raw);
  const candidates = [raw, stripped].filter(Boolean);

  let best: (typeof SITE_NAV_DESTINATIONS)[number] | null = null;
  let bestScore = 0;

  for (const destination of SITE_NAV_DESTINATIONS) {
    for (const phrase of destination.phrases) {
      for (const text of candidates) {
        const score = scorePhrase(text, phrase);
        if (score > bestScore) {
          bestScore = score;
          best = destination;
        }
      }
    }
  }

  return bestScore >= 80 ? best : null;
}

function matchSearchIntent(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
  products: PickleProduct[],
  combos: ComboPack[],
): AdityaIntentResponse | null {
  const norm = normalize(intent);
  let query = "";

  for (const prefix of SEARCH_PREFIXES) {
    if (norm.startsWith(prefix)) {
      query = norm.slice(prefix.length).trim();
      break;
    }
  }

  if (!query && /^(search|find|lookup)\s/.test(norm)) {
    query = norm.replace(/^(search|find|lookup)\s+/, "").trim();
  }

  if (!query) return null;

  if (isUnknownPickleQuery(query, products, combos)) {
    return buildUnknownPickleIntentResponse(intent, bootstrap, query);
  }

  return {
    matched: true,
    workflow_id: "search_content",
    workflow_name: "Search pickles",
    intent,
    search_query: query,
    assistant_reply: query
      ? `Showing search results for "${query}".`
      : "Opening shop search.",
    requires_human: false,
    actions: [
      {
        action_id: "open_search",
        kind: "open_search",
        label: "Search",
        query,
        requires_human: false,
        wait_after_ms: 150,
      },
    ],
    activity: [],
    bootstrap,
  };
}

function isExactNavPhrase(text: string): boolean {
  return SITE_NAV_DESTINATIONS.some((destination) =>
    destination.phrases.some((phrase) => normalize(phrase) === text),
  );
}

function matchProductPageIntent(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
  products: PickleProduct[],
): AdityaIntentResponse | null {
  const stripped = stripNavVerbs(normalize(intent))
    .replace(/\b(page|product|pickle|pickles)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!stripped || stripped.length < 3) return null;

  const product = findProductForQuery(products, stripped);
  if (!product) return null;

  return {
    matched: true,
    workflow_id: "view_product",
    workflow_name: "View product",
    intent,
    assistant_reply: `Opening ${product.name}.`,
    requires_human: false,
    actions: [
      {
        action_id: "nav_product_page",
        kind: "navigate",
        label: product.name,
        path: `/products/${product.slug}`,
        requires_human: false,
        wait_after_ms: 150,
      },
    ],
    activity: [],
    bootstrap,
  };
}

export function matchNavigateIntent(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
  products: PickleProduct[],
  combos: ComboPack[],
): AdityaIntentResponse | null {
  if (isBuyIntent(intent)) return null;

  const search = matchSearchIntent(intent, bootstrap, products, combos);
  if (search) return search;

  const stripped = stripNavVerbs(normalize(intent));
  if (stripped && !isExactNavPhrase(stripped) && stripped.split(" ").length >= 2) {
    const productPage = matchProductPageIntent(intent, bootstrap, products);
    if (productPage) return productPage;
  }

  const destination = matchDestination(intent);
  if (destination) {
    return buildNavigateResponse(intent, bootstrap, destination);
  }

  return matchProductPageIntent(intent, bootstrap, products);
}
