"use client";

import WhatsAppIcon from "@/components/WhatsAppIcon";

const WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "919505009699";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="whatsapp-fab"
    >
      <WhatsAppIcon />
    </a>
  );
}
