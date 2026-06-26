"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

type ManifestStatus = {
  published: {
    generatedAt: string;
    productCount: number;
    activeProductCount: number;
    purchasableProductCount: number;
    comboCount: number;
    inactiveProducts: Array<{ id: string; name: string; reason: string }>;
  } | null;
  live: {
    productCount: number;
    activeProductCount: number;
    purchasableProductCount: number;
    comboCount: number;
    inactiveProducts: Array<{ id: string; name: string; reason: string }>;
  };
  hasPendingChanges: boolean;
};

function formatWhen(iso?: string): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminAssistantManifestPush({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<ManifestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assistant-manifest");
      if (!res.ok) throw new Error("Could not load assistant manifest status");
      setStatus((await res.json()) as ManifestStatus);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pushUpdate = async () => {
    setPushing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/assistant-manifest/push", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Push update failed");
      setMessage(
        `Assistant manifest updated — ${data.purchasableProductCount} buyable products, ${data.comboCount} combos.`,
      );
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Push update failed");
    } finally {
      setPushing(false);
    }
  };

  if (loading && !status) {
    return (
      <div className={compact ? "text-xs text-muted" : "rounded-2xl border border-border bg-white p-4 text-sm text-muted"}>
        Loading assistant manifest…
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-white p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          Assistance interface
        </div>
        <p className="text-xs text-muted">
          Published: {formatWhen(status?.published?.generatedAt)} · Live catalog:{" "}
          {status?.live.purchasableProductCount ?? 0} buyable
        </p>
        <button
          type="button"
          onClick={() => void pushUpdate()}
          disabled={pushing}
          className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-brand px-4 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${pushing ? "animate-spin" : ""}`} />
          {pushing ? "Pushing…" : "Push update"}
        </button>
        {message && <p className="text-xs text-forest">{message}</p>}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-forest">Assistance interface</p>
          <h2 className="mt-1 text-lg font-bold text-brand">Push catalog to assistant manifest</h2>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            After you add, edit, or deactivate products, push an update so the assistance interface
            knows the latest shop catalog — including new products, inactive items, and combo packs.
            Shoppers can then buy or open those products through the assistant.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void pushUpdate()}
          disabled={pushing}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${pushing ? "animate-spin" : ""}`} />
          {pushing ? "Pushing…" : "Push update"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface/70 p-4 text-sm">
          <p className="font-semibold text-brand">Published manifest</p>
          <p className="mt-1 text-muted">Last pushed: {formatWhen(status?.published?.generatedAt)}</p>
          <p className="mt-2">
            {status?.published?.purchasableProductCount ?? 0} buyable ·{" "}
            {status?.published?.inactiveProducts.length ?? 0} inactive
          </p>
        </div>
        <div className="rounded-xl bg-surface/70 p-4 text-sm">
          <p className="font-semibold text-brand">Live shop catalog</p>
          <p className="mt-1 text-muted">
            {status?.hasPendingChanges ? "Changes waiting to be pushed" : "Matches published manifest"}
          </p>
          <p className="mt-2">
            {status?.live.purchasableProductCount ?? 0} buyable ·{" "}
            {status?.live.inactiveProducts.length ?? 0} inactive · {status?.live.comboCount ?? 0} combos
          </p>
        </div>
      </div>

      {message && <p className="text-sm text-forest">{message}</p>}
    </section>
  );
}
