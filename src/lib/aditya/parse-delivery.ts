import type { CheckoutDeliveryDraft } from "@/lib/checkout-draft";

const INDIAN_STATES = [
  "telangana",
  "andhra pradesh",
  "karnataka",
  "maharashtra",
  "tamil nadu",
  "kerala",
  "delhi",
  "uttar pradesh",
  "gujarat",
  "rajasthan",
  "punjab",
  "west bengal",
  "odisha",
  "bihar",
  "madhya pradesh",
];

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function looksLikeName(part: string): boolean {
  return /^[a-zA-Z][a-zA-Z\s.'-]{1,}$/.test(part) && !part.includes("@");
}

export function parseDeliverySection(section: string): CheckoutDeliveryDraft | null {
  const parts = section
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  const draft: CheckoutDeliveryDraft = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  };

  const addressParts: string[] = [];

  for (const part of parts) {
    const emailMatch = part.match(/[\w.+-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      draft.email = emailMatch[0];
      continue;
    }

    const digits = part.replace(/\D/g, "");
    if (/^\d{10}$/.test(digits) && !draft.phone) {
      draft.phone = digits;
      continue;
    }

    const indiaPin = part.match(/india[-\s]*(\d{6})/i);
    if (indiaPin) {
      draft.country = "India";
      draft.zip = indiaPin[1];
      continue;
    }

    if (/^\d{6}$/.test(part)) {
      draft.zip = part;
      continue;
    }

    const lower = part.toLowerCase();
    if (lower === "india") {
      draft.country = "India";
      continue;
    }

    if (INDIAN_STATES.includes(lower)) {
      draft.state = titleCase(part);
      continue;
    }

    if (!draft.name && looksLikeName(part)) {
      draft.name = titleCase(part);
      continue;
    }

    addressParts.push(part);
  }

  if (addressParts.length >= 2) {
    draft.city = titleCase(addressParts.pop()!);
  }

  draft.address = addressParts.join(", ");

  if (
    !draft.name &&
    !draft.phone &&
    !draft.email &&
    !draft.address &&
    !draft.city &&
    !draft.state &&
    !draft.zip
  ) {
    return null;
  }

  return draft;
}

export function splitProductsAndDelivery(rawIntent: string): {
  productSection: string;
  deliverySection: string;
} {
  const forMatch = rawIntent.match(/\s+for\s+/i);
  if (!forMatch || forMatch.index === undefined) {
    return { productSection: rawIntent.trim(), deliverySection: "" };
  }

  return {
    productSection: rawIntent.slice(0, forMatch.index).trim(),
    deliverySection: rawIntent.slice(forMatch.index + forMatch[0].length).trim(),
  };
}
