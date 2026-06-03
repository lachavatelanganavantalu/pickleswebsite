import { ABOUT_PORTRAIT } from "@/data/gallery";

export default function HomeAboutSection() {
  return (
    <section id="about" className="home-about app-content py-[clamp(2rem,6vw,3.5rem)]" aria-labelledby="about-heading">
      <div className="home-about-inner mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">About us</p>
        <h2 id="about-heading" className="shop-page-title mt-1">
          లచ్చవ్వ తెలంగాణ వంటల
        </h2>
        <p className="mt-1 text-sm font-medium text-brand">Lachava Telangana Pickles</p>

        <div className="home-about-grid mt-8">
          <div className="home-about-portrait-wrap">
            <div className="home-about-portrait-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_PORTRAIT}
                alt="Lachava — traditional Telangana pickles"
                className="home-about-portrait-photo"
              />
            </div>
          </div>

          <div className="home-about-copy">
            <p className="text-base leading-relaxed text-muted">
              Order by the jar (1 kg &amp; 1/2 kg) or try our{" "}
              <strong className="text-brand">5-pickle combo for ₹999</strong> — Chicken, Chinthankaya, Mango,
              Usirikaya &amp; Lemon (250g each).
            </p>
            <p className="mt-4 text-sm font-semibold text-brand">
              PhonePe / GPay: 63021 12848 · FSSAI certified
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
