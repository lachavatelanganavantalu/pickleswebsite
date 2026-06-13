import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

const policyLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/return-refund-policy", label: "Return & Refund Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/about", label: "About Us" },
] as const;

export default function ContactPage() {
  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-shop-muted">Contact</p>
      <h1 className="shop-page-title mt-2">{SITE_CONTACT.businessNameTe}</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        Questions about your order, payment, delivery, or a refund? Reach us using any of the
        details below.
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-brand">Phone &amp; WhatsApp</h2>
          <p className="mt-3 text-sm">
            <a href={`tel:${SITE_CONTACT.phoneTel}`} className="text-brand hover:underline">
              {SITE_CONTACT.phone}
            </a>
          </p>
          <a
            href={`https://wa.me/${SITE_CONTACT.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white hover:opacity-95"
          >
            Chat on WhatsApp
          </a>
          <p className="mt-4 text-sm text-ink-muted">
            PhonePe / GPay: {SITE_CONTACT.upiPhone}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-brand">Email</h2>
          <p className="mt-3 text-sm">
            <a href={`mailto:${SITE_CONTACT.email}`} className="text-brand hover:underline">
              {SITE_CONTACT.email}
            </a>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Use this email for order support, business enquiries, and all return &amp; refund
            requests.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-brand">Return &amp; refund claims</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Because our products are fresh food items,{" "}
            <strong className="text-ink">
              all return and refund claims must be made within {SITE_CONTACT.refundClaimWindow} of
              receiving your pickle package
            </strong>
            .
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Email{" "}
            <a href={`mailto:${SITE_CONTACT.email}`} className="font-semibold text-brand hover:underline">
              {SITE_CONTACT.email}
            </a>{" "}
            with your order ID, phone number, a description of the issue, and photos or video of the
            package and product. Claims received after the {SITE_CONTACT.refundClaimWindow} window
            cannot be accepted.
          </p>
          <p className="mt-4 text-sm">
            <Link href="/return-refund-policy" className="font-semibold text-brand hover:underline">
              Read full Return &amp; Refund Policy
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-brand">FSSAI registration</h2>
          <p className="mt-3 text-sm text-ink-muted">
            {SITE_CONTACT.businessName} is FSSAI registered. License number:{" "}
            <strong className="text-ink">{SITE_CONTACT.fssaiLicenseNumber}</strong>.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-brand">How to order online</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
            <li>
              Browse <Link href="/products" className="text-brand hover:underline">pickles</Link> or the{" "}
              <Link href="/pricing" className="text-brand hover:underline">price list</Link>.
            </li>
            <li>Add jars to cart and open checkout.</li>
            <li>Pay with Razorpay at checkout.</li>
            <li>Track on <Link href="/track" className="text-brand hover:underline">Track order</Link>.</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-brand">Location</h2>
          <p className="mt-3 text-sm text-ink-muted">{SITE_CONTACT.location}</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-shop-muted">
            Policies &amp; information
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {policyLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-brand hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
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
