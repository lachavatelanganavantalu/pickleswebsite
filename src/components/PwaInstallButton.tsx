"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export default function PwaInstallButton() {
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintText, setHintText] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    setIos(isIosDevice());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setStandalone(true);
      setHintOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!hintOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setHintOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [hintOpen]);

  const showHint = useCallback((text: string) => {
    setHintText(text);
    setHintOpen(true);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === "accepted") setStandalone(true);
      return;
    }

    if (ios) {
      showHint("Tap Share, then choose “Add to Home Screen”.");
      return;
    }

    showHint("Open your browser menu and choose “Install app” or “Add to Home screen”.");
  };

  if (standalone) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => void handleInstall()}
        className="flex h-10 min-w-[2.5rem] items-center justify-center gap-1 rounded-lg px-1.5 text-white hover:bg-white/10 sm:h-11 sm:min-w-0 sm:px-2"
        aria-label="Install app"
        aria-expanded={hintOpen}
      >
        <Download className="h-[clamp(1rem,3.2vw,1.125rem)] w-[clamp(1rem,3.2vw,1.125rem)]" strokeWidth={2.25} />
        <span className="hidden min-[420px]:inline text-[clamp(0.5625rem,2vw,0.625rem)] font-bold uppercase tracking-[0.1em]">
          Install
        </span>
      </button>

      {hintOpen && (
        <div
          role="dialog"
          aria-label="Install instructions"
          className="absolute right-0 top-full z-[60] mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-white/20 bg-brand-dark p-3 text-left shadow-lg"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs leading-relaxed text-white/90">{hintText}</p>
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              className="shrink-0 rounded p-0.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
