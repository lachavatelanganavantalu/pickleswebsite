import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AppChrome from "@/components/AppChrome";
import { BRAND } from "@/data/brand";

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#4a2c1a",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lachava.vercel.app"
  ),
  title: {
    default: "Lachava | Telangana Vantalu",
    template: "%s | Lachava",
  },
  description:
    "లచ్చవ్వ తెలంగాణ వంటల — 10 pickles (1 kg & 1/2 kg). 5-pickle combo ₹999. PhonePe / GPay 63021 12848.",
  icons: {
    icon: BRAND.favicon,
  },
  openGraph: {
    title: "Lachava Telangana Vantalu",
    description: "లచ్చవ్వ తెలంగాణ వంటల — official pickle menu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrument.variable} ${jakarta.variable}`}>
      <body className="antialiased bg-surface text-ink">
        <Providers>
          <div className="app-shell">
            <AppChrome>{children}</AppChrome>
          </div>
        </Providers>
      </body>
    </html>
  );
}
