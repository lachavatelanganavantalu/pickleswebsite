import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-shop-muted">Contact</p>
      <h1 className="shop-page-title mt-2">లచ్చవ్వ తెలంగాణ వంటల</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        Questions about your order? Message us on WhatsApp or call.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-white p-6">
        <p className="text-sm">
          <span className="font-semibold text-brand">Phone / WhatsApp:</span>{" "}
          <a href="tel:+916302112848" className="text-brand hover:underline">
            +91 63021 12848
          </a>
        </p>
        <a
          href="https://wa.me/916302112848"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white hover:opacity-95"
        >
          Chat on WhatsApp
        </a>

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">
            Follow us
          </p>
          <SocialLinks className="mt-3" />
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        <Link href="/track" className="font-semibold text-brand hover:underline">
          Track your order
        </Link>
      </p>
    </div>
  );
}
