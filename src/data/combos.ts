export interface ComboPack {
  id: string;
  name: string;
  nameTelugu?: string;
  description: string;
  descriptionTelugu?: string;
  items: string;
  itemsTelugu?: string;
  priceINR: number;
  originalPriceINR: number;
  available?: boolean;
  imagePath?: string;
  /** Stored in MongoDB — served via /api/media/combo/[id] */
  imageDataUrl?: string;
  updatedAt?: string;
}

export const COMBO_PACK_IMAGE = "/combopack.png";

/** Official combo from client menu (WhatsApp / page). */
export const comboPacks: ComboPack[] = [
  {
    id: "five-pickles-combo-999",
    name: "5 Pickles Combo",
    nameTelugu: "⭐ 5 పికిల్స్ కాంబో",
    description:
      "Chicken, Chinthankaya, Mango, Usirikaya & Lemon — 250g each. Flat ₹999.",
    descriptionTelugu:
      "చికెన్, చింతకాయ, మామిడికాయ, ఉసిరికాయ, నిమ్మకాయ — ప్రతి 250g. ఒకే ధర ₹999.",
    items:
      "Chicken 250g · Chinthankaya 250g · Mango 250g · Usirikaya 250g · Lemon 250g",
    itemsTelugu:
      "చికెన్ 250g · చింతకాయ 250g · మామిడికాయ 250g · ఉసిరికాయ 250g · నిమ్మకాయ 250g",
    priceINR: 999,
    originalPriceINR: 999,
    available: true,
    imagePath: COMBO_PACK_IMAGE,
  },
];
