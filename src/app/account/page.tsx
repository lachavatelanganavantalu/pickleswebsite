import { Suspense } from "react";
import AccountPageClient from "@/components/account/AccountPageClient";

export const metadata = {
  title: "My account",
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="app-content py-20 text-center text-sm text-muted">Loading…</div>
      }
    >
      <AccountPageClient />
    </Suspense>
  );
}
