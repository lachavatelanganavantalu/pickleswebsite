export type Locale = "en" | "te";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  te: "తెలుగు",
};

type Messages = Record<string, { en: string; te: string }>;

export const messages: Messages = {
  "nav.pickles": { en: "Pickles", te: "పచ్చళ్ళు" },
  "nav.combos": { en: "Combo", te: "కాంబో" },
  "nav.contact": { en: "Contact", te: "సంప్రదించండి" },
  "nav.shop": { en: "Shop", te: "కొనండి" },
  "nav.cart": { en: "Cart", te: "బస్కెట్" },

  "hero.badge": { en: "Lachava Telangana Pickles", te: "లచ్చవ్వ తెలంగాణ వంటల" },
  "hero.title": {
    en: "Pickles — official menu",
    te: "పచ్చళ్ళు — అధికారిక మెనూ",
  },
  "hero.subtitle": {
    en: "10 pickles (1 kg & 1/2 kg). 5-pickle combo ₹999. PhonePe / GPay 63021 12848.",
    te: "10 రకాల పచ్చళ్ళు. 5 పికిల్స్ కాంబో ₹999. PhonePe / GPay 63021 12848.",
  },
  "hero.ctaShop": { en: "Shop pickles", te: "పచ్చళ్ళు కొనండి" },
  "hero.ctaCombo": { en: "Combo ₹999", te: "కాంబో ₹999" },

  "home.combos": { en: "Combo offer", te: "కాంబో ఆఫర్" },

  "product.outOfStock": { en: "Out of stock", te: "స్టాక్ అయిపోయింది" },
  "product.addToCart": { en: "Add to cart", te: "బస్కెట్‌లో వేయండి" },
  "product.selectWeight": { en: "Choose size", te: "సైజ్ ఎంచుకోండి" },

  "cart.title": { en: "Your cart", te: "మీ బస్కెట్" },
  "cart.empty": { en: "Your cart is empty", te: "బస్కెట్ ఖాళీగా ఉంది" },
  "cart.checkout": { en: "Checkout", te: "ఆర్డర్ చేయండి" },
  "cart.continue": { en: "Continue shopping", te: "ఇంకా కొనండి" },
  "cart.total": { en: "Total", te: "మొత్తం" },

  "checkout.title": { en: "Checkout", te: "ఆర్డర్" },
  "checkout.placeOrder": { en: "Place order", te: "ఆర్డర్ పెట్టండి" },
  "checkout.demoNote": {
    en: "Demo mode — order is marked paid instantly (no Razorpay).",
    te: "డెమో మోడ్ — Razorpay లేకుండా ఆర్డర్ వెంటనే paid అవుతుంది.",
  },
  "checkout.liveNote": {
    en: "Secure payment via Razorpay.",
    te: "Razorpay ద్వారా సురక్షిత చెల్లింపు.",
  },

  "success.title": { en: "Order confirmed", te: "ఆర్డర్ నిర్ధారించబడింది" },
  "success.thanks": { en: "Thank you", te: "ధన్యవాదాలు" },

  "listing.all": { en: "All pickles", te: "అన్ని పచ్చళ్ళు" },
  "listing.allSub": {
    en: "Prices per 1 kg and 1/2 kg — as on our page",
    te: "1 kg మరియు 1/2 kg ధరలు — మా పేజీ ప్రకారం",
  },

  "admin.dashboard": { en: "Dashboard", te: "డాష్‌బోర్డ్" },
  "admin.orders": { en: "Orders", te: "ఆర్డర్‌లు" },
  "admin.products": { en: "Products", te: "ఉత్పత్తులు" },
  "admin.combos": { en: "Combos", te: "కాంబోలు" },
  "admin.settings": { en: "Site settings", te: "సైట్ సెట్టింగ్‌లు" },
};

export function t(key: string, locale: Locale): string {
  const entry = messages[key];
  if (!entry) return key;
  return entry[locale];
}
