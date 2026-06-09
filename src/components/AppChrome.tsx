"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import AdityaAssistant from "@/components/aditya/AdityaAssistant";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-dvh flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
      <BottomNav />
      <AdityaAssistant />
      <WhatsAppButton />
    </>
  );
}
