/** Remove Razorpay modal/backdrop that blocks clicks after checkout. */
export function cleanupRazorpayCheckout(): void {
  if (typeof document === "undefined") return;

  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.documentElement.style.overflow = "";
  document.body.classList.remove("razorpay-prevent-scroll");

  const remove = (node: Element | null | undefined) => {
    node?.remove();
  };

  document
    .querySelectorAll(
      ".razorpay-container, .razorpay-backdrop, .razorpay-checkout-frame, .razorpay-overlay, [class*='razorpay']"
    )
    .forEach((el) => remove(el));

  document.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.getAttribute("src") ?? "";
    const name = iframe.getAttribute("name") ?? "";
    if (
      src.includes("razorpay.com") ||
      name.includes("razorpay") ||
      name === "checkout-frame"
    ) {
      remove(iframe.closest(".razorpay-container") ?? iframe.parentElement ?? iframe);
    }
  });

  document.body.querySelectorAll(":scope > div").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.id === "__next" || el.dataset.reactRoot !== undefined) return;
    const style = getComputedStyle(el);
    if (style.position !== "fixed") return;
    const z = Number.parseInt(style.zIndex || "0", 10);
    const fullScreen =
      el.offsetWidth >= window.innerWidth * 0.9 &&
      el.offsetHeight >= window.innerHeight * 0.9;
    if (z >= 1000 || (fullScreen && el.querySelector("iframe"))) {
      remove(el);
    }
  });
}

export function navigateAfterRazorpayPayment(url: string): void {
  cleanupRazorpayCheckout();

  const target = typeof window !== "undefined" ? window.top ?? window : null;
  if (!target) return;

  window.setTimeout(() => {
    cleanupRazorpayCheckout();
    target.location.replace(url);
  }, 250);
}

export function startRazorpayOverlayWatch(durationMs = 4000): () => void {
  cleanupRazorpayCheckout();
  const started = Date.now();
  const id = window.setInterval(() => {
    cleanupRazorpayCheckout();
    if (Date.now() - started >= durationMs) {
      window.clearInterval(id);
    }
  }, 150);
  return () => window.clearInterval(id);
}
