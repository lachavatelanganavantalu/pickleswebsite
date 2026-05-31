import { promises as fs } from "fs";
import path from "path";
import { getDb } from "@/lib/mongodb";
import { comboPacks as defaultCombos } from "@/data/combos";
import type { ComboPack } from "@/data/combos";

const COLLECTION = "combos";
const FILE_STORE = path.join(process.cwd(), "data", "combos-store.json");

const LEGACY_COMBO_IDS = new Set([
  "telangana-starter",
  "nonveg-lovers",
  "festival-box",
  "spice-warrior",
]);

let cache: ComboPack[] | null = null;

async function readFile(): Promise<ComboPack[]> {
  try {
    const raw = await fs.readFile(FILE_STORE, "utf-8");
    return JSON.parse(raw) as ComboPack[];
  } catch {
    return [];
  }
}

async function writeFile(combos: ComboPack[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
  await fs.writeFile(FILE_STORE, JSON.stringify(combos, null, 2), "utf-8");
  cache = combos;
}

function needsCombosReseed(combos: ComboPack[]): boolean {
  if (combos.length === 0) return false;
  if (combos.some((c) => LEGACY_COMBO_IDS.has(c.id))) return true;
  const defaultIds = new Set(defaultCombos.map((c) => c.id));
  if (combos.length !== defaultCombos.length) return true;
  return !combos.every((c) => defaultIds.has(c.id));
}

function stampDefaults(): ComboPack[] {
  return defaultCombos.map((c) => ({ ...c, updatedAt: new Date().toISOString() }));
}

function withDefaultImages(combos: ComboPack[]): ComboPack[] {
  return combos.map((c) => {
    const def = defaultCombos.find((d) => d.id === c.id);
    const imagePath = c.imagePath?.trim() || def?.imagePath?.trim();
    return imagePath && imagePath !== c.imagePath ? { ...c, imagePath } : c;
  });
}

async function persistCombos(combos: ComboPack[]): Promise<void> {
  cache = combos;
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      await col.deleteMany({});
      if (combos.length) await col.insertMany(combos);
      return;
    } catch (err) {
      console.error("MongoDB combos save failed:", err);
    }
  }
  await writeFile(combos);
}

export async function getAllCombos(): Promise<ComboPack[]> {
  if (cache?.length) return withDefaultImages(cache);

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      let combos = (await db.collection(COLLECTION).find({}).toArray()) as unknown as ComboPack[];
      if (combos.length === 0) {
        combos = stampDefaults();
        await persistCombos(combos);
        return combos;
      }
      if (needsCombosReseed(combos)) {
        combos = stampDefaults();
        await persistCombos(combos);
        return combos;
      }
      cache = withDefaultImages(combos);
      return cache;
    } catch (err) {
      console.error("MongoDB combos fetch failed:", err);
    }
  }

  let combos = await readFile();
  if (combos.length === 0) {
    combos = stampDefaults();
    await writeFile(combos);
    cache = combos;
    return combos;
  }
  if (needsCombosReseed(combos)) {
    combos = stampDefaults();
    await writeFile(combos);
  }
  cache = withDefaultImages(combos);
  return cache;
}

export async function saveAllCombos(combos: ComboPack[]): Promise<void> {
  await persistCombos(combos);
}

export function invalidateCombosCache(): void {
  cache = null;
}
