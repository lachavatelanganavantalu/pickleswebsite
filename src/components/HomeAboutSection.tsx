import { ABOUT_PORTRAIT } from "@/data/gallery";
import { ABOUT_STORY_PARAGRAPHS } from "@/data/about-story";

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

          <div className="home-about-copy home-about-story">
            {ABOUT_STORY_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="home-about-story-p">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
