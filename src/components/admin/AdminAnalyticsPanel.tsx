"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Clock,
  Calendar,
  Package,
  MapPin,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import type { OrderAnalytics } from "@/lib/order-analytics";
import { AnalyticsBarChart, AnalyticsSparkline } from "./AnalyticsBarChart";

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function InsightText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p className="text-sm text-ink-muted leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-ink font-semibold">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default function AdminAnalyticsPanel() {
  const [data, setData] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    void fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !data) {
    return <p className="p-8 text-muted">Loading analytics…</p>;
  }

  if (!data) {
    return <p className="p-8 text-muted">Could not load analytics.</p>;
  }

  const { summary, peak } = data;

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full overflow-x-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Analytics</h1>
          <p className="text-sm text-muted mt-1">
            Order patterns & bestsellers (IST). Use this to plan stock, posts, and promos.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink hover:border-accent/40"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total orders" value={String(summary.totalOrders)} />
        <MetricCard
          label="Revenue (paid)"
          value={formatINR(summary.revenueINR)}
          accent
        />
        <MetricCard
          label="Last 7 days"
          value={String(summary.last7DaysOrders)}
          sub={
            summary.ordersGrowth7d !== null
              ? `${summary.ordersGrowth7d >= 0 ? "+" : ""}${summary.ordersGrowth7d}% vs prior week`
              : undefined
          }
        />
        <MetricCard
          label="Avg order"
          value={formatINR(summary.avgOrderValueINR)}
          sub={`${summary.itemsSold} items sold`}
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <PeakCard
          icon={Calendar}
          title="Busiest day"
          value={peak.dayOfWeek}
          detail={`${peak.dayOrders} orders (all time pattern)`}
        />
        <PeakCard
          icon={Clock}
          title="Peak hour (IST)"
          value={peak.hourLabel}
          detail={`${peak.hourOrders} orders in this hour slot`}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-amber-900">
          <Lightbulb className="h-5 w-5" />
          <h2 className="font-semibold">Recommendations for you</h2>
        </div>
        <ul className="mt-4 space-y-3">
          {data.insights.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">{i + 1}.</span>
              <InsightText text={line} />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <ChartCard title="Orders by day of week" icon={Calendar}>
          <AnalyticsBarChart
            bars={data.byDayOfWeek.map((d) => ({
              label: d.day,
              value: d.orders,
              sublabel: d.revenueINR > 0 ? formatINR(d.revenueINR) : undefined,
            }))}
          />
          <p className="mt-3 text-xs text-muted">All orders · revenue shown for paid only</p>
        </ChartCard>

        <ChartCard title="Orders by time of day (IST)" icon={Clock}>
          <AnalyticsBarChart
            bars={data.byHour
              .filter((_, h) => h >= 6 && h <= 23)
              .map((h) => ({
                label: h.label.replace(" ", ""),
                value: h.orders,
              }))}
          />
          <p className="mt-3 text-xs text-muted">6 AM – 11 PM shown · times in India (IST)</p>
        </ChartCard>
      </div>

      <ChartCard title="Last 30 days — orders per day" icon={TrendingUp} className="mt-6">
        <AnalyticsSparkline
          points={data.dailyLast30.map((d) => ({
            label: d.label,
            value: d.orders,
          }))}
        />
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>{data.dailyLast30[0]?.label}</span>
          <span>Today</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Last 30 days revenue: {formatINR(summary.last30DaysRevenue)} ·{" "}
          {summary.last30DaysOrders} orders
        </p>
      </ChartCard>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <ChartCard title="Best selling products" icon={Package}>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No paid orders with items yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-border">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold text-right">Qty</th>
                    <th className="pb-2 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={p.name} className="border-b border-border/60">
                      <td className="py-2.5">
                        <span className="text-xs text-muted mr-2">#{i + 1}</span>
                        <span className="font-medium text-ink">{p.name}</span>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{p.quantity}</td>
                      <td className="py-2.5 text-right tabular-nums text-accent font-medium">
                        {formatINR(p.revenueINR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Popular sizes / variants" icon={Package}>
          {data.topVariants.length === 0 ? (
            <p className="text-sm text-muted">No variant data yet.</p>
          ) : (
            <AnalyticsBarChart
              bars={data.topVariants.slice(0, 8).map((v) => ({
                label: v.variantLabel.length > 8 ? v.variantLabel.slice(0, 8) : v.variantLabel,
                value: v.quantity,
                sublabel: v.productName.split(" ")[0],
              }))}
            />
          )}
        </ChartCard>
      </div>

      <ChartCard title="Top customer cities" icon={MapPin} className="mt-6">
        {data.topCities.length === 0 ? (
          <p className="text-sm text-muted">No location data yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {data.topCities.map((c, i) => (
              <div
                key={`${c.city}-${c.state}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <span className="text-xs text-muted">#{i + 1}</span>
                  <p className="font-medium text-ink">
                    {c.city}
                    {c.state ? `, ${c.state}` : ""}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{c.orders} orders</p>
                  <p className="text-xs text-accent">{formatINR(c.revenueINR)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      <p className="mt-8 text-xs text-muted">
        Updated {new Date(data.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}{" "}
        IST · Based on {summary.paidOrders} paid / {summary.totalOrders} total orders
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-forest font-medium">{sub}</p>}
    </div>
  );
}

function PeakCard({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: typeof Clock;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent-soft p-5 flex gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted">{title}</p>
        <p className="mt-1 text-xl font-display text-ink">{value}</p>
        <p className="mt-0.5 text-sm text-muted">{detail}</p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: typeof Clock;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon className="h-5 w-5 text-forest" />
        <h2 className="font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
