import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata = {
  title: "Shipping Policy",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout label="Legal" title="Shipping Policy">
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        This Shipping Policy explains how {SITE_CONTACT.businessName} packs and delivers pickle
        orders placed on our website.
      </p>

      <h2 className="text-base font-semibold text-ink">Delivery areas</h2>
      <p>
        We ship across India to addresses you provide at checkout. Delivery to remote or
        non-serviceable PIN codes may take longer or require confirmation before dispatch.
      </p>

      <h2 className="text-base font-semibold text-ink">Order processing</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Orders are processed after payment confirmation.</li>
        <li>We pack pickles in sealed jars with protective packaging to reduce transit damage.</li>
        <li>You will receive order updates via WhatsApp or the contact details you provide.</li>
      </ul>

      <h2 className="text-base font-semibold text-ink">Delivery timelines</h2>
      <p>
        Estimated delivery is typically <strong>3–7 business days</strong> within Telangana and{" "}
        <strong>5–10 business days</strong> for other states, depending on courier service and
        location. These are estimates, not guarantees. Delays due to weather, holidays, or courier
        disruptions are outside our control.
      </p>

      <h2 className="text-base font-semibold text-ink">Shipping charges</h2>
      <p>
        Shipping fees, if any, are shown at checkout before you pay. Free or discounted shipping
        offers, when available, apply only to qualifying orders as stated on the site.
      </p>

      <h2 className="text-base font-semibold text-ink">Tracking</h2>
      <p>
        Once dispatched, you can track your order on our{" "}
        <a href="/track" className="text-brand hover:underline">
          Track Order
        </a>{" "}
        page using your order ID. Tracking details may also be shared on WhatsApp.
      </p>

      <h2 className="text-base font-semibold text-ink">On delivery</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Please inspect the outer package before accepting delivery.</li>
        <li>
          If the box is crushed, wet, or leaking, note the damage with the courier and contact us
          immediately.
        </li>
        <li>
          Open and check your pickles within {SITE_CONTACT.refundClaimWindow} of receipt. See our{" "}
          <a href="/return-refund-policy" className="text-brand hover:underline">
            Return &amp; Refund Policy
          </a>{" "}
          for how to report issues.
        </li>
      </ul>

      <h2 className="text-base font-semibold text-ink">Undelivered or failed delivery</h2>
      <p>
        If a delivery attempt fails due to an incorrect address or the recipient being unavailable,
        the courier may return the package. Re-shipping charges may apply. Contact us at{" "}
        <a href={`mailto:${SITE_CONTACT.email}`} className="text-brand hover:underline">
          {SITE_CONTACT.email}
        </a>{" "}
        or{" "}
        <a href={`tel:${SITE_CONTACT.phoneTel}`} className="text-brand hover:underline">
          {SITE_CONTACT.phone}
        </a>{" "}
        for help.
      </p>
    </LegalPageLayout>
  );
}
