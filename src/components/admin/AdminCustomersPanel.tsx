"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPhoneDisplay } from "@/lib/phone";

interface RegisteredUser {
  id: string;
  phone: string;
  createdAt: string;
}

interface GuestCustomer {
  phone: string;
  name: string;
  orderCount: number;
  lastOrderAt: string;
}

export default function AdminCustomersPanel() {
  const [registered, setRegistered] = useState<RegisteredUser[]>([]);
  const [guests, setGuests] = useState<GuestCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/customers");
    const data = await res.json();
    if (res.ok) {
      setRegistered(Array.isArray(data.registered) ? data.registered : []);
      setGuests(Array.isArray(data.guests) ? data.guests : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="p-4 sm:p-8 max-w-full overflow-x-hidden">
      <h1 className="font-display text-2xl text-ink">Customers</h1>
      <p className="text-sm text-muted mt-1">
        Registered accounts vs guest checkout customers (no sign-up).
      </p>

      {loading ? (
        <p className="mt-8 text-muted">Loading…</p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand">
              Registered ({registered.length})
            </h2>
            <p className="mt-1 text-xs text-muted">Signed up with mobile + password.</p>
            {registered.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No registered customers yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {registered.map((u) => (
                  <li
                    key={u.id}
                    className="rounded-xl border border-border bg-surface-elevated px-4 py-3"
                  >
                    <p className="font-semibold text-ink">{formatPhoneDisplay(u.phone)}</p>
                    <p className="text-xs text-muted mt-0.5">
                      Joined{" "}
                      {new Date(u.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-forest-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                      Registered
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand">
              Guest checkout ({guests.length})
            </h2>
            <p className="mt-1 text-xs text-muted">
              Placed orders without signing in — orders are not linked to an account.
            </p>
            {guests.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No guest checkout customers yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {guests.map((g) => (
                  <li
                    key={g.phone}
                    className="rounded-xl border border-border bg-surface-elevated px-4 py-3"
                  >
                    <p className="font-semibold text-ink">{g.name}</p>
                    <p className="text-sm text-muted">{g.phone}</p>
                    <p className="text-xs text-muted mt-1">
                      {g.orderCount} order{g.orderCount === 1 ? "" : "s"} · Last{" "}
                      {new Date(g.lastOrderAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                      Guest
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
