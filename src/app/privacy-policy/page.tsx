import LegalPageLayout from "@/components/LegalPageLayout";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout label="Legal" title="Privacy Policy">
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        {SITE_CONTACT.businessName} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the
        Lachava pickles website. This Privacy Policy explains how we collect, use, and protect your
        information when you browse our site or place an order.
      </p>

      <h2 className="text-base font-semibold text-ink">Information we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Order details:</strong> name, phone number, delivery address, city, state, PIN
          code, and items ordered.
        </li>
        <li>
          <strong>Payment information:</strong> payments are processed securely through Razorpay.
          We do not store your full card, UPI PIN, or net-banking credentials on our servers.
        </li>
        <li>
          <strong>Communications:</strong> messages you send us via WhatsApp, phone, or email
          regarding orders, refunds, or support.
        </li>
        <li>
          <strong>Technical data:</strong> basic browser and device information collected
          automatically for site security and performance.
        </li>
      </ul>

      <h2 className="text-base font-semibold text-ink">How we use your information</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Process and deliver your pickle orders.</li>
        <li>Share order and shipping details with our courier partners for delivery.</li>
        <li>Respond to your questions, refund requests, and support needs.</li>
        <li>Improve our website, products, and customer experience.</li>
        <li>Comply with applicable laws and payment-provider requirements.</li>
      </ul>

      <h2 className="text-base font-semibold text-ink">Sharing of information</h2>
      <p>
        We share your information only as needed to fulfil your order — for example with payment
        processors (Razorpay), shipping partners, and when required by law. We do not sell your
        personal data to third parties.
      </p>

      <h2 className="text-base font-semibold text-ink">Data retention</h2>
      <p>
        We retain order and contact records for as long as needed to complete transactions,
        handle refunds or disputes, and meet legal or accounting obligations.
      </p>

      <h2 className="text-base font-semibold text-ink">Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by contacting
        us at{" "}
        <a href={`mailto:${SITE_CONTACT.email}`} className="text-brand hover:underline">
          {SITE_CONTACT.email}
        </a>
        . We will respond within a reasonable time.
      </p>

      <h2 className="text-base font-semibold text-ink">Security</h2>
      <p>
        We use reasonable technical and organisational measures to protect your information.
        Online payments are handled through Razorpay&apos;s secure payment gateway.
      </p>

      <h2 className="text-base font-semibold text-ink">Contact</h2>
      <p>
        For privacy-related questions, email{" "}
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
