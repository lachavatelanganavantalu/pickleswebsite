import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();

declare global {
  // eslint-disable-next-line no-var
  var __lachavaMongoClient: MongoClient | undefined;
}

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (!global.__lachavaMongoClient) {
    global.__lachavaMongoClient = new MongoClient(uri);
    await global.__lachavaMongoClient.connect();
  }

  return global.__lachavaMongoClient.db();
}
