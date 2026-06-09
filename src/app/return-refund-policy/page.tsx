import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata = {
  title: "Return & Refund Policy",
};

export default function ReturnRefundPolicyPage() {
  return (
    <LegalPageLayout label="Legal" title="Return & Refund Policy">
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        At {SITE_CONTACT.businessName}, we take care to pack and ship our pickles fresh. Because
        these are food products, returns are handled strictly as described below.
      </p>

      <h2 className="text-base font-semibold text-ink">When refunds apply</h2>
      <p>We will consider a refund or replacement only if:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>You received the wrong product or an incomplete order.</li>
        <li>The package arrived visibly damaged or leaked in transit.</li>
        <li>The product is spoiled or unfit for consumption upon opening, and you report it within the claim window below.</li>
      </ul>

      <h2 className="text-base font-semibold text-ink">Claim window — {SITE_CONTACT.refundClaimWindow}</h2>
      <p>
        <strong>
          All return and refund claims must be made within {SITE_CONTACT.refundClaimWindow} of
          receiving your pickle package.
        </strong>{" "}
        Claims received after this window cannot be accepted, as we cannot verify product condition
        once food items have been stored or consumed.
      </p>

      <h2 className="text-base font-semibold text-ink">How to request a refund</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Email us at{" "}
          <a href={`mailto:${SITE_CONTACT.email}`} className="font-semibold text-brand hover:underline">
            {SITE_CONTACT.email}
          </a>{" "}
          within {SITE_CONTACT.refundClaimWindow} of delivery.
        </li>
        <li>
          Include your order ID, full name, phone number, and a clear description of the issue.
        </li>
        <li>
          Attach photos or a short video showing the package, product, and the problem (damage,
          wrong item, spoilage, etc.).
        </li>
      </ol>
      <p>
        You may also reach us on WhatsApp at{" "}
        <a href={`tel:${SITE_CONTACT.phoneTel}`} className="text-brand hover:underline">
          {SITE_CONTACT.phone}
        </a>{" "}
        for urgent issues, but the official refund request must be sent to{" "}
        <a href={`mailto:${SITE_CONTACT.email}`} className="text-brand hover:underline">
          {SITE_CONTACT.email}
        </a>
        .
      </p>

      <h2 className="text-base font-semibold text-ink">Non-refundable situations</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Claims made after the {SITE_CONTACT.refundClaimWindow} window.</li>
        <li>Change of mind or taste preference after opening the product.</li>
        <li>Damage caused by improper storage after delivery.</li>
        <li>Orders where the delivery address or contact details provided were incorrect.</li>
      </ul>

      <h2 className="text-base font-semibold text-ink">Refund processing</h2>
      <p>
        Approved refunds are processed to the original payment method within 5–7 business days.
        Bank or UPI processing times may vary. We will notify you by email or WhatsApp once your
        refund is initiated.
      </p>

      <h2 className="text-base font-semibold text-ink">Contact</h2>
      <p>
        Refund enquiries:{" "}
        <a href={`mailto:${SITE_CONTACT.email}`} className="text-brand hover:underline">
          {SITE_CONTACT.email}
        </a>
      </p>
    </LegalPageLayout>
  );
}
