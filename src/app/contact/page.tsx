import Link from "next/link";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-shop-muted">Contact</p>
      <h1 className="shop-page-title mt-2">లచ్చవ్వ తెలంగాణ వంటల</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        Order pickles or the 5-jar combo — pay with PhonePe or GPay on the number below.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-border bg-white p-6">
        <p className="text-sm">
          <span className="font-semibold text-brand">Phone / WhatsApp:</span>{" "}
          <a href="tel:+916302112848" className="text-brand hover:underline">
            +91 63021 12848
          </a>
        </p>
        <p className="text-sm">
          <span className="font-semibold text-brand">PhonePe / GPay:</span>{" "}
          <span className="text-ink">63021 12848</span>
        </p>
      </div>

      <p className="mt-6 text-sm text-muted">
        <Link href="/products" className="font-semibold text-brand hover:underline">
          Shop pickles
        </Link>
        {" · "}
        <Link href="/combos" className="font-semibold text-brand hover:underline">
          Combo ₹999
        </Link>
      </p>
    </div>
  );
}
