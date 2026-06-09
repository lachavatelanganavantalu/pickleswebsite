import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata = {
  title: "Terms & Conditions",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout label="Legal" title="Terms & Conditions">
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        By accessing or ordering from the {SITE_CONTACT.businessName} website, you agree to these
        Terms &amp; Conditions. Please read them carefully before placing an order.
      </p>

      <h2 className="text-base font-semibold text-ink">About us</h2>
      <p>
        {SITE_CONTACT.businessName} sells traditional Telangana pickles and combo packs through
        this website. Product names, weights, and prices are shown on the shop pages and at
        checkout.
      </p>

      <h2 className="text-base font-semibold text-ink">Orders &amp; pricing</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>All prices are listed in Indian Rupees (₹) unless stated otherwise.</li>
        <li>
          An order is confirmed only after successful payment and our acceptance of the order.
        </li>
        <li>We reserve the right to refuse or cancel orders in case of pricing errors, stock unavailability, or suspected fraud.</li>
        <li>Product images are for reference; actual packaging may vary slightly.</li>
      </ul>

      <h2 className="text-base font-semibold text-ink">Payment</h2>
      <p>
        Payments are accepted through Razorpay and other methods shown at checkout. You agree to
        provide accurate payment and billing information. Failed or reversed payments may result in
        order cancellation.
      </p>

      <h2 className="text-base font-semibold text-ink">Delivery</h2>
      <p>
        Delivery timelines and shipping terms are described in our{" "}
        <a href="/shipping-policy" className="text-brand hover:underline">
          Shipping Policy
        </a>
        . Risk of loss passes to you upon delivery to the address you provide.
      </p>

      <h2 className="text-base font-semibold text-ink">Returns &amp; refunds</h2>
      <p>
        Return and refund rules — including the {SITE_CONTACT.refundClaimWindow} claim window — are
        set out in our{" "}
        <a href="/return-refund-policy" className="text-brand hover:underline">
          Return &amp; Refund Policy
        </a>
        .
      </p>

      <h2 className="text-base font-semibold text-ink">Food products</h2>
      <p>
        Our pickles are food products. Please check ingredients and allergens before consumption.
        Store as directed on the label. We are not liable for issues arising from improper storage
        or use after delivery.
      </p>

      <h2 className="text-base font-semibold text-ink">Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, our liability for any claim related to an order is
        limited to the amount you paid for that order. We are not liable for indirect or
        consequential damages.
      </p>

      <h2 className="text-base font-semibold text-ink">Governing law</h2>
      <p>
        These terms are governed by the laws of India. Disputes shall be subject to the courts of
        Telangana, India.
      </p>

      <h2 className="text-base font-semibold text-ink">Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${SITE_CONTACT.email}`} className="text-brand hover:underline">
          {SITE_CONTACT.email}
        </a>{" "}
        or call{" "}
        <a href={`tel:${SITE_CONTACT.phoneTel}`} className="text-brand hover:underline">
          {SITE_CONTACT.phone}
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
