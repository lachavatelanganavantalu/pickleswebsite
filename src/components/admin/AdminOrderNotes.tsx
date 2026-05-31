"use client";

import { useState } from "react";
import type { Order } from "@/lib/orders-db";

export default function AdminOrderNotes({
  order,
  onSaved,
}: {
  order: Order;
  onSaved: () => void;
}) {
  const [notes, setNotes] = useState(order.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/orders/${order.orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: notes }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Could not save notes");
      return;
    }
    setMessage("Saved");
    onSaved();
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="text-xs font-semibold uppercase text-muted">Admin notes</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
        placeholder="Internal notes (DTDC AWB, customer call, etc.)"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-brand hover:border-brand/40 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save notes"}
        </button>
        {message && <span className="text-xs text-forest">{message}</span>}
      </div>
    </div>
  );
}
