import { revalidatePath } from "next/cache";

/** Bust Next.js page cache after admin catalog edits. */
export function revalidateCatalog(productSlug?: string): void {
  for (const path of ["/", "/products", "/pricing", "/combos"]) {
    revalidatePath(path);
  }
  if (productSlug) {
    revalidatePath(`/products/${productSlug}`);
  }
}
