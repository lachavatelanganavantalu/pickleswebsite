import { Suspense } from "react";
import TrackOrderPage from "./TrackOrderPageClient";

export const metadata = {
  title: "Track order",
};

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <p className="app-content py-16 text-center text-muted">Loading track order…</p>
      }
    >
      <TrackOrderPage />
    </Suspense>
  );
}
