import type { Order } from "@/lib/orders-db";

const TZ = "Asia/Kolkata";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseOrderDate(order: Order): Date {
  return new Date(order.createdAt);
}

function istParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday");
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday.slice(0, 3)
  );

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: parseInt(get("hour"), 10) || 0,
    dayIndex: dayIndex >= 0 ? dayIndex : 0,
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: DAY_NAMES_FULL[dayIndex >= 0 ? dayIndex : 0] ?? weekday,
  };
}

function hourLabel(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export interface DayOfWeekStat {
  day: string;
  dayIndex: number;
  orders: number;
  paidOrders: number;
  revenueINR: number;
}

export interface HourStat {
  hour: number;
  label: string;
  orders: number;
  paidOrders: number;
}

export interface DailyStat {
  date: string;
  label: string;
  orders: number;
  paidOrders: number;
  revenueINR: number;
}

export interface ProductStat {
  name: string;
  quantity: number;
  revenueINR: number;
  orderCount: number;
}

export interface VariantStat {
  productName: string;
  variantLabel: string;
  quantity: number;
  revenueINR: number;
}

export interface LocationStat {
  city: string;
  state: string;
  orders: number;
  revenueINR: number;
}

export interface OrderAnalytics {
  generatedAt: string;
  summary: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    revenueINR: number;
    avgOrderValueINR: number;
    itemsSold: number;
    last7DaysOrders: number;
    last30DaysOrders: number;
    last7DaysRevenue: number;
    last30DaysRevenue: number;
    ordersGrowth7d: number | null;
  };
  byDayOfWeek: DayOfWeekStat[];
  byHour: HourStat[];
  dailyLast30: DailyStat[];
  topProducts: ProductStat[];
  topVariants: VariantStat[];
  topCities: LocationStat[];
  topStates: { state: string; orders: number; revenueINR: number }[];
  peak: {
    dayOfWeek: string;
    dayOrders: number;
    hour: number;
    hourLabel: string;
    hourOrders: number;
  };
  insights: string[];
}

export function computeOrderAnalytics(orders: Order[]): OrderAnalytics {
  const now = Date.now();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const ms14 = 14 * 24 * 60 * 60 * 1000;

  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const revenueINR = paid.reduce((s, o) => s + o.amountINR, 0);
  const itemsSold = paid.reduce(
    (s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0),
    0
  );

  const last7 = orders.filter((o) => now - parseOrderDate(o).getTime() <= ms7);
  const prev7 = orders.filter((o) => {
    const t = parseOrderDate(o).getTime();
    return t > now - ms14 && t <= now - ms7;
  });
  const last30 = orders.filter((o) => now - parseOrderDate(o).getTime() <= ms30);
  const paid7 = last7.filter((o) => o.paymentStatus === "paid");
  const paid30 = last30.filter((o) => o.paymentStatus === "paid");

  const ordersGrowth7d =
    prev7.length > 0
      ? Math.round(((last7.length - prev7.length) / prev7.length) * 100)
      : last7.length > 0
        ? 100
        : null;

  const byDayMap = new Map<number, DayOfWeekStat>();
  for (let i = 0; i < 7; i++) {
    byDayMap.set(i, {
      day: DAY_NAMES[i],
      dayIndex: i,
      orders: 0,
      paidOrders: 0,
      revenueINR: 0,
    });
  }

  const byHourMap = new Map<number, HourStat>();
  for (let h = 0; h < 24; h++) {
    byHourMap.set(h, { hour: h, label: hourLabel(h), orders: 0, paidOrders: 0 });
  }

  const dailyMap = new Map<string, DailyStat>();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now - d * 24 * 60 * 60 * 1000);
    const p = istParts(date);
    const label = `${p.day}/${p.month}`;
    dailyMap.set(p.dateKey, {
      date: p.dateKey,
      label,
      orders: 0,
      paidOrders: 0,
      revenueINR: 0,
    });
  }

  const productMap = new Map<string, ProductStat>();
  const variantMap = new Map<string, VariantStat>();
  const cityMap = new Map<string, LocationStat>();
  const stateMap = new Map<string, { state: string; orders: number; revenueINR: number }>();

  for (const order of orders) {
    const date = parseOrderDate(order);
    const p = istParts(date);
    const isPaid = order.paymentStatus === "paid";

    const dayStat = byDayMap.get(p.dayIndex)!;
    dayStat.orders += 1;
    if (isPaid) {
      dayStat.paidOrders += 1;
      dayStat.revenueINR += order.amountINR;
    }

    const hourStat = byHourMap.get(p.hour)!;
    hourStat.orders += 1;
    if (isPaid) hourStat.paidOrders += 1;

    const daily = dailyMap.get(p.dateKey);
    if (daily) {
      daily.orders += 1;
      if (isPaid) {
        daily.paidOrders += 1;
        daily.revenueINR += order.amountINR;
      }
    }

    if (isPaid) {
      const cityKey = `${order.customer.city}|${order.customer.state}`;
      const cityExisting = cityMap.get(cityKey) ?? {
        city: order.customer.city || "Unknown",
        state: order.customer.state || "",
        orders: 0,
        revenueINR: 0,
      };
      cityExisting.orders += 1;
      cityExisting.revenueINR += order.amountINR;
      cityMap.set(cityKey, cityExisting);

      const stateName = order.customer.state || "Unknown";
      const stateExisting = stateMap.get(stateName) ?? {
        state: stateName,
        orders: 0,
        revenueINR: 0,
      };
      stateExisting.orders += 1;
      stateExisting.revenueINR += order.amountINR;
      stateMap.set(stateName, stateExisting);

      for (const item of order.items) {
        const prod = productMap.get(item.productName) ?? {
          name: item.productName,
          quantity: 0,
          revenueINR: 0,
          orderCount: 0,
        };
        prod.quantity += item.quantity;
        prod.revenueINR += item.priceINR * item.quantity;
        prod.orderCount += 1;
        productMap.set(item.productName, prod);

        const vKey = `${item.productName}::${item.variantLabel}`;
        const vari = variantMap.get(vKey) ?? {
          productName: item.productName,
          variantLabel: item.variantLabel,
          quantity: 0,
          revenueINR: 0,
        };
        vari.quantity += item.quantity;
        vari.revenueINR += item.priceINR * item.quantity;
        variantMap.set(vKey, vari);
      }
    }
  }

  const byDayOfWeek = Array.from(byDayMap.values()).sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.dayIndex) - order.indexOf(b.dayIndex);
  });

  const byHour = Array.from(byHourMap.values());
  const dailyLast30 = Array.from(dailyMap.values());

  const topProducts = [...productMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topVariants = [...variantMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topCities = [...cityMap.values()]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  const topStates = [...stateMap.values()]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  const peakDay = [...byDayOfWeek].sort((a, b) => b.orders - a.orders)[0];
  const peakHour = [...byHour].sort((a, b) => b.orders - a.orders)[0];

  const peakDayFull =
    DAY_NAMES_FULL[peakDay?.dayIndex ?? 0] ?? peakDay?.day ?? "—";

  const insights = buildInsights({
    orders,
    paid,
    topProducts,
    topCities,
    peakDay: peakDayFull,
    peakDayOrders: peakDay?.orders ?? 0,
    peakHour: peakHour?.hour ?? 0,
    peakHourOrders: peakHour?.orders ?? 0,
    ordersGrowth7d,
    avgOrderValue: paid.length ? revenueINR / paid.length : 0,
    last7Count: last7.length,
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalOrders: orders.length,
      paidOrders: paid.length,
      pendingOrders: orders.length - paid.length,
      revenueINR,
      avgOrderValueINR: paid.length ? Math.round(revenueINR / paid.length) : 0,
      itemsSold,
      last7DaysOrders: last7.length,
      last30DaysOrders: last30.length,
      last7DaysRevenue: paid7.reduce((s, o) => s + o.amountINR, 0),
      last30DaysRevenue: paid30.reduce((s, o) => s + o.amountINR, 0),
      ordersGrowth7d,
    },
    byDayOfWeek,
    byHour,
    dailyLast30,
    topProducts,
    topVariants,
    topCities,
    topStates,
    peak: {
      dayOfWeek: peakDayFull,
      dayOrders: peakDay?.orders ?? 0,
      hour: peakHour?.hour ?? 0,
      hourLabel: peakHour?.label ?? "—",
      hourOrders: peakHour?.orders ?? 0,
    },
    insights,
  };
}

function buildInsights(input: {
  orders: Order[];
  paid: Order[];
  topProducts: ProductStat[];
  topCities: LocationStat[];
  peakDay: string;
  peakDayOrders: number;
  peakHour: number;
  peakHourOrders: number;
  ordersGrowth7d: number | null;
  avgOrderValue: number;
  last7Count: number;
}): string[] {
  const lines: string[] = [];

  if (input.orders.length === 0) {
    lines.push(
      "No orders yet. Share your shop link on WhatsApp and Instagram — analytics will appear after the first orders."
    );
    return lines;
  }

  if (input.peakDayOrders > 0) {
    lines.push(
      `Busiest day: **${input.peakDay}** (${input.peakDayOrders} order${input.peakDayOrders === 1 ? "" : "s"}). Post offers and stories the evening before.`
    );
  }

  if (input.peakHourOrders > 0) {
    const end = hourLabel((input.peakHour + 1) % 24);
    lines.push(
      `Peak ordering time: **${hourLabel(input.peakHour)} – ${end}** IST (${input.peakHourOrders} orders). Schedule WhatsApp broadcasts about 1–2 hours earlier.`
    );
  }

  if (input.topProducts[0]) {
    const p = input.topProducts[0];
    lines.push(
      `Best seller: **${p.name}** — ${p.quantity} units, ₹${p.revenueINR.toLocaleString("en-IN")} revenue. Keep this in stock; feature it on the homepage.`
    );
  }

  if (input.topProducts[1] && input.topProducts[0]) {
    const weak = input.topProducts[input.topProducts.length - 1];
    if (weak.quantity < input.topProducts[0].quantity / 3) {
      lines.push(
        `Low mover: **${weak.name}** (${weak.quantity} units). Try a combo offer or reduce display order in admin.`
      );
    }
  }

  if (input.topCities[0]) {
    const c = input.topCities[0];
    lines.push(
      `Top city: **${c.city}${c.state ? `, ${c.state}` : ""}** (${c.orders} orders). Consider local delivery promos for this area.`
    );
  }

  if (input.ordersGrowth7d !== null) {
    if (input.ordersGrowth7d > 0) {
      lines.push(
        `Orders up **${input.ordersGrowth7d}%** vs the previous 7 days (${input.last7Count} this week).`
      );
    } else if (input.ordersGrowth7d < 0) {
      lines.push(
        `Orders down **${Math.abs(input.ordersGrowth7d)}%** vs last week. Run a weekend discount on your best seller.`
      );
    }
  }

  if (input.avgOrderValue > 0) {
    lines.push(
      `Average paid order: **₹${Math.round(input.avgOrderValue).toLocaleString("en-IN")}**. Promote the **5-pickle combo (₹999)** alongside top jars.`
    );
  }

  const pending = input.orders.length - input.paid.length;
  if (pending > 0) {
    lines.push(
      `${pending} pending payment${pending === 1 ? "" : "s"} — follow up on WhatsApp if customers abandoned checkout.`
    );
  }

  return lines.slice(0, 8);
}
