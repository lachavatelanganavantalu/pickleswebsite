import type { Metadata } from "next";
import Link from "next/link";
import FaqContent from "@/components/FaqContent";
import JsonLd from "@/components/JsonLd";
import { faqPageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Lachava Telangana Pickles — varieties, combo pricing, payment, FSSAI safety, storage, and shipping across India.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)]">
      <JsonLd data={faqPageJsonLd()} />
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">Help</p>
        <h1 className="shop-page-title mt-1">Frequently asked questions</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Direct answers about ordering, pricing, food safety, and delivery from Lachava Telangana
          Pickles.
        </p>
        <FaqContent />
        <p className="mt-8 text-sm text-ink-muted">
          <Link href="/pricing" className="font-semibold text-brand hover:underline">
            View official prices
          </Link>
          {" · "}
          <Link href="/contact" className="font-semibold text-brand hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
