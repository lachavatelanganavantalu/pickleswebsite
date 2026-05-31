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

const COLLECTION = "products";
const FILE_STORE = path.join(process.cwd(), "data", "products-store.json");

let memoryCache: PickleProduct[] | null = null;

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
  memoryCache = products;
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
  if (products.length !== defaultProducts.length) return true;
  if (products.some((p) => LEGACY_PRODUCT_IDS.has(p.id) || !CANONICAL_PRODUCT_IDS.has(p.id))) {
    return true;
  }
  return products.some((p) => {
    const def = defaultProducts.find((d) => d.id === p.id);
    if (!def) return true;
    return def.weightOptions.some(
      (w, i) => w.priceINR !== p.weightOptions[i]?.priceINR || w.label !== p.weightOptions[i]?.label
    );
  });
}

function mergeWithMenuSource(stored: PickleProduct[]): PickleProduct[] {
  const kept = stored.filter((p) => CANONICAL_PRODUCT_IDS.has(p.id));
  return stampDefaults().map((def) => {
    const existing = kept.find((p) => p.id === def.id);
    if (!existing) return def;
    return {
      ...def,
      available: existing.available,
      imagePath: existing.imagePath?.trim() || def.imagePath,
      displayOrder: existing.displayOrder ?? def.displayOrder,
    };
  });
}

async function persistProducts(products: PickleProduct[]): Promise<void> {
  memoryCache = products;
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      await col.deleteMany({});
      if (products.length) await col.insertMany(products);
      return;
    } catch (err) {
      console.error("MongoDB products save failed, using file store:", err);
    }
  }
  await writeFileStore(products);
}

export async function getAllProducts(): Promise<PickleProduct[]> {
  if (memoryCache?.length) return memoryCache;

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      let products = (await col
        .find({})
        .sort({ displayOrder: 1 })
        .toArray()) as unknown as PickleProduct[];
      if (products.length === 0) {
        products = stampDefaults();
        await persistProducts(products);
        return products;
      }
      if (needsProductsReseed(products)) {
        products = mergeWithMenuSource(products);
        await persistProducts(products);
        return products;
      }
      memoryCache = applyDefaultImages(products);
      return memoryCache;
    } catch (err) {
      console.error("MongoDB products fetch failed, using file store:", err);
    }
  }

  let products = await readFileStore();
  if (products.length === 0) {
    products = stampDefaults();
    await writeFileStore(products);
    memoryCache = products;
    return products;
  }
  if (needsProductsReseed(products)) {
    products = mergeWithMenuSource(products);
    await writeFileStore(products);
  } else {
    products = applyDefaultImages(products);
  }
  memoryCache = products;
  return products;
}

export async function saveAllProducts(products: PickleProduct[]): Promise<void> {
  const withTs = products.map((p) => ({
    ...p,
    updatedAt: new Date().toISOString(),
  }));
  await persistProducts(withTs);
}

export async function upsertProduct(product: PickleProduct): Promise<PickleProduct> {
  const products = await getAllProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  const updated = { ...product, updatedAt: new Date().toISOString() };
  if (idx >= 0) products[idx] = updated;
  else products.push(updated);
  await saveAllProducts(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getAllProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  await saveAllProducts(filtered);
  return true;
}

export function invalidateProductsCache(): void {
  memoryCache = null;
}
