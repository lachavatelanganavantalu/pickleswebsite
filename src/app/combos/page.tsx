import type { Metadata } from "next";
import Link from "next/link";
import ComboOrderButton from "@/components/ComboOrderButton";
import ComboVisual from "@/components/ComboVisual";
import JsonLd from "@/components/JsonLd";
import { getAllCombos } from "@/lib/combos-db";
import { formatINRDecimal } from "@/lib/format-price";
import { comboProductJsonLd } from "@/lib/structured-data";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Combo offer",
  description:
    "Lachava 5-pickle combo ₹999 — Chicken, Chinthankaya, Mango, Usirikaya & Lemon (250g each). Official Telangana pickle combo pack.",
  alternates: { canonical: "/combos" },
};

export default async function CombosPage() {
  const combos = await getAllCombos();

  return (
    <div className="app-content py-[clamp(1rem,4vw,2rem)]">
      {combos.map((combo) => (
        <JsonLd key={combo.id} data={comboProductJsonLd(combo)} />
      ))}
      <h1 className="shop-page-title">Combo offer</h1>
      <p className="mt-1 text-sm text-shop-muted">Official 5-pickle pack — ₹999</p>

      <h2 className="mt-6 text-base font-semibold text-brand">
        What is included in the Lachava 5-pickle combo?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Five 250g jars for a flat {formatINRDecimal(999)}: Chicken, Chinthankaya, Mango, Usirikaya,
        and Lemon pickles. FSSAI license {SITE_CONTACT.fssaiLicenseNumber}. See full{" "}
        <Link href="/pricing" className="font-semibold text-brand hover:underline">
          price list
        </Link>
        .
      </p>

      <div className="mt-6 space-y-4">
        {combos.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-xl bg-white">
            <ComboVisual combo={c} aspect="wide" />
            <div className="p-5">
              <p className="text-sm text-muted">{c.description}</p>
              {c.descriptionTelugu && (
                <p className="mt-2 text-sm text-muted">{c.descriptionTelugu}</p>
              )}
              <p className="mt-2 text-xs text-muted">{c.items}</p>
              {c.itemsTelugu && (
                <p className="mt-1 text-xs text-muted">{c.itemsTelugu}</p>
              )}
              <p className="mt-4 text-2xl font-bold text-brand">{formatINRDecimal(c.priceINR)}</p>
              <ComboOrderButton combo={c} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
