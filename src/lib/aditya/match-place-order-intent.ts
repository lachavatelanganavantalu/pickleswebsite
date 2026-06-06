import type { AdityaIntentResponse } from "@/lib/aditya/types";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const PLACE_ORDER_PHRASES = [
  "place order",
  "place my order",
  "submit order",
  "confirm order",
  "complete order",
  "finish order",
  "place the order",
];

const NAV_VERB_PREFIX =
  /^(please\s+)?(go to|open|show|view|take me to|navigate to|visit|i want to|i need to|can i)\s+/;

function stripNavVerbs(text: string): string {
  return text.replace(NAV_VERB_PREFIX, "").replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatches(text: string, phrase: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegex(normalize(phrase))}\\b`);
  return pattern.test(text);
}

export function isPlaceOrderIntent(intent: string): boolean {
  const norm = normalize(intent);
  const stripped = stripNavVerbs(norm);
  const candidates = [norm, stripped].filter(Boolean);

  return PLACE_ORDER_PHRASES.some((phrase) =>
    candidates.some(
      (text) => text === normalize(phrase) || phraseMatches(text, phrase),
    ),
  );
}

export function matchPlaceOrderIntent(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
): AdityaIntentResponse | null {
  if (!isPlaceOrderIntent(intent)) return null;

  return {
    matched: true,
    workflow_id: "place_order",
    workflow_name: "Place order",
    intent,
    assistant_reply: "Placing your order…",
    requires_human: false,
    actions: [
      {
        action_id: "place_order",
        kind: "place_order",
        label: "Place order",
        requires_human: false,
        wait_after_ms: 150,
      },
    ],
    activity: [
      {
        label: "Review cart and delivery details",
        status: "planned",
      },
      {
        label: "Place order",
        status: "planned",
      },
    ],
    bootstrap,
  };
}
