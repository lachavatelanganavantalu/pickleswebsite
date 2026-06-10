import Link from "next/link";
import { getProductDetails } from "@/data/product-details";
import { SITE_CONTACT } from "@/lib/site-contact";
import { PickleProduct } from "@/types/product";

interface Props {
  product: PickleProduct;
}

export default function ProductDetailSections({ product }: Props) {
  const details = getProductDetails(product.id, product.name);

  return (
    <section className="mt-8 space-y-6 border-t border-border pt-6" aria-label="Product information">
      <div>
        <h2 className="text-base font-semibold text-brand">
          What is Lachava {product.name}?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{details.overview}</p>
      </div>

      <div>
        <h2 className="text-base font-semibold text-brand">
          What are the ingredients in {product.name}?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{details.ingredients}</p>
      </div>

      <div>
        <h2 className="text-base font-semibold text-brand">
          How should I store {product.name}?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{details.storage}</p>
      </div>

      <div>
        <h2 className="text-base font-semibold text-brand">
          How long does {product.name} last?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{details.shelfLife}</p>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 text-sm leading-relaxed text-ink-muted">
        <h2 className="text-base font-semibold text-brand">Is Lachava FSSAI registered?</h2>
        <p className="mt-2">
          Yes. {SITE_CONTACT.businessName} holds FSSAI license{" "}
          <strong className="text-ink">{SITE_CONTACT.fssaiLicenseNumber}</strong>. We pack every
          jar in Siddipet, Telangana, and ship across India after payment confirmation.
        </p>
        <p className="mt-3">
          <Link href="/faq" className="font-semibold text-brand hover:underline">
            Read all FAQs
          </Link>
          {" · "}
          <Link href="/shipping-policy" className="font-semibold text-brand hover:underline">
            Shipping policy
          </Link>
        </p>
      </div>
    </section>
  );
}
