import { promises as fs } from "fs";
import path from "path";
import { getDb } from "@/lib/mongodb";
import {
  CANONICAL_PRODUCT_IDS,
  defaultProducts,
  LEGACY_PRODUCT_IDS,
} from "@/data/default-products";
import { PickleProduct } from "@/types/product";
import { applyDefaultImages } from "@/lib/product-images";
import { resolveProductImagePath } from "@/lib/catalog-media";
import { toPlainDocuments } from "@/lib/serialize-doc";

const COLLECTION = "products";
const FILE_STORE = path.join(process.cwd(), "data", "products-store.json");

let memoryCache: PickleProduct[] | null = null;

function resolveStoredMedia(products: PickleProduct[]): PickleProduct[] {
  return products.map((p) =>
    p.imageDataUrl?.startsWith("data:image/")
      ? { ...p, imagePath: resolveProductImagePath(p) }
      : p
  );
}

async function readFileStore(): Promise<PickleProduct[]> {
  try {
    const raw = await fs.readFile(FILE_STORE, "utf-8");
    return JSON.parse(raw) as PickleProduct[];
  } catch {
    return [];
  }
}

async function writeFileStore(products: PickleProduct[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
  await fs.writeFile(FILE_STORE, JSON.stringify(products, null, 2), "utf-8");
  memoryCache = finalizeProducts(products);
}

function stampDefaults(): PickleProduct[] {
  return applyDefaultImages(
    defaultProducts.map((p) => ({
      ...p,
      updatedAt: new Date().toISOString(),
    }))
  );
}

function needsProductsReseed(products: PickleProduct[]): boolean {
  if (products.length === 0) return false;
  if (products.some((p) => LEGACY_PRODUCT_IDS.has(p.id))) return true;

  return defaultProducts.some((def) => {
    const stored = products.find((p) => p.id === def.id);
    if (!stored) return true;
    if ((stored.imagePath?.trim() || "") !== (def.imagePath?.trim() || "")) return true;
    return def.weightOptions.some(
      (w, i) =>
        w.priceINR !== stored.weightOptions[i]?.priceINR ||
        w.label !== stored.weightOptions[i]?.label
    );
  });
}

function dedupeProductsById(products: PickleProduct[]): PickleProduct[] {
  const byId = new Map<string, PickleProduct>();

  for (const product of products) {
    const existing = byId.get(product.id);
    if (!existing) {
      byId.set(product.id, product);
      continue;
    }

    const existingTime = Date.parse(existing.updatedAt ?? "") || 0;
    const nextTime = Date.parse(product.updatedAt ?? "") || 0;
    if (nextTime >= existingTime) {
      byId.set(product.id, product);
    }
  }

  return [...byId.values()].sort((a, b) => a.displayOrder - b.displayOrder);
}

function mergeWithMenuSource(stored: PickleProduct[]): PickleProduct[] {
  const uniqueStored = dedupeProductsById(stored);
  const custom = uniqueStored.filter((p) => !CANONICAL_PRODUCT_IDS.has(p.id));
  const merged = stampDefaults().map((def) => {
    const existing = stored.find((p) => p.id === def.id);
    if (!existing) return def;
    return {
      ...def,
      available: existing.available,
      imagePath: def.imagePath?.trim() || existing.imagePath?.trim() || "",
      imageDataUrl: existing.imageDataUrl,
      displayOrder: existing.displayOrder ?? def.displayOrder,
    };
  });
  return [...merged, ...custom].sort((a, b) => a.displayOrder - b.displayOrder);
}

function finalizeProducts(products: PickleProduct[]): PickleProduct[] {
  return resolveStoredMedia(applyDefaultImages(toPlainDocuments(products)));
}

async function persistProducts(products: PickleProduct[]): Promise<void> {
  memoryCache = finalizeProducts(dedupeProductsById(products));
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      await col.deleteMany({});
      if (memoryCache.length) await col.insertMany(memoryCache);
      return;
    } catch (err) {
      console.error("MongoDB products save failed, using file store:", err);
    }
  }
  await writeFileStore(memoryCache);
}

export async function getAllProducts(): Promise<PickleProduct[]> {
  if (memoryCache?.length) return finalizeProducts(memoryCache);

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      let products = toPlainDocuments(
        (await col
          .find({})
          .sort({ displayOrder: 1 })
          .toArray()) as unknown as PickleProduct[]
      );
      const hadDuplicates = products.length !== dedupeProductsById(products).length;
      products = dedupeProductsById(products);
      if (products.length === 0) {
        products = stampDefaults();
        await persistProducts(products);
        return memoryCache!;
      }
      if (hadDuplicates || needsProductsReseed(products)) {
        products = mergeWithMenuSource(products);
        await persistProducts(products);
        return memoryCache!;
      }
      memoryCache = finalizeProducts(products);
      return memoryCache;
    } catch (err) {
      console.error("MongoDB products fetch failed, using file store:", err);
    }
  }

  const raw = await readFileStore();
  const hadDuplicates = raw.length !== dedupeProductsById(raw).length;
  let products = dedupeProductsById(raw);
  if (products.length === 0) {
    products = stampDefaults();
    await writeFileStore(products);
    memoryCache = finalizeProducts(products);
    return memoryCache;
  }
  if (hadDuplicates || needsProductsReseed(products)) {
    products = mergeWithMenuSource(products);
    await writeFileStore(products);
  } else {
    products = applyDefaultImages(products);
  }
  memoryCache = finalizeProducts(products);
  return memoryCache;
}

export async function saveAllProducts(products: PickleProduct[]): Promise<void> {
  invalidateProductsCache();
  const withTs = products.map((p) => ({
    ...p,
    updatedAt: new Date().toISOString(),
  }));
  await persistProducts(withTs);
}

export async function upsertProduct(product: PickleProduct): Promise<PickleProduct> {
  invalidateProductsCache();
  const products = await getAllProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  const updated = { ...product, updatedAt: new Date().toISOString() };
  if (idx >= 0) products[idx] = updated;
  else products.push(updated);
  await saveAllProducts(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  invalidateProductsCache();
  const products = await getAllProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  await saveAllProducts(filtered);
  return true;
}

export async function getProductById(id: string): Promise<PickleProduct | null> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id) ?? null;
}

export function invalidateProductsCache(): void {
  memoryCache = null;
}
