export type AdityaActionKind =
  | "navigate"
  | "open_search"
  | "pause"
  | "noop"
  | "add_to_cart"
  | "place_order";

export type AdityaManifestAction = {
  action_id: string;
  kind: AdityaActionKind | string;
  label: string;
  path?: string;
  route_id?: string;
  element_id?: string;
  value?: string;
  requires_human?: boolean;
  human_handoff_message?: string | null;
  wait_after_ms?: number;
};

export type AdityaManifestStep = {
  step_id: string;
  description: string;
  requires_human?: boolean;
  actions: AdityaManifestAction[];
};

export type AdityaManifestWorkflow = {
  workflow_id: string;
  name: string;
  intent_hints: string[];
  routes?: string[];
  steps: AdityaManifestStep[];
};

export type AdityaSiteManifest = {
  site_id: string;
  site_name: string;
  version: string;
  homepage_url: string;
  stack_hint?: string;
  workflows: AdityaManifestWorkflow[];
  sensitive_keywords?: string[];
  restricted_actions?: string[];
};

export type AdityaDictionaryWorkflow = {
  workflow_id: string;
  name: string;
  intent_hints: string[];
  examples: string[];
};

export type AdityaIntentDictionary = {
  site_id: string;
  site_name: string;
  homepage_url: string;
  matching_mode: string;
  global_terms: string[];
  workflows: AdityaDictionaryWorkflow[];
};

export type AdityaResolvedAction = {
  action_id: string;
  kind: AdityaActionKind;
  label: string;
  path?: string;
  query?: string;
  product_query?: string;
  weight_hint?: string | null;
  quantity?: number;
  cart_summary?: string;
  requires_human: boolean;
  human_handoff_message?: string | null;
  wait_after_ms?: number;
};

export type CheckoutDeliveryDraftResponse = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type AdityaIntentResponse = {
  matched: boolean;
  workflow_id: string | null;
  workflow_name: string | null;
  intent: string;
  search_query?: string;
  requires_human: boolean;
  pause_reason?: string;
  human_handoff_message?: string | null;
  delivery_draft?: CheckoutDeliveryDraftResponse;
  actions: AdityaResolvedAction[];
  activity: Array<{
    label: string;
    status: "planned" | "working" | "paused" | "done" | "blocked";
    detail?: string;
  }>;
  bootstrap: {
    siteId: string;
    siteName: string;
    stackHint: string;
    manifestVersion: string;
  };
  assistant_reply?: string;
};

export type AgentIntentRequest = {
  intent: string;
  dryRun?: boolean;
};
