import type { AdityaManifestWorkflow } from "@/lib/aditya/types";

export interface AssistantCatalogProduct {
  id: string;
  slug: string;
  name: string;
  nameTelugu?: string;
  category: string;
  available: boolean;
  purchasable: boolean;
  tag: string | null;
  path: string;
  weightLabels: string[];
  intentExamples: string[];
}

export interface AssistantCatalogCombo {
  id: string;
  name: string;
  nameTelugu?: string;
  available: boolean;
  path: string;
  priceINR: number;
  intentExamples: string[];
}

export interface AssistantDictionaryWorkflowPatch {
  workflow_id: string;
  name?: string;
  intent_hints?: string[];
  examples: string[];
}

export interface AssistantInactiveProduct {
  id: string;
  name: string;
  reason: "out_of_stock" | "unavailable" | "not_purchasable";
}

export interface AssistantAiWorkflow {
  id: string;
  name: string;
  description: string;
  intentExamples: string[];
  requiredParams: string[];
  completionStateKey: string;
  completionExpectedValue: string;
  steps: Array<{
    id: string;
    kind: string;
    label: string;
    route: string;
  }>;
}

export interface AssistantManifestSnapshot {
  id: "current";
  generatedAt: string;
  version: string;
  siteId: string;
  siteName: string;
  productCount: number;
  activeProductCount: number;
  purchasableProductCount: number;
  comboCount: number;
  catalog: {
    products: AssistantCatalogProduct[];
    combos: AssistantCatalogCombo[];
  };
  dictionaryPatch: {
    workflows: AssistantDictionaryWorkflowPatch[];
  };
  productWorkflows: AdityaManifestWorkflow[];
  aiProductWorkflows: AssistantAiWorkflow[];
  inactiveProducts: AssistantInactiveProduct[];
}
