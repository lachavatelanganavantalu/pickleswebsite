import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Pacifico, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AppChrome from "@/components/AppChrome";
import PwaRegister from "@/components/PwaRegister";
import { BRAND } from "@/data/brand";
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
    default: "Assal Heritage Pickles | Telangana Vantalu",
    template: "%s | Assal Heritage Pickles",
  },
  description:
    "అస్సల్ హెరిటేజ్ పచ్చళ్ళు — 10 pickles (1 kg & 1/2 kg). 5-pickle combo ₹999. PhonePe / GPay 95050 09699.",
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
    title: "Assal Heritage Pickles",
  },
  openGraph: {
    title: "Assal Heritage Pickles | Telangana Vantalu",
    description: "అస్సల్ హెరిటేజ్ పచ్చళ్ళు — official pickle menu",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: "Assal Heritage Pickles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assal Heritage Pickles | Telangana Vantalu",
    description: "అస్సల్ హెరిటేజ్ పచ్చళ్ళు — official pickle menu",
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
