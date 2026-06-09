import Link from "next/link";
import { ABOUT_STORY_PARAGRAPHS } from "@/data/about-story";
import { ABOUT_PORTRAIT } from "@/data/gallery";
import SocialLinks from "@/components/SocialLinks";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <div className="app-content py-[clamp(1.5rem,5vw,3rem)]">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-shop-muted">About us</p>
        <h1 className="shop-page-title mt-2">{SITE_CONTACT.businessNameTe}</h1>
        <p className="mt-1 text-sm font-medium text-brand">{SITE_CONTACT.businessName}</p>

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

          <div className="home-about-copy home-about-story">
            {ABOUT_STORY_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="home-about-story-p">
                {paragraph}
              </p>
            ))}
            <SocialLinks className="mt-6" />
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-white p-6 text-sm leading-relaxed text-ink-muted">
          <p className="font-semibold text-ink">What we sell today</p>
          <p className="mt-2">
            Our official menu features 10 traditional Telangana pickles in 1 kg and ½ kg jars, plus
            a 5-pickle combo pack for ₹999. Every jar is made with the same care that built our
            YouTube community.
          </p>
          <p className="mt-4">
            <Link href="/products" className="font-semibold text-brand hover:underline">
              Browse pickles
            </Link>
            {" · "}
            <Link href="/contact" className="font-semibold text-brand hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
