import { promises as fs } from "fs";
import path from "path";
import { getDb } from "./mongodb";
import { normalizePhone } from "./phone";
import { nextDailySequenceFromFile } from "./order-counter-file";

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

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const col = db.collection(COLLECTION);
      await col.deleteMany({});
      if (orders.length) await col.insertMany(orders);
      return;
    } catch (err) {
      console.error("MongoDB orders save failed, using file store:", err);
    }
  }

  await writeFileOrders(orders);
}

export async function getNextDailyOrderSequence(dateKey: string): Promise<number> {
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const result = await db.collection(COUNTERS).findOneAndUpdate(
        { dateKey },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      if (result && typeof result.seq === "number") return result.seq;
    } catch (err) {
      console.error("MongoDB order counter failed, using file store:", err);
    }
  }
  return nextDailySequenceFromFile(dateKey);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.orderId === orderId) ?? null;
}

export async function getOrderByDisplayId(displayOrderId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.displayOrderId === displayOrderId) ?? null;
}

export async function getOrderByRazorpayId(orderId: string): Promise<Order | null> {
  return getOrderById(orderId);
}

export async function saveOrderToDb(
  orderId: string,
  displayOrderId: string,
  items: OrderItem[],
  totalINR: number,
  customer: OrderCustomer,
  userId?: string
): Promise<void> {
  const orders = await getOrders();
  orders.unshift({
    orderId,
    displayOrderId,
    userId,
    paymentStatus: "pending",
    amountINR: totalINR,
    items,
    customer,
    createdAt: new Date().toISOString(),
  });
  await persistOrders(orders);
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
  const orders = await getOrders();
  orders.unshift(order);
  await persistOrders(orders);
  return order;
}

export async function markOrderPaid(orderId: string, paymentId?: string): Promise<void> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    orders[idx] = {
      ...orders[idx],
      paymentStatus: "paid",
      paymentId: paymentId || "manual",
      paymentConfirmedAt: new Date().toISOString(),
    };
    await persistOrders(orders);
    return;
  }

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      await db.collection(COLLECTION).updateOne(
        { orderId },
        {
          $set: {
            paymentStatus: "paid",
            paymentId: paymentId || "manual",
            paymentConfirmedAt: new Date(),
          },
        }
      );
    } catch (err) {
      console.error("markOrderPaid MongoDB:", err);
    }
  }
}

export async function getAllOrders(): Promise<Order[]> {
  return getOrders();
}

export async function markDtdcSent(orderId: string): Promise<void> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], dtdcSentAt: new Date().toISOString() };
    await persistOrders(orders);
    return;
  }

  if (process.env.MONGODB_URI) {
    const db = await getDb();
    await db.collection(COLLECTION).updateOne(
      { orderId },
      { $set: { dtdcSentAt: new Date() } }
    );
  }
}

export async function markCustomerDispatchNotified(orderId: string): Promise<void> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    orders[idx] = {
      ...orders[idx],
      customerDispatchNotifiedAt: new Date().toISOString(),
    };
    await persistOrders(orders);
    return;
  }

  if (process.env.MONGODB_URI) {
    const db = await getDb();
    await db.collection(COLLECTION).updateOne(
      { orderId },
      { $set: { customerDispatchNotifiedAt: new Date() } }
    );
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
