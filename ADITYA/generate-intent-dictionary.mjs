import fs from "node:fs";

const [, , manifestPath, outputPath] = process.argv;

if (!manifestPath || !outputPath) {
  console.error(
    "Usage: node ADITYA/generate-intent-dictionary.mjs <manifest.json> <output.json>",
  );
  process.exit(1);
}

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const normalize = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const dedupe = (items) => [...new Set(items.filter(Boolean))];

const manifest = readJson(manifestPath);
const workflowTemplates = {
  open_launcher: [
    "ask assistant",
    "open assistant",
    "show assistant",
    "help me",
  ],
  search_content: [
    "search",
    "find",
    "lookup",
    "show me this",
    "search mango pickle",
    "find chicken pickle",
  ],
  browse_shop: [
    "shop",
    "browse",
    "pickles",
    "products",
    "show pickles",
    "open shop",
  ],
  browse_combos: [
    "combo",
    "combos",
    "5 pickles combo",
    "999 combo",
  ],
  add_to_cart: [
    "buy",
    "add to cart",
    "order",
    "purchase",
    "buy mutton pickle 1 kg",
    "buy chicken pickle",
    "add mango pickle 1 kg",
  ],
  view_cart: [
    "cart",
    "my cart",
    "view cart",
    "open cart",
  ],
  navigate_to_account: [
    "account",
    "my account",
    "login",
    "register",
    "sign up",
    "signup",
    "create account",
    "my orders",
  ],
  sign_up: [
    "sign up",
    "signup",
    "sign-up",
    "create account",
    "register",
    "new account",
  ],
  sign_in: [
    "log in",
    "login",
    "sign in",
    "signin",
  ],
  navigate_to_settings: [
    "settings",
    "account settings",
    "manage account",
    "go to settings",
  ],
  change_password: [
    "change password",
    "update password",
    "reset password",
  ],
  contact_support: [
    "contact",
    "help",
    "support",
    "whatsapp",
    "message support",
  ],
  track_order: [
    "track order",
    "track my order",
    "order status",
    "where is my order",
  ],
  checkout_and_payment: [
    "checkout",
    "continue to checkout",
    "start payment",
    "place order",
  ],
  review_cart_and_checkout: [
    "cart",
    "review cart",
    "go to checkout",
    "proceed to checkout",
    "checkout",
    "pay now",
  ],
  complete_payment: [
    "payment",
    "pay",
    "upi",
    "complete payment",
    "send payment proof",
  ],
};

const workflowMap = (manifest.workflows || []).map((workflow) => {
  const templateSet = new Set();
  const hints = workflow.intent_hints || [];
  const templates = workflowTemplates[workflow.workflow_id] || [];

  for (const hint of hints) {
    templateSet.add(normalize(hint));
    templateSet.add(hint);
  }

  for (const template of templates) {
    templateSet.add(template);
    templateSet.add(normalize(template));
  }

  return {
    workflow_id: workflow.workflow_id,
    name: workflow.name,
    intent_hints: dedupe(hints),
    examples: dedupe([...templateSet]),
  };
});

const dictionary = {
  site_id: manifest.site_id,
  site_name: manifest.site_name,
  homepage_url: manifest.homepage_url,
  matching_mode: "dictionary-first",
  global_terms: dedupe([
    "ask",
    "help",
    "search",
    "pickles",
    "combo",
    "account",
    "change password",
    "contact",
    "support",
    "whatsapp",
    "cart",
    "checkout",
    "track",
    "payment",
    "upi",
  ]),
  workflows: workflowMap,
};

fs.writeFileSync(outputPath, `${JSON.stringify(dictionary, null, 2)}\n`);
