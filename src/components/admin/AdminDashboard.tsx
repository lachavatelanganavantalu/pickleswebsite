"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, IndianRupee } from "lucide-react";

interface Status {
  ordersCount: number;
  paidCount: number;
  revenueINR: number;
  productsCount: number;
  combosCount: number;
  mongo: boolean;
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/status")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setStatus(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-4xl w-full overflow-x-hidden">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <p className="text-sm text-muted mt-1">
        Manage your shop, orders, and bilingual content from one place.
      </p>

      {status && (
        <>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={ShoppingBag}
              label="Orders"
              value={String(status.ordersCount)}
              sub={`${status.paidCount} paid`}
              href="/admin/orders"
            />
            <StatCard
              icon={IndianRupee}
              label="Revenue"
              value={`₹${status.revenueINR.toLocaleString("en-IN")}`}
              sub="paid orders"
              href="/admin/orders"
            />
            <StatCard
              icon={Package}
              label="Products"
              value={String(status.productsCount)}
              sub={
                status.combosCount > 0
                  ? `${status.combosCount} combo pack${status.combosCount === 1 ? "" : "s"}`
                  : undefined
              }
              href="/admin/products"
            />
          </div>

          <p className="mt-6 text-xs text-muted">
            Storage: {status.mongo ? "MongoDB" : "Local JSON files (set MONGODB_URI on Vercel for production)"}
          </p>
        </>
      )}

      <div className="mt-10 grid sm:grid-cols-2 gap-3">
        <QuickLink
          href="/admin/analytics"
          title="Analytics"
          desc="Best sellers, peak day & hour, cities, tips"
        />
        <QuickLink href="/admin/products" title="Products" desc="Pickles, combo packs, tags, Telugu names" />
        <QuickLink href="/admin/orders" title="Orders" desc="DTDC WhatsApp, notes, payment status" />
        <QuickLink href="/admin/settings" title="Site settings" desc="Homepage hero, story, contact, banner" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  sub?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-surface-elevated p-5 hover:border-accent/40 transition-colors"
    >
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </Link>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border px-4 py-3 hover:bg-surface transition-colors"
    >
      <p className="font-semibold text-ink">{title}</p>
      <p className="text-xs text-muted mt-0.5">{desc}</p>
    </Link>
  );
}
