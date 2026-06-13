import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { getAllCombos } from "@/lib/combos-db";
import { getAllProducts } from "@/lib/products-db";
import { formatINRDecimal } from "@/lib/format-price";
import { offerCatalogJsonLd } from "@/lib/structured-data";
import { CATEGORY_LABELS } from "@/types/product";
import { SITE_CONTACT } from "@/lib/site-contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Official Lachava pickle prices — 10 varieties in 1 kg and ½ kg jars, plus 5-pickle combo ₹999. Telangana homemade pickles with FSSAI registration.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const [products, combos] = await Promise.all([getAllProducts(), getAllCombos()]);

  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)]">
      <JsonLd data={offerCatalogJsonLd(products, combos)} />
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">Shop</p>
        <h1 className="shop-page-title mt-1">Pickle prices &amp; plans</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Official menu prices for {SITE_CONTACT.businessName}. All jars are listed in Indian
          rupees (INR). FSSAI license {SITE_CONTACT.fssaiLicenseNumber}.
        </p>

        <h2 className="mt-8 text-base font-semibold text-brand">How do I buy Lachava pickles?</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
          <li>Browse pickles below or on the <Link href="/products" className="text-brand hover:underline">shop page</Link>.</li>
          <li>Choose jar size (1 kg or ½ kg) and add to cart.</li>
          <li>Checkout and pay with Razorpay (UPI, cards, net banking).</li>
          <li>Track dispatch on <Link href="/track" className="text-brand hover:underline">Track order</Link> or WhatsApp.</li>
        </ol>

        <h2 className="mt-10 text-base font-semibold text-brand">Individual pickle jars</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-shop-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Pickle</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">½ kg</th>
                <th className="px-4 py-3 font-semibold">1 kg</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const half = product.weightOptions.find((w) => w.id === "500g");
                const full = product.weightOptions.find((w) => w.id === "1kg");
                return (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link href={`/products/${product.slug}`} className="hover:text-brand hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{CATEGORY_LABELS[product.category]}</td>
                    <td className="px-4 py-3">{half ? formatINRDecimal(half.priceINR) : "—"}</td>
                    <td className="px-4 py-3">{full ? formatINRDecimal(full.priceINR) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-base font-semibold text-brand">Combo packs</h2>
        <div className="mt-4 space-y-4">
          {combos.map((combo) => (
            <article key={combo.id} className="rounded-2xl border border-border bg-white p-5">
              <h3 className="font-semibold text-ink">{combo.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{combo.description}</p>
              <p className="mt-2 text-xs text-ink-muted">{combo.items}</p>
              <p className="mt-3 text-lg font-bold text-brand">{formatINRDecimal(combo.priceINR)}</p>
              <Link href="/combos" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
                View combo →
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-ink-muted">
          Questions? See <Link href="/faq" className="font-semibold text-brand hover:underline">FAQ</Link> or{" "}
          <Link href="/contact" className="font-semibold text-brand hover:underline">contact us</Link>.
        </p>
      </div>
    </div>
  );
}
