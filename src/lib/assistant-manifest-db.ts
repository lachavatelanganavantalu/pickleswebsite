import { promises as fs } from "fs";
import path from "path";
import { getDb } from "@/lib/mongodb";
import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import { buildAssistantManifest } from "@/lib/assistant-manifest/build";
import type { AssistantManifestSnapshot } from "@/types/assistant-manifest";
import { hasMongoDb, isVercelRuntime } from "@/lib/storage-env";

function catalogSignature(snapshot: AssistantManifestSnapshot): string {
  return JSON.stringify({
    products: snapshot.catalog.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      available: product.available,
      purchasable: product.purchasable,
      tag: product.tag,
    })),
    combos: snapshot.catalog.combos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      available: combo.available,
      priceINR: combo.priceINR,
    })),
  });
}

export function assistantManifestHasPendingChanges(
  stored: AssistantManifestSnapshot | null,
  live: AssistantManifestSnapshot,
): boolean {
  if (!stored) return true;
  return catalogSignature(stored) !== catalogSignature(live);
}

const COLLECTION = "assistant_manifest";
const DOC_ID = "current";
const FILE_STORE = path.join(process.cwd(), "data", "assistant-manifest.json");

let cache: AssistantManifestSnapshot | null = null;

async function readFile(): Promise<AssistantManifestSnapshot | null> {
  try {
    const raw = await fs.readFile(FILE_STORE, "utf-8");
    return JSON.parse(raw) as AssistantManifestSnapshot;
  } catch {
    return null;
  }
}

async function writeFile(snapshot: AssistantManifestSnapshot): Promise<void> {
  await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
  await fs.writeFile(FILE_STORE, JSON.stringify(snapshot, null, 2), "utf-8");
}

async function readStoredSnapshot(): Promise<AssistantManifestSnapshot | null> {
  if (cache) return cache;

  if (hasMongoDb()) {
    try {
      const db = await getDb();
      const doc = await db.collection(COLLECTION).findOne({ id: DOC_ID });
      if (doc) {
        const { id: _idField, _id: _mongoId, ...snapshot } = doc as AssistantManifestSnapshot & {
          _id?: unknown;
        };
        void _idField;
        void _mongoId;
        cache = { id: DOC_ID, ...snapshot };
        return cache;
      }
    } catch (err) {
      console.error("assistant manifest MongoDB read failed:", err);
    }
  }

  const fromFile = await readFile();
  if (fromFile) {
    cache = fromFile;
    return cache;
  }

  return null;
}

export function invalidateAssistantManifestCache(): void {
  cache = null;
}

export async function getAssistantManifestSnapshot(): Promise<AssistantManifestSnapshot | null> {
  return readStoredSnapshot();
}

export async function buildLiveAssistantManifest(): Promise<AssistantManifestSnapshot> {
  const [products, combos] = await Promise.all([getAllProducts(), getAllCombos()]);
  return buildAssistantManifest(products, combos);
}

export async function getAssistantManifestForRuntime(): Promise<AssistantManifestSnapshot> {
  const stored = await readStoredSnapshot();
  if (stored) return stored;
  return buildLiveAssistantManifest();
}

export async function pushAssistantManifest(): Promise<AssistantManifestSnapshot> {
  const snapshot = await buildLiveAssistantManifest();
  cache = snapshot;

  if (hasMongoDb()) {
    try {
      const db = await getDb();
      await db
        .collection(COLLECTION)
        .updateOne({ id: DOC_ID }, { $set: { ...snapshot, id: DOC_ID } }, { upsert: true });
      return snapshot;
    } catch (err) {
      console.error("assistant manifest MongoDB save failed:", err);
      if (isVercelRuntime()) throw err;
    }
  }

  if (!isVercelRuntime()) {
    await writeFile(snapshot);
  }

  return snapshot;
}
