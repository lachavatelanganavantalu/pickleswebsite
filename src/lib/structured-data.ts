import type { ComboPack } from "@/data/combos";
import { HOME_FAQ } from "@/data/faq";
import { BRAND } from "@/data/brand";
import { SOCIAL_LINKS } from "@/data/social-links";
import { getProductDetails } from "@/data/product-details";
import { productSummary } from "@/lib/product-copy";
import { SITE_CONTACT } from "@/lib/site-contact";
import { getSiteUrl } from "@/lib/site-url";
import { CATEGORY_LABELS, PickleProduct } from "@/types/product";

const siteUrl = () => getSiteUrl();

export function organizationJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: SITE_CONTACT.businessName,
    alternateName: SITE_CONTACT.businessNameTe,
    url,
    logo: `${url}${BRAND.logo}`,
    image: `${url}${BRAND.ogImage}`,
    email: SITE_CONTACT.email,
    telephone: SITE_CONTACT.phoneTel,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONTACT.addressLocality,
      addressRegion: SITE_CONTACT.addressRegion,
      addressCountry: SITE_CONTACT.addressCountry,
    },
    sameAs: [SOCIAL_LINKS.youtube, SOCIAL_LINKS.instagram].filter(Boolean),
  };
}

export function storeJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${url}/#store`,
    name: SITE_CONTACT.businessName,
    alternateName: SITE_CONTACT.businessNameTe,
    url,
    image: `${url}${BRAND.ogImage}`,
    logo: `${url}${BRAND.logo}`,
    telephone: SITE_CONTACT.phoneTel,
    email: SITE_CONTACT.email,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONTACT.addressLocality,
      addressRegion: SITE_CONTACT.addressRegion,
      addressCountry: SITE_CONTACT.addressCountry,
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "FSSAI Food Business License",
      identifier: SITE_CONTACT.fssaiLicenseNumber,
    },
    parentOrganization: { "@id": `${url}/#organization` },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function webSiteJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: SITE_CONTACT.businessName,
    url,
    publisher: { "@id": `${url}/#organization` },
  };
}

function productImageUrl(product: PickleProduct) {
  const base = siteUrl();
  const path = product.imagePath?.startsWith("/")
    ? product.imagePath
    : `/products/${product.slug}.jpg`;
  return `${base}${path}`;
}

function offerAvailability(available: boolean) {
  return available
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export function productJsonLd(product: PickleProduct) {
  const url = siteUrl();
  const productUrl = `${url}/products/${product.slug}`;
  const offers = product.weightOptions.map((w) => ({
    "@type": "Offer",
    sku: `${product.slug}-${w.id}`,
    name: w.label,
    price: w.priceINR,
    priceCurrency: "INR",
    availability: offerAvailability(product.available),
    url: productUrl,
    seller: { "@id": `${url}/#store` },
  }));

  const primarySku = `${product.slug}-${product.weightOptions[0]?.id ?? "default"}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    sku: primarySku,
    description: `${productSummary(product)} Ingredients: ${getProductDetails(product.id, product.name).ingredients}`,
    image: productImageUrl(product),
    url: productUrl,
    category: CATEGORY_LABELS[product.category],
    brand: { "@id": `${url}/#organization` },
    offers: offers.length === 1 ? offers[0] : offers,
  };
}

export function comboProductJsonLd(combo: ComboPack) {
  const url = siteUrl();
  const comboUrl = `${url}/combos`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${comboUrl}#${combo.id}`,
    name: combo.name,
    description: combo.description,
    url: comboUrl,
    brand: { "@id": `${url}/#organization` },
    offers: {
      "@type": "Offer",
      price: combo.priceINR,
      priceCurrency: "INR",
      availability: offerAvailability(combo.available !== false),
      url: comboUrl,
      seller: { "@id": `${url}/#store` },
    },
  };
}

export function itemListJsonLd(
  products: PickleProduct[],
  listUrl: string,
  listName: string
) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    url: `${url}${listUrl}`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${url}/products/${product.slug}`,
    })),
  };
}

export function offerCatalogJsonLd(products: PickleProduct[], combos: ComboPack[]) {
  const url = siteUrl();
  const pickleOffers = products.flatMap((product) =>
    product.weightOptions.map((w) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: `${product.name} (${w.label})`,
        url: `${url}/products/${product.slug}`,
      },
      price: w.priceINR,
      priceCurrency: "INR",
      availability: offerAvailability(product.available),
    }))
  );

  const comboOffers = combos.map((combo) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Product",
      name: combo.name,
      url: `${url}/combos`,
    },
    price: combo.priceINR,
    priceCurrency: "INR",
    availability: offerAvailability(combo.available !== false),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `${SITE_CONTACT.businessName} — official menu prices`,
    url: `${url}/pricing`,
    itemListElement: [...pickleOffers, ...comboOffers],
  };
}
