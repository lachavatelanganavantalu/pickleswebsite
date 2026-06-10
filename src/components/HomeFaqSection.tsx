import FaqContent from "@/components/FaqContent";

export default function HomeFaqSection() {
  return (
    <section
      id="faq"
      className="home-faq app-content border-t border-border py-[clamp(2rem,6vw,3.5rem)]"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-shop-muted">Help</p>
        <h2 id="faq-heading" className="shop-page-title mt-1">
          Frequently asked questions
        </h2>
        <FaqContent />
      </div>
    </section>
  );
}
