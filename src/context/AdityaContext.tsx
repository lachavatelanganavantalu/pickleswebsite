"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type SearchHandler = (query: string) => void;

type AdityaContextValue = {
  registerSearchHandler: (handler: SearchHandler) => () => void;
  openSearch: (query?: string) => void;
};

const AdityaContext = createContext<AdityaContextValue | null>(null);

export function AdityaProvider({ children }: { children: ReactNode }) {
  const searchHandlerRef = useRef<SearchHandler | null>(null);

  const registerSearchHandler = useCallback((handler: SearchHandler) => {
    searchHandlerRef.current = handler;
    return () => {
      if (searchHandlerRef.current === handler) {
        searchHandlerRef.current = null;
      }
    };
  }, []);

  const openSearch = useCallback((query = "") => {
    searchHandlerRef.current?.(query);
  }, []);

  const value = useMemo(
    () => ({ registerSearchHandler, openSearch }),
    [registerSearchHandler, openSearch],
  );

  return <AdityaContext.Provider value={value}>{children}</AdityaContext.Provider>;
}

export function useAditya() {
  const context = useContext(AdityaContext);
  if (!context) {
    throw new Error("useAditya must be used within AdityaProvider");
  }
  return context;
}
