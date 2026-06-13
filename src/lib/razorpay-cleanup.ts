/** Remove Razorpay modal/backdrop left in the DOM after SPA navigation. */
export function cleanupRazorpayCheckout(): void {
  if (typeof document === "undefined") return;

  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.documentElement.style.overflow = "";

  const removeNode = (node: Element | null | undefined) => {
    if (!node) return;
    node.remove();
  };

  document.querySelectorAll(".razorpay-container").forEach((el) => {
    removeNode(el);
  });

  document.querySelectorAll('[class*="razorpay"]').forEach((el) => {
    if (el instanceof HTMLElement && el.classList.contains("razorpay-container")) {
      removeNode(el);
    }
  });

  document.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.getAttribute("src") ?? "";
    const name = iframe.getAttribute("name") ?? "";
    if (
      src.includes("razorpay.com") ||
      name.includes("razorpay") ||
      name === "checkout-frame"
    ) {
      removeNode(iframe.closest(".razorpay-container") ?? iframe);
    }
  });

  document.querySelectorAll("div[style*='z-index']").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const z = Number.parseInt(el.style.zIndex || "0", 10);
    if (z >= 100000 && el.querySelector("iframe")) {
      removeNode(el);
    }
  });
}

export function navigateAfterRazorpayPayment(url: string): void {
  cleanupRazorpayCheckout();
  window.setTimeout(() => {
    cleanupRazorpayCheckout();
    window.location.assign(url);
  }, 50);
}
