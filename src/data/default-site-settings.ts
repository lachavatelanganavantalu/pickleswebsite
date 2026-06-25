import { SiteSettings } from "@/types/site-settings";
import { BRAND } from "@/data/brand";

export const defaultSiteSettings: SiteSettings = {
  hero: {
    badge: { en: BRAND.nameFull, te: BRAND.nameTe },
    title: {
      en: "Pickles — official menu",
      te: "పచ్చళ్ళు — అధికారిక మెనూ",
    },
    subtitle: {
      en: "10 pickles (1 kg & 1/2 kg). 5-pickle combo ₹999. PhonePe / GPay 63021 12848.",
      te: "10 రకాల పచ్చళ్ళు (1 kg & 1/2 kg). 5 పికిల్స్ కాంబో ₹999. PhonePe / GPay 63021 12848.",
    },
    ctaVeg: { en: "Shop pickles", te: "పచ్చళ్ళు కొనండి" },
    ctaNonVeg: { en: "Combo ₹999", te: "కాంబో ₹999" },
  },
  story: {
    title: { en: BRAND.nameTe, te: BRAND.nameTe },
    subtitle: { en: "Thank you for visiting our page", te: "మా పేజీని సందర్శించినందుకు ధన్యవాదాలు" },
    body1: {
      en: "Order pickles by the jar — prices as listed. Combo: 5 jars (250g each) for ₹999.",
      te: "జార్‌లో పచ్చళ్ళు ఆర్డర్ చేయండి — ధరలు జాబితా ప్రకారం. కాంబో: 5 జార్లు (250g) ₹999.",
    },
    body2: {
      en: "PhonePe / GPay: 63021 12848",
      te: "PhonePe / GPay: 63021 12848",
    },
  },
  contact: {
    phone: "+91 63021 12848",
    whatsapp: "916302112848",
    email: "",
    address: {
      en: "Telangana",
      te: "తెలంగాణ",
    },
  },
  social: {
    instagram:
      "https://www.instagram.com/lachava.telanganavontallu?igsh=MXIwNDFpZDV2cnpoNg==",
    facebook: "",
    youtube: "https://www.youtube.com/@Lachava.telanganavontallu",
  },
  announcement: {
    en: "⭐ 5 pickles combo — ₹999 (Chicken, Chinthankaya, Mango, Usirikaya, Lemon · 250g each)",
    te: "⭐ 5 పికిల్స్ కాంబో — ₹999 (చికెన్, చింతకాయ, మామిడికాయ, ఉసిరికాయ, నిమ్మకాయ · 250g)",
  },
  payment: {
    upiId: "",
    upiPhone: "63021 12848",
    qrImagePath: "/api/payment-qr",
    payeeName: BRAND.payeeName,
    showQrPayment: true,
  },
};
