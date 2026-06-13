import { promises as fs } from "fs";
import path from "path";
import { getDb } from "./mongodb";
import { normalizePhone } from "./phone";
import { nextDailySequenceFromFile } from "./order-counter-file";
import { hasMongoDb, isVercelRuntime, requirePersistentStorage } from "./storage-env";

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  productName: string;
  variantLabel: string;
  quantity: number;
  priceINR: number;
}

export type PaymentStatus = "pending" | "paid";

export interface Order {
  orderId: string;
  displayOrderId: string;
  razorpayOrderId?: string;
  userId?: string;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  amountINR: number;
  items: OrderItem[];
  customer: OrderCustomer;
  createdAt: Date | string;
  paymentConfirmedAt?: Date | string;
  dtdcSentAt?: Date | string;
  customerDispatchNotifiedAt?: Date | string;
  adminNotes?: string;
}

const COLLECTION = "orders";
const COUNTERS = "order_counters";
const FILE_STORE = path.join(process.cwd(), "data", "orders-store.json");

let memoryOrders: Order[] | null = null;

function normalizeOrder(raw: Order & { _id?: unknown }): Order {
  void raw._id;
  const toIso = (v: Date | string | undefined) =>
    v instanceof Date ? v.toISOString() : v;

  return {
    ...raw,
    createdAt: toIso(raw.createdAt) ?? new Date().toISOString(),
    paymentConfirmedAt: toIso(raw.paymentConfirmedAt),
    dtdcSentAt: toIso(raw.dtdcSentAt),
    customerDispatchNotifiedAt: toIso(raw.customerDispatchNotifiedAt),
  };
}

async function readFileOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(FILE_STORE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeFileOrders(orders: Order[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
  await fs.writeFile(FILE_STORE, JSON.stringify(orders, null, 2), "utf-8");
  memoryOrders = orders;
}

async function getOrders(): Promise<Order[]> {
  if (memoryOrders) return memoryOrders;

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const docs = await db
        .collection(COLLECTION)
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      memoryOrders = docs as unknown as Order[];
      return memoryOrders;
    } catch (err) {
      console.error("MongoDB orders fetch failed, using file store:", err);
    }
  }

  memoryOrders = await readFileOrders();
  return memoryOrders;
}

async function persistOrders(orders: Order[]): Promise<void> {
  memoryOrders = orders;

  if (hasMongoDb()) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      await col.deleteMany({});
      if (orders.length) await col.insertMany(orders);
      return;
    } catch (err) {
      console.error("MongoDB orders save failed:", err);
      if (isVercelRuntime()) throw err;
    }
  }

  requirePersistentStorage("Saving orders");
  await writeFileOrders(orders);
}

async function insertOrder(order: Order): Promise<void> {
  if (hasMongoDb()) {
    const db = await getDb();
    await db.collection(COLLECTION).insertOne(order);
    invalidateOrdersCache();
    return;
  }

  requirePersistentStorage("Creating orders");
  const orders = await getOrders();
  orders.unshift(order);
  await writeFileOrders(orders);
}

async function patchOrderMongo(
  orderId: string,
  patch: Record<string, unknown>
): Promise<boolean> {
  if (!hasMongoDb()) return false;
  const db = await getDb();
  const result = await db.collection(COLLECTION).updateOne({ orderId }, { $set: patch });
  if (result.matchedCount > 0) {
    invalidateOrdersCache();
    return true;
  }
  return false;
}

export async function getNextDailyOrderSequence(dateKey: string): Promise<number> {
  if (hasMongoDb()) {
    const db = await getDb();
    const result = await db.collection(COUNTERS).findOneAndUpdate(
      { dateKey },
      { $inc: { seq: 1 }, $setOnInsert: { dateKey } },
      { upsert: true, returnDocument: "after" }
    );
    if (result && typeof result.seq === "number") return result.seq;
    throw new Error("Could not generate order number");
  }

  requirePersistentStorage("Generating order numbers");
  return nextDailySequenceFromFile(dateKey);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (hasMongoDb()) {
    try {
      const db = await getDb();
      const doc = await db.collection(COLLECTION).findOne({ orderId });
      if (!doc) return null;
      return normalizeOrder(doc as Order & { _id?: unknown });
    } catch (err) {
      console.error("MongoDB getOrderById failed:", err);
      if (isVercelRuntime()) throw err;
    }
  }

  const orders = await getOrders();
  return orders.find((o) => o.orderId === orderId) ?? null;
}

export async function getOrderByDisplayId(displayOrderId: string): Promise<Order | null> {
  if (hasMongoDb()) {
    try {
      const db = await getDb();
      const doc = await db.collection(COLLECTION).findOne({ displayOrderId });
      if (!doc) return null;
      return normalizeOrder(doc as Order & { _id?: unknown });
    } catch (err) {
      console.error("MongoDB getOrderByDisplayId failed:", err);
      if (isVercelRuntime()) throw err;
    }
  }

  const orders = await getOrders();
  return orders.find((o) => o.displayOrderId === displayOrderId) ?? null;
}

export async function getOrderByRazorpayId(razorpayOrderId: string): Promise<Order | null> {
  if (hasMongoDb()) {
    try {
      const db = await getDb();
      const doc = await db.collection(COLLECTION).findOne({
        $or: [{ orderId: razorpayOrderId }, { razorpayOrderId }],
      });
      if (!doc) return null;
      return normalizeOrder(doc as Order & { _id?: unknown });
    } catch (err) {
      console.error("MongoDB getOrderByRazorpayId failed:", err);
      if (isVercelRuntime()) throw err;
    }
  }

  const orders = await getOrders();
  return (
    orders.find(
      (o) => o.orderId === razorpayOrderId || o.razorpayOrderId === razorpayOrderId
    ) ?? null
  );
}

export async function setOrderRazorpayId(
  orderId: string,
  razorpayOrderId: string
): Promise<void> {
  const patch = { razorpayOrderId };
  if (await patchOrderMongo(orderId, patch)) return;

  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...patch };
    await persistOrders(orders);
  }
}

export async function saveOrderToDb(
  orderId: string,
  displayOrderId: string,
  items: OrderItem[],
  totalINR: number,
  customer: OrderCustomer,
  userId?: string
): Promise<void> {
  await insertOrder({
    orderId,
    displayOrderId,
    userId,
    paymentStatus: "pending",
    amountINR: totalINR,
    items,
    customer,
    createdAt: new Date().toISOString(),
  });
}

export async function createPaidOrder(
  orderId: string,
  displayOrderId: string,
  paymentId: string,
  items: OrderItem[],
  totalINR: number,
  customer: OrderCustomer,
  userId?: string
): Promise<Order> {
  const order: Order = {
    orderId,
    displayOrderId,
    userId,
    paymentId,
    paymentStatus: "paid",
    amountINR: totalINR,
    items,
    customer,
    createdAt: new Date().toISOString(),
    paymentConfirmedAt: new Date().toISOString(),
  };
  await insertOrder(order);
  return order;
}

export async function markOrderPaid(orderId: string, paymentId?: string): Promise<void> {
  const patch = {
    paymentStatus: "paid" as const,
    paymentId: paymentId || "manual",
    paymentConfirmedAt: new Date().toISOString(),
  };

  if (await patchOrderMongo(orderId, patch)) return;

  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...patch };
    await persistOrders(orders);
  }
}

export async function getAllOrders(): Promise<Order[]> {
  return getOrders();
}

export async function markDtdcSent(orderId: string): Promise<void> {
  const patch = { dtdcSentAt: new Date().toISOString() };
  if (await patchOrderMongo(orderId, patch)) return;

  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...patch };
    await persistOrders(orders);
  }
}

export async function markCustomerDispatchNotified(orderId: string): Promise<void> {
  const patch = { customerDispatchNotifiedAt: new Date().toISOString() };
  if (await patchOrderMongo(orderId, patch)) return;

  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...patch };
    await persistOrders(orders);
  }
}

export async function updateOrder(
  orderId: string,
  patch: Partial<Pick<Order, "paymentStatus" | "adminNotes">>
): Promise<Order | null> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], ...patch };
  await persistOrders(orders);
  return orders[idx];
}

export function invalidateOrdersCache(): void {
  memoryOrders = null;
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const orders = await getOrders();
  return orders
    .filter((o) => o.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function linkOrdersToUserByPhone(userId: string, phone: string): Promise<void> {
  const normalized = normalizePhone(phone);
  if (!normalized) return;

  const orders = await getOrders();
  let changed = false;
  for (const order of orders) {
    if (order.userId) continue;
    const orderPhone = normalizePhone(order.customer.phone);
    if (orderPhone === normalized) {
      order.userId = userId;
      changed = true;
    }
  }
  if (changed) await persistOrders(orders);
}
