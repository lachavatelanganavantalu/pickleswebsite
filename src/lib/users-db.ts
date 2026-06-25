import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/mongodb";
import { normalizePhone } from "@/lib/phone";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { CustomerUser, PublicCustomerUser } from "@/types/customer-user";

const COLLECTION = "customers";
const FILE_STORE = path.join(process.cwd(), "data", "customers-store.json");

let cache: CustomerUser[] | null = null;

async function readFile(): Promise<CustomerUser[]> {
  try {
    const raw = await fs.readFile(FILE_STORE, "utf-8");
    return JSON.parse(raw) as CustomerUser[];
  } catch {
    return [];
  }
}

async function writeFile(users: CustomerUser[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
  await fs.writeFile(FILE_STORE, JSON.stringify(users, null, 2), "utf-8");
  cache = users;
}

async function getAll(): Promise<CustomerUser[]> {
  if (cache) return cache;

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      cache = (await db.collection(COLLECTION).find({}).toArray()) as unknown as CustomerUser[];
      return cache;
    } catch (err) {
      console.error("MongoDB customers fetch failed:", err);
    }
  }

  cache = await readFile();
  return cache;
}

async function persist(users: CustomerUser[]): Promise<void> {
  cache = users;
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      await col.deleteMany({});
      if (users.length) await col.insertMany(users);
      return;
    } catch (err) {
      console.error("MongoDB customers save failed:", err);
    }
  }
  await writeFile(users);
}

export async function findUserByPhone(phone: string): Promise<CustomerUser | null> {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const users = await getAll();
  return users.find((u) => u.phone === normalized) ?? null;
}

export async function findUserById(id: string): Promise<CustomerUser | null> {
  const users = await getAll();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(phone: string, password: string): Promise<PublicCustomerUser> {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new Error("Invalid phone number");

  const users = await getAll();
  if (users.some((u) => u.phone === normalized)) {
    throw new Error("This mobile number is already registered");
  }

  const now = new Date().toISOString();
  const user: CustomerUser = {
    id: randomUUID(),
    phone: normalized,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  await persist(users);
  return { id: user.id, phone: user.phone, createdAt: user.createdAt };
}

export async function verifyUserLogin(
  phone: string,
  password: string
): Promise<PublicCustomerUser | null> {
  const user = await findUserByPhone(phone);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, phone: user.phone, createdAt: user.createdAt };
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const users = await getAll();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return false;

  if (!verifyPassword(currentPassword, users[idx].passwordHash)) return false;

  users[idx] = {
    ...users[idx],
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  };
  await persist(users);
  return true;
}

export function invalidateUsersCache(): void {
  cache = null;
}

export async function listAllUsers(): Promise<PublicCustomerUser[]> {
  const users = await getAll();
  return users
    .map((u) => ({ id: u.id, phone: u.phone, createdAt: u.createdAt }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
