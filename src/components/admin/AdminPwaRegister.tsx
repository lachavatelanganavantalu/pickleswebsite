"use client";

import { useEffect } from "react";

/** Registers the shared service worker when using the admin PWA manifest. */
export default function AdminPwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* optional */
    });
  }, []);

  return null;
}
