import type { PickleProduct } from "@/types/product";
import type { ComboPack } from "@/data/combos";
import { parseDataUrlImage } from "@/lib/payment-qr";

export const MAX_CATALOG_IMAGE_BYTES = 2_500_000;

export function productMediaPath(id: string, updatedAt?: string): string {
  const v = updatedAt ? encodeURIComponent(updatedAt) : String(Date.now());
  return `/api/media/product/${encodeURIComponent(id)}?v=${v}`;
}

export function comboMediaPath(id: string, updatedAt?: string): string {
  const v = updatedAt ? encodeURIComponent(updatedAt) : String(Date.now());
  return `/api/media/combo/${encodeURIComponent(id)}?v=${v}`;
}

export function resolveProductImagePath(product: PickleProduct): string {
  if (product.imageDataUrl?.startsWith("data:image/")) {
    return productMediaPath(product.id, product.updatedAt);
  }
  return product.imagePath?.trim() || "";
}

export function resolveComboImagePath(combo: ComboPack): string {
  if (combo.imageDataUrl?.startsWith("data:image/")) {
    return comboMediaPath(combo.id, combo.updatedAt);
  }
  return combo.imagePath?.trim() || "";
}

export function stripProductForPublic(product: PickleProduct): PickleProduct {
  const { imageDataUrl: _removed, ...rest } = product;
  void _removed;
  return rest;
}

export function stripComboForPublic(combo: ComboPack): ComboPack {
  const { imageDataUrl: _removed, ...rest } = combo;
  void _removed;
  return rest;
}

export function validateCatalogImageDataUrl(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:image/")) return "Invalid image file";
  if (dataUrl.length > MAX_CATALOG_IMAGE_BYTES) {
    return "Image too large — use a smaller JPG or PNG (under 2 MB)";
  }
  if (!parseDataUrlImage(dataUrl)) return "Invalid image file";
  return null;
}
