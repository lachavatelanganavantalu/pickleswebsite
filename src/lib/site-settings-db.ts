import { promises as fs } from "fs";
import path from "path";
import { getDb } from "@/lib/mongodb";
import { defaultSiteSettings } from "@/data/default-site-settings";
import { SiteSettings } from "@/types/site-settings";
import { hasMongoDb, isVercelRuntime } from "./storage-env";

const COLLECTION = "site_settings";
const DOC_ID = "main";
const FILE_STORE = path.join(process.cwd(), "data", "site-settings.json");

let cache: SiteSettings | null = null;

const LEGACY_CONTACT_PHONES = ["9949525111", "919949525111"];

function patchLegacyContact(settings: SiteSettings): SiteSettings {
  const digits = settings.contact.phone.replace(/\D/g, "");
  const wa = settings.contact.whatsapp.replace(/\D/g, "");
  const isLegacy =
    LEGACY_CONTACT_PHONES.some((n) => digits.includes(n) || wa.includes(n.replace(/^91/, "")));
  if (!isLegacy) return settings;
  return {
    ...settings,
    contact: { ...settings.contact, ...defaultSiteSettings.contact },
  };
}

function patchLegacyMarketing(settings: SiteSettings): SiteSettings {
  const blob = JSON.stringify(settings).toLowerCase();
  const stale =
    blob.includes("gongura") ||
    blob.includes("avakaya") ||
    blob.includes("royyala") ||
    blob.includes("free delivery") ||
    blob.includes("ammamma") ||
    blob.includes("fssai");
  if (!stale) return settings;
  return {
    ...settings,
    hero: defaultSiteSettings.hero,
    story: defaultSiteSettings.story,
    announcement: defaultSiteSettings.announcement,
    contact: { ...settings.contact, ...defaultSiteSettings.contact },
  };
}

function patchSiteSettings(raw: Partial<SiteSettings>): SiteSettings {
  const settings: SiteSettings = {
    hero: { ...defaultSiteSettings.hero, ...raw.hero },
    story: { ...defaultSiteSettings.story, ...raw.story },
    contact: {
      ...defaultSiteSettings.contact,
      ...raw.contact,
      address: {
        ...defaultSiteSettings.contact.address,
        ...raw.contact?.address,
      },
    },
    social: { ...defaultSiteSettings.social, ...raw.social },
    announcement: raw.announcement ?? defaultSiteSettings.announcement,
    payment: { ...defaultSiteSettings.payment, ...raw.payment },
    updatedAt: raw.updatedAt,
  };
  return patchLegacyMarketing(patchLegacyContact(settings));
}

async function readFile(): Promise<SiteSettings | null> {
  try {
    const raw = await fs.readFile(FILE_STORE, "utf-8");
    return JSON.parse(raw) as SiteSettings;
  } catch {
    return null;
  }
}

async function writeFile(settings: SiteSettings): Promise<void> {
  await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
  await fs.writeFile(FILE_STORE, JSON.stringify(settings, null, 2), "utf-8");
  cache = settings;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache) return cache;

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const doc = await db.collection(COLLECTION).findOne({ id: DOC_ID });
      if (doc) {
        const { id: _docId, _id: _mongoId, ...settings } = doc as unknown as {
          id: string;
          _id?: unknown;
        } & Partial<SiteSettings>;
        void _docId;
        void _mongoId;
        const patched = patchSiteSettings(settings);
        cache = patched;
        return cache;
      }
    } catch (err) {
      console.error("MongoDB site settings fetch failed:", err);
    }
  }

  const fromFile = await readFile();
  if (fromFile) {
    cache = patchSiteSettings(fromFile);
    if (!isVercelRuntime()) await writeFile(cache);
    return cache;
  }

  cache = { ...defaultSiteSettings, updatedAt: new Date().toISOString() };
  if (hasMongoDb()) {
    return saveSiteSettings(cache);
  }
  if (!isVercelRuntime()) {
    await writeFile(cache);
  }
  return cache;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const next: SiteSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  cache = next;

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      await db
        .collection(COLLECTION)
        .updateOne({ id: DOC_ID }, { $set: { id: DOC_ID, ...next } }, { upsert: true });
      return next;
    } catch (err) {
      console.error("MongoDB site settings save failed:", err);
      if (isVercelRuntime()) throw err;
    }
  }

  if (!isVercelRuntime()) {
    await writeFile(next);
  }
  return next;
}

export function invalidateSiteSettingsCache(): void {
  cache = null;
}
