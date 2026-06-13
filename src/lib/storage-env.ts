export function hasMongoDb(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

/** In-memory DB cache is per serverless instance — disable on Vercel to avoid stale catalog. */
export function useInMemoryDbCache(): boolean {
  return !isVercelRuntime();
}

export function requirePersistentStorage(action: string): void {
  if (isVercelRuntime() && !hasMongoDb()) {
    throw new Error(
      `${action} requires MONGODB_URI on Vercel. Add MongoDB Atlas in Vercel → Settings → Environment Variables, then redeploy.`
    );
  }
}
