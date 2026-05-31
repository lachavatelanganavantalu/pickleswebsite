export function hasMongoDb(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

export function requirePersistentStorage(action: string): void {
  if (isVercelRuntime() && !hasMongoDb()) {
    throw new Error(
      `${action} requires MONGODB_URI on Vercel. Add MongoDB Atlas in Vercel → Settings → Environment Variables, then redeploy.`
    );
  }
}
