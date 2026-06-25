import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Pacifico, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AppChrome from "@/components/AppChrome";
import PwaRegister from "@/components/PwaRegister";
import {
  BRAND,
  BRAND_MENU_DESCRIPTION_EN,
  BRAND_MENU_DESCRIPTION_SHORT,
  BRAND_PAGE_TITLE,
} from "@/data/brand";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data";
import { getSiteUrl } from "@/lib/site-url";

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

/** Hero titles — playful script; i/j dots rendered as ♥ via HeartDotText */
const heroDisplay = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hero-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#4a2c1a",
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    types: {
      "application/aditya+connector+json": `${siteUrl}/.well-known/aditya-connector.json`,
    },
  },
  title: {
    default: BRAND_PAGE_TITLE,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND_MENU_DESCRIPTION_EN,
  icons: {
    icon: [
      { url: BRAND.favicon, sizes: "512x512", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: BRAND.appleTouchIcon, sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND.name,
  },
  openGraph: {
    title: BRAND_PAGE_TITLE,
    description: BRAND_MENU_DESCRIPTION_SHORT,
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: BRAND.nameFull,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_PAGE_TITLE,
    description: BRAND_MENU_DESCRIPTION_SHORT,
    images: [BRAND.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrument.variable} ${jakarta.variable} ${heroDisplay.variable}`}>
      <body className="antialiased bg-surface text-ink">
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        <Providers>
          <PwaRegister />
          <div className="app-shell">
            <AppChrome>{children}</AppChrome>
          </div>
        </Providers>
      </body>
    </html>
  );
}
