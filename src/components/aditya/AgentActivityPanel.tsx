"use client";

export function AdityaBrandFooter({
  brandLabel = "powered by ADITYA",
  brandTagline = "Agentic Deterministic Interface for Tasks, Yield and Access",
}: {
  brandLabel?: string;
  brandTagline?: string;
}) {
  return (
    <footer className="aditya-brand-footer" aria-label="ADITYA">
      <div className="aditya-brand-label">{brandLabel}</div>
      <div className="aditya-brand-tagline">{brandTagline}</div>
    </footer>
  );
}
