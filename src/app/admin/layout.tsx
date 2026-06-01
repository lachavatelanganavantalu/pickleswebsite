import type { Metadata, Viewport } from "next";
import AdminPwaRegister from "@/components/admin/AdminPwaRegister";

export const viewport: Viewport = {
  themeColor: "#1c1917",
};

export const metadata: Metadata = {
  title: {
    default: "Lachava Admin",
    template: "%s | Lachava Admin",
  },
  description: "Admin — orders, products, analytics, and settings",
  manifest: "/admin-manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lachava Admin",
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminPwaRegister />
      {children}
    </>
  );
}
