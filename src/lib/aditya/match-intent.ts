import siteManifest from "@/lib/aditya/site-manifest";
import intentDictionary from "../../../ADITYA/intent-dictionary.json";
import { getAssistantManifestForRuntime } from "@/lib/assistant-manifest-db";
import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import { isBuyIntent, parseBuyOrder } from "./parse-buy-intent";
import { matchSensitiveChatIntent } from "./match-sensitive-intent";
import { matchPlaceOrderIntent } from "./match-place-order-intent";
import { matchNavigateIntent } from "./match-navigate-intent";
import { matchUnknownPickleIntent } from "./unknown-pickle-message";
import type {
  AdityaIntentDictionary,
  AdityaIntentResponse,
  AdityaManifestAction,
  AdityaManifestWorkflow,
  AdityaResolvedAction,
  AdityaSiteManifest,
} from "./types";
import type { AssistantManifestSnapshot } from "@/types/assistant-manifest";

const manifest = siteManifest as AdityaSiteManifest;
const dictionary = intentDictionary as AdityaIntentDictionary;

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

function extractSearchQuery(intent: string): string {
  const normalized = normalize(intent);
  for (const prefix of SEARCH_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return normalized.slice(prefix.length).trim();
    }
  }
  return normalized.replace(/^(search|find|lookup)\s+/, "").trim();
}

function scoreExample(intentNorm: string, example: string): number {
  const exampleNorm = normalize(example);
  if (!exampleNorm) return 0;
  if (intentNorm === exampleNorm) return 100;

  const exampleWords = exampleNorm.split(" ").filter(Boolean);
  if (exampleWords.length === 1 && exampleNorm.length <= 6) {
    const intentWords = intentNorm.split(" ").filter(Boolean);
    if (intentWords.length > 1) return 0;
  }

  if (intentNorm.includes(exampleNorm)) return 70 + exampleNorm.length;
  if (exampleNorm.includes(intentNorm) && intentNorm.length >= 4) return 55 + intentNorm.length;
  return 0;
}

function mergeDictionaryWithManifest(
  manifestSnapshot: AssistantManifestSnapshot,
): AdityaIntentDictionary {
  const patchById = new Map(
    manifestSnapshot.dictionaryPatch.workflows.map((entry) => [entry.workflow_id, entry]),
  );

  const workflows = dictionary.workflows.map((entry) => {
    const patch = patchById.get(entry.workflow_id);
    if (!patch) return entry;
    return {
      ...entry,
      intent_hints: dedupeStrings([...entry.intent_hints, ...(patch.intent_hints ?? [])]),
      examples: dedupeStrings([...entry.examples, ...patch.examples]),
    };
  });

  for (const patch of manifestSnapshot.dictionaryPatch.workflows) {
    if (workflows.some((entry) => entry.workflow_id === patch.workflow_id)) continue;
    workflows.push({
      workflow_id: patch.workflow_id,
      name: patch.name ?? patch.workflow_id,
      intent_hints: patch.intent_hints ?? patch.examples,
      examples: patch.examples,
    });
  }

  return {
    ...dictionary,
    workflows,
  };
}

function dedupeStrings(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function getWorkflows(manifestSnapshot: AssistantManifestSnapshot): AdityaManifestWorkflow[] {
  const byId = new Map<string, AdityaManifestWorkflow>();
  for (const workflow of manifest.workflows) {
    byId.set(workflow.workflow_id, workflow);
  }
  for (const workflow of manifestSnapshot.productWorkflows) {
    byId.set(workflow.workflow_id, workflow);
  }
  return [...byId.values()];
}

function matchWorkflow(
  intent: string,
  mergedDictionary: AdityaIntentDictionary,
  workflows: AdityaManifestWorkflow[],
): AdityaManifestWorkflow | null {
  const intentNorm = normalize(intent);
  if (!intentNorm) return null;

  let bestId: string | null = null;
  let bestScore = 0;

  for (const entry of mergedDictionary.workflows) {
    const candidates = [...entry.intent_hints, ...entry.examples];
    for (const candidate of candidates) {
      const score = scoreExample(intentNorm, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestId = entry.workflow_id;
      }
    }
  }

  if (!bestId || bestScore < 50) return null;
  return workflows.find((workflow) => workflow.workflow_id === bestId) ?? null;
}

function resolveActionKind(action: AdityaManifestAction): AdityaResolvedAction["kind"] {
  if (action.kind === "add_to_cart") return "add_to_cart";
  if (action.kind === "navigate" || action.path) return "navigate";
  if (action.kind === "open_search") return "open_search";
  if (action.kind === "pause" || action.requires_human) return "pause";
  if (action.kind === "noop") return "noop";
  return "navigate";
}

function resolveActions(
  workflow: AdityaManifestWorkflow,
  intent: string,
): { actions: AdityaResolvedAction[]; requiresHuman: boolean; handoff?: string | null } {
  const resolved: AdityaResolvedAction[] = [];
  let requiresHuman = false;
  let handoff: string | null | undefined;

  for (const step of workflow.steps) {
    for (const action of step.actions) {
      const kind = resolveActionKind(action);
      const isPause = kind === "pause" || Boolean(action.requires_human || step.requires_human);
      if (isPause) {
        requiresHuman = true;
        handoff = action.human_handoff_message ?? handoff;
      }

      resolved.push({
        action_id: action.action_id,
        kind: isPause ? "pause" : kind,
        label: action.label,
        path: action.path,
        query: kind === "open_search" ? extractSearchQuery(intent) : undefined,
        requires_human: isPause,
        human_handoff_message: action.human_handoff_message ?? null,
        wait_after_ms: action.wait_after_ms,
      });
    }
  }

  return { actions: resolved, requiresHuman, handoff };
}

export async function resolveAgentIntent(intent: string): Promise<AdityaIntentResponse> {
  const [products, combos, manifestSnapshot] = await Promise.all([
    getAllProducts(),
    getAllCombos(),
    getAssistantManifestForRuntime(),
  ]);
  const mergedDictionary = mergeDictionaryWithManifest(manifestSnapshot);
  const workflows = getWorkflows(manifestSnapshot);

  const bootstrap = {
    siteId: manifest.site_id,
    siteName: manifest.site_name,
    stackHint: manifest.stack_hint ?? "next.js",
    manifestVersion: manifestSnapshot.version || manifest.version,
  };

  const sensitiveMatch = matchSensitiveChatIntent(intent, bootstrap);
  if (sensitiveMatch) return sensitiveMatch;

  const placeOrderMatch = matchPlaceOrderIntent(intent, bootstrap);
  if (placeOrderMatch) return placeOrderMatch;

  const navMatch = matchNavigateIntent(intent, bootstrap, products, combos);
  if (navMatch) return navMatch;

  const unknownPickleMatch = matchUnknownPickleIntent(intent, bootstrap, products, combos);
  if (unknownPickleMatch) return unknownPickleMatch;

  if (isBuyIntent(intent)) {
    const order = parseBuyOrder(intent);
    const lines = order.products;

    const actions = lines.map((parsed, index) => {
      const weightLabel = parsed.weightHint ? ` · ${parsed.weightHint}` : "";
      const summary = `${parsed.productQuery}${weightLabel}`;
      return {
        action_id: `add_product_to_cart_${index + 1}`,
        kind: "add_to_cart" as const,
        label: `Add ${summary}`,
        product_query: parsed.productQuery,
        weight_hint: parsed.weightHint,
        quantity: parsed.quantity,
        cart_summary: summary,
        requires_human: false,
      };
    });

    const activity = lines.flatMap((parsed) => [
      {
        label: "Find item in catalog",
        status: "planned" as const,
        detail: parsed.productQuery,
      },
      {
        label: "Add to cart",
        status: "planned" as const,
        detail: parsed.weightHint ?? "default size",
      },
    ]);

    return {
      matched: true,
      workflow_id: "add_to_cart",
      workflow_name: lines.length > 1 ? "Add multiple items to cart" : "Add to cart",
      intent,
      requires_human: false,
      delivery_draft: order.delivery ?? undefined,
      actions,
      activity,
      bootstrap,
    };
  }

  const workflow = matchWorkflow(intent, mergedDictionary, workflows);

  if (!workflow) {
    return {
      matched: false,
      workflow_id: null,
      workflow_name: null,
      intent,
      requires_human: false,
      actions: [],
      activity: [
        {
          label: "No matching workflow",
          status: "blocked",
          detail: "Try: home, shop, cart, wishlist, track order, sign up, contact",
        },
      ],
      bootstrap,
    };
  }

  const { actions, requiresHuman, handoff } = resolveActions(workflow, intent);
  const searchQuery = actions.find((action) => action.kind === "open_search")?.query;

  const activity = workflow.steps.flatMap((step) =>
    step.actions.map((action) => ({
      label: step.description,
      status: (action.requires_human || step.requires_human
        ? "paused"
        : "planned") as AdityaIntentResponse["activity"][number]["status"],
      detail: action.label,
    })),
  );

  return {
    matched: true,
    workflow_id: workflow.workflow_id,
    workflow_name: workflow.name,
    intent,
    search_query: searchQuery,
    requires_human: requiresHuman,
    pause_reason: requiresHuman ? handoff ?? "This step needs your confirmation." : undefined,
    human_handoff_message: handoff ?? null,
    actions,
    activity,
    bootstrap,
  };
}

export function getAdityaManifest() {
  return manifest;
}

export function getAdityaDictionary() {
  return dictionary;
}
