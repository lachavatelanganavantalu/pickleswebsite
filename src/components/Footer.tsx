import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { SITE_CONTACT } from "@/lib/site-contact";

const shopLinks = [
  { href: "/products", label: "Pickles" },
  { href: "/pricing", label: "Pricing" },
  { href: "/combos", label: "Combo ₹999" },
  { href: "/track", label: "Track order" },
] as const;

const infoLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/return-refund-policy", label: "Return & Refund" },
  { href: "/shipping-policy", label: "Shipping Policy" },
] as const;

export default function Footer() {
  return (
    <footer className="site-footer mt-auto border-t border-border bg-brand text-surface pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom,0px))] lg:pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          <div>
            <p className="font-display text-xl text-surface sm:text-2xl">{SITE_CONTACT.businessNameTe}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-surface/50">
              {SITE_CONTACT.businessName}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-surface/60">
              Official menu — 10 pickles (1 kg &amp; ½ kg). 5-pickle combo ₹999.
            </p>
            <p className="mt-2 text-xs text-surface/50">
              FSSAI license {SITE_CONTACT.fssaiLicenseNumber}
            </p>
            <SocialLinks className="mt-5" variant="on-dark" />
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-surface/50 sm:mb-4">
              Shop
            </h3>
            <div className="flex flex-col gap-2 text-sm text-surface/70">
              {shopLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-surface/50 sm:mb-4">
              Information
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-surface/70 sm:grid-cols-1">
              {infoLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-surface/10 pt-6 text-xs text-surface/40 sm:mt-12 sm:pt-8">
          <p>
            © {new Date().getFullYear()} {SITE_CONTACT.businessName}
          </p>
          <p className="mt-2">
            <a href={`mailto:${SITE_CONTACT.email}`} className="hover:text-surface/70">
              {SITE_CONTACT.email}
            </a>
            {" · "}
            <a href={`tel:${SITE_CONTACT.phoneTel}`} className="hover:text-surface/70">
              {SITE_CONTACT.phone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
