export type ProductCategory = "veg" | "non-veg" | "combo";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  veg: "Veg",
  "non-veg": "Non-veg",
  combo: "Combo",
};

export type ProductTag =
  | "bestseller"
  | "new"
  | "spicy"
  | "seasonal"
  | "premium"
  | "limited"
  | "healthy"
  | "out_of_stock"
  | null;

export interface WeightOption {
  id: string;
  label: string;
  priceINR: number;
  originalPriceINR?: number;
}

export interface PickleProduct {
  id: string;
  slug: string;
  name: string;
  nameTelugu?: string;
  subtitle: string;
  subtitleTelugu?: string;
  description: string;
  descriptionTelugu?: string;
  category: ProductCategory;
  spiceLevel: number;
  tag: ProductTag;
  available: boolean;
  featured: boolean;
  displayOrder: number;
  imagePath: string;
  /** Stored in MongoDB — served via /api/media/product/[id] */
  imageDataUrl?: string;
  weightOptions: WeightOption[];
  updatedAt?: string;
}

export const TAG_LABELS: Record<NonNullable<ProductTag>, { label: string; className: string }> = {
  bestseller: { label: "Bestseller", className: "bg-amber-500 text-white" },
  new: { label: "New", className: "bg-emerald-600 text-white" },
  spicy: { label: "Extra spicy", className: "bg-red-700 text-white" },
  seasonal: { label: "Seasonal", className: "bg-orange-500 text-white" },
  premium: { label: "Premium", className: "bg-ink text-white" },
  limited: { label: "Limited", className: "bg-amber-600 text-white" },
  healthy: { label: "Healthy pick", className: "bg-lime-600 text-white" },
  out_of_stock: { label: "Out of stock", className: "bg-gray-500 text-white" },
};

export function spiceDisplay(level: number): string {
  return "🌶️".repeat(Math.min(5, Math.max(1, level)));
}
