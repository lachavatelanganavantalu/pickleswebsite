"use client";

/** Popular destinations where Indians live and work — shown as flag emojis in the shipping bar. */
const SHIPPING_FLAGS = [
  { flag: "🇺🇸", label: "USA" },
  { flag: "🇬🇧", label: "United Kingdom" },
  { flag: "🇦🇪", label: "UAE" },
  { flag: "🇨🇦", label: "Canada" },
  { flag: "🇸🇦", label: "Saudi Arabia" },
  { flag: "🇦🇺", label: "Australia" },
  { flag: "🇸🇬", label: "Singapore" },
  { flag: "🇶🇦", label: "Qatar" },
  { flag: "🇩🇪", label: "Germany" },
  { flag: "🇳🇿", label: "New Zealand" },
  { flag: "🇰🇼", label: "Kuwait" },
  { flag: "🇴🇲", label: "Oman" },
  { flag: "🇮🇪", label: "Ireland" },
  { flag: "🇲🇾", label: "Malaysia" },
  { flag: "🇫🇷", label: "France" },
  { flag: "🇮🇹", label: "Italy" },
  { flag: "🇯🇵", label: "Japan" },
  { flag: "🇿🇦", label: "South Africa" },
] as const;

const MARQUEE_TEXT = "Worldwide shipping available at Best prices";

function MarqueeContent() {
  return (
    <>
      {SHIPPING_FLAGS.map(({ flag, label }) => (
        <span key={label} className="shipping-marquee-flag" role="img" aria-label={label}>
          {flag}
        </span>
      ))}
      <span className="shipping-marquee-text">{MARQUEE_TEXT}</span>
    </>
  );
}

export default function ShippingFlagsMarquee() {
  return (
    <div
      className="shipping-marquee-bar border-t border-white/10 bg-brand-dark"
      aria-label="Worldwide shipping to popular countries"
    >
      <div className="shipping-marquee-viewport">
        <div className="shipping-marquee-track">
          <div className="shipping-marquee-group" aria-hidden="false">
            <MarqueeContent />
          </div>
          <div className="shipping-marquee-group" aria-hidden="true">
            <MarqueeContent />
          </div>
        </div>
      </div>
    </div>
  );
}
