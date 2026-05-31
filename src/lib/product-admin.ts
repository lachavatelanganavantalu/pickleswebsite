import { PickleProduct, ProductCategory, WeightOption } from "@/types/product";
import { resolveProductImagePath } from "@/lib/catalog-media";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createProductId(slug: string): string {
  return slug || `product-${Date.now()}`;
}

export function createEmptyProduct(category: ProductCategory = "veg"): PickleProduct {
  const ts = Date.now();
  return {
    id: `new-${ts}`,
    slug: "",
    name: "",
    nameTelugu: "",
    subtitle: "",
    description: "",
    category,
    spiceLevel: 3,
    tag: null,
    available: true,
    featured: false,
    displayOrder: 99,
    imagePath: "",
    weightOptions: [{ id: "250g", label: "250g", priceINR: 0 }],
  };
}

export function normalizeProduct(raw: PickleProduct): PickleProduct {
  const slug = slugify(raw.slug || raw.name) || `item-${Date.now()}`;
  const id =
    raw.id.startsWith("new-") || !raw.id ? createProductId(slug) : raw.id;

  const weightOptions: WeightOption[] = (raw.weightOptions || [])
    .filter((w) => w.label?.trim())
    .map((w) => {
      const label = w.label.trim();
      const wid = w.id?.trim() || slugify(label) || label;
      return {
        id: wid,
        label,
        priceINR: Math.max(0, Number(w.priceINR) || 0),
        ...(w.originalPriceINR && w.originalPriceINR > w.priceINR
          ? { originalPriceINR: Math.max(0, Number(w.originalPriceINR)) }
          : {}),
      };
    });

  if (weightOptions.length === 0) {
    weightOptions.push({ id: "250g", label: "250g", priceINR: 0 });
  }

  const updatedAt = new Date().toISOString();
  const imageDataUrl = raw.imageDataUrl?.startsWith("data:image/")
    ? raw.imageDataUrl
    : undefined;

  const normalized: PickleProduct = {
    ...raw,
    id,
    slug,
    name: raw.name.trim(),
    nameTelugu: raw.nameTelugu?.trim() || undefined,
    subtitle: raw.subtitle.trim() || raw.nameTelugu?.trim() || raw.name.trim(),
    description: raw.description?.trim() ?? "",
    category: raw.category,
    spiceLevel: Math.min(5, Math.max(1, Number(raw.spiceLevel) || 3)),
    tag: raw.available && raw.tag === "out_of_stock" ? null : raw.tag,
    available: raw.available,
    featured: raw.featured,
    displayOrder: Number(raw.displayOrder) || 0,
    imageDataUrl,
    imagePath: "",
    weightOptions,
    updatedAt,
  };

  normalized.imagePath = resolveProductImagePath(normalized);

  return normalized;
}

export function validateProduct(
  product: PickleProduct,
  existing: PickleProduct[],
  editingId?: string
): string[] {
  const errors: string[] = [];
  if (!product.name.trim()) errors.push("Product name is required");
  if (!["veg", "non-veg", "combo"].includes(product.category)) {
    errors.push("Select Veg, Non-veg, or Combo");
  }
  if (product.description.length > 500) errors.push("Description must be under 500 characters");

  const slug = slugify(product.slug || product.name);
  if (!slug) errors.push("URL slug is required");
  else {
    const clash = existing.find((p) => p.slug === slug && p.id !== editingId);
    if (clash) errors.push(`Slug "${slug}" is already used by ${clash.name}`);
  }

  if (!product.weightOptions.length) errors.push("Add at least one weight/price option");
  product.weightOptions.forEach((w, i) => {
    if (!w.label.trim()) errors.push(`Weight option ${i + 1}: label is required`);
    if (w.priceINR <= 0) errors.push(`Weight option ${i + 1}: price must be greater than 0`);
  });

  return errors;
}

export function duplicateProduct(source: PickleProduct, maxOrder: number): PickleProduct {
  const base = slugify(`${source.slug}-copy`);
  return normalizeProduct({
    ...source,
    id: `new-${Date.now()}`,
    slug: `${base}-${Date.now().toString(36).slice(-4)}`,
    name: `${source.name} (Copy)`,
    featured: false,
    displayOrder: maxOrder + 1,
  });
}
