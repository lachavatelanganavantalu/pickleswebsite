import type { ComboPack } from "@/data/combos";
import { BRAND } from "@/data/brand";
import type { PickleProduct } from "@/types/product";
import { isProductPurchasable } from "@/lib/product-stock";
import type {
  AssistantCatalogCombo,
  AssistantCatalogProduct,
  AssistantManifestSnapshot,
} from "@/types/assistant-manifest";
import baseSiteManifest from "../../../ADITYA/site-manifest.json";

const dedupe = (items: string[]) => [...new Set(items.filter(Boolean))];

function normalizeName(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildProductExamples(product: PickleProduct): string[] {
  const name = normalizeName(product.name);
  const examples = [
    name,
    `buy ${name}`,
    `order ${name}`,
    `add ${name} to cart`,
    `get ${name}`,
    `${name} pickle`,
    `open ${name}`,
    `show ${name}`,
  ];

  if (product.nameTelugu?.trim()) {
    examples.push(normalizeName(product.nameTelugu));
  }

  if (product.subtitle?.trim()) {
    const subtitle = normalizeName(product.subtitle);
    if (subtitle.length >= 3) examples.push(subtitle);
  }

  return dedupe(examples);
}

function toCatalogProduct(product: PickleProduct): AssistantCatalogProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    nameTelugu: product.nameTelugu,
    category: product.category,
    available: product.available,
    purchasable: isProductPurchasable(product),
    tag: product.tag,
    path: `/products/${product.slug}`,
    weightLabels: product.weightOptions.map((option) => option.label),
    intentExamples: buildProductExamples(product),
  };
}

function buildComboExamples(combo: ComboPack): string[] {
  const name = normalizeName(combo.name);
  return dedupe([
    name,
    `buy ${name}`,
    `order ${name}`,
    `${name} combo`,
    "combo pack",
    "999 combo",
  ]);
}

function toCatalogCombo(combo: ComboPack): AssistantCatalogCombo {
  return {
    id: combo.id,
    name: combo.name,
    nameTelugu: combo.nameTelugu,
    available: combo.available !== false,
    path: "/combos",
    priceINR: combo.priceINR,
    intentExamples: buildComboExamples(combo),
  };
}

export function buildAssistantManifest(
  products: PickleProduct[],
  combos: ComboPack[],
): AssistantManifestSnapshot {
  const sortedProducts = [...products].sort((a, b) => a.displayOrder - b.displayOrder);
  const catalogProducts = sortedProducts.map(toCatalogProduct);
  const catalogCombos = combos.map(toCatalogCombo);

  const productBuyExamples = catalogProducts
    .filter((product) => product.purchasable)
    .flatMap((product) =>
      product.intentExamples.filter((example) => /^(buy|order|add|get)/.test(example)),
    );

  const comboBuyExamples = catalogCombos
    .filter((combo) => combo.available)
    .flatMap((combo) =>
      combo.intentExamples.filter((example) => /^(buy|order)/.test(example)),
    );

  const addToCartExamples = dedupe([...productBuyExamples, ...comboBuyExamples]);

  const searchExamples = dedupe(
    catalogProducts
      .filter((product) => product.available)
      .flatMap((product) => [
        product.name.toLowerCase(),
        `find ${product.name.toLowerCase()}`,
        `search ${product.name.toLowerCase()}`,
      ]),
  );

  const productWorkflows = catalogProducts
    .filter((product) => product.available)
    .map((product) => ({
      workflow_id: `view_product_${product.slug}`,
      name: `View ${product.name}`,
      intent_hints: product.intentExamples,
      routes: ["products", "product_detail"],
      steps: [
        {
          step_id: `navigate_${product.slug}`,
          description: `Open ${product.name} product page.`,
          actions: [
            {
              action_id: `open_product_${product.slug}`,
              kind: "navigate",
              label: product.name,
              path: product.path,
              wait_after_ms: 200,
            },
          ],
        },
      ],
    }));

  const dictionaryPatch = {
    workflows: [
      { workflow_id: "add_to_cart", examples: addToCartExamples },
      { workflow_id: "search_content", examples: searchExamples },
      ...productWorkflows.map((workflow) => ({
        workflow_id: workflow.workflow_id,
        name: workflow.name,
        intent_hints: workflow.intent_hints,
        examples: workflow.intent_hints,
      })),
    ],
  };

  const aiProductWorkflows = catalogProducts
    .filter((product) => product.purchasable)
    .map((product) => ({
      id: `view_product_${product.slug}`,
      name: `View ${product.name}`,
      description: `Open ${product.name} product page`,
      intentExamples: product.intentExamples,
      requiredParams: [],
      completionStateKey: `route.${product.path}.visible`,
      completionExpectedValue: "true",
      steps: [
        {
          id: `view_product_${product.slug}_s1`,
          kind: "open_route",
          label: "Open shop",
          route: "/products",
        },
        {
          id: `view_product_${product.slug}_s2`,
          kind: "open_route",
          label: `Open ${product.name}`,
          route: product.path,
        },
      ],
    }));

  const generatedAt = new Date().toISOString();

  return {
    id: "current",
    generatedAt,
    version: generatedAt,
    siteId: baseSiteManifest.site_id,
    siteName: BRAND.nameFull,
    productCount: catalogProducts.length,
    activeProductCount: catalogProducts.filter((product) => product.available).length,
    purchasableProductCount: catalogProducts.filter((product) => product.purchasable).length,
    comboCount: catalogCombos.length,
    catalog: {
      products: catalogProducts,
      combos: catalogCombos,
    },
    dictionaryPatch,
    productWorkflows,
    aiProductWorkflows,
    inactiveProducts: catalogProducts
      .filter((product) => !product.purchasable)
      .map((product) => ({
        id: product.id,
        name: product.name,
        reason:
          product.tag === "out_of_stock"
            ? "out_of_stock"
            : !product.available
              ? "unavailable"
              : "not_purchasable",
      })),
  };
}
