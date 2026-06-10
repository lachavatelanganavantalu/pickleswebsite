import { HOME_FAQ } from "@/data/faq";

export default function FaqContent() {
  return (
    <dl className="mt-6 space-y-5">
      {HOME_FAQ.map((item) => (
        <div key={item.question} className="home-faq-item">
          <dt className="text-sm font-semibold text-ink">{item.question}</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
