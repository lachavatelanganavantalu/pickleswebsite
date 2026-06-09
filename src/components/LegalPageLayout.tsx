import Link from "next/link";

type LegalPageLayoutProps = {
  label: string;
  title: string;
  children: React.ReactNode;
};

export default function LegalPageLayout({ label, title, children }: LegalPageLayoutProps) {
  return (
    <div className="app-content mx-auto max-w-3xl py-[clamp(1.5rem,5vw,3rem)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-shop-muted">{label}</p>
      <h1 className="shop-page-title mt-2">{title}</h1>
      <div className="mt-8 space-y-4 rounded-2xl border border-border bg-white p-6 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
      <p className="mt-6 text-sm text-muted">
        <Link href="/contact" className="font-semibold text-brand hover:underline">
          Contact us
        </Link>
        {" · "}
        <Link href="/" className="font-semibold text-brand hover:underline">
          Back to shop
        </Link>
      </p>
    </div>
  );
}
