"use client";

import WhatsAppIcon from "@/components/WhatsAppIcon";
import { SITE_CONTACT } from "@/lib/site-contact";

const WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || SITE_CONTACT.whatsapp;

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
