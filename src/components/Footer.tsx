import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";

export default function Footer() {
  return (
    <footer className="mt-auto hidden border-t border-border bg-brand text-surface pb-[env(safe-area-inset-bottom)] lg:block">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-display text-2xl text-surface">లచ్చవ్వ తెలంగాణ వంటల</p>
            <p className="text-xs uppercase tracking-[0.2em] text-surface/50 mt-1">
              Lachava Telangana Pickles
            </p>
            <p className="mt-4 max-w-sm text-sm text-surface/60 leading-relaxed">
              Official menu — 10 pickles (1 kg & 1/2 kg). 5-pickle combo ₹999.
            </p>
            <SocialLinks className="mt-5" variant="on-dark" />
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-surface/50 mb-4">
              Order
            </h3>
            <div className="flex flex-col gap-2 text-sm text-surface/70">
              <Link href="/products" className="hover:text-white transition-colors">
                Pickles
              </Link>
              <Link href="/combos" className="hover:text-white transition-colors">
                Combo ₹999
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact & payment
              </Link>
              <a href="tel:+916302112848" className="hover:text-white transition-colors">
                +91 63021 12848
              </a>
              <p>PhonePe / GPay: 63021 12848</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface/10 text-xs text-surface/40">
          <p>© {new Date().getFullYear()} Lachava Telangana Pickles</p>
        </div>
      </div>
    </footer>
  );
}
