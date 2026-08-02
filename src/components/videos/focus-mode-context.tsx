"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type FocusModeContextValue = {
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
};

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusModeState] = useState(false);
  const pathname = usePathname() ?? "/";

  const setFocusMode = useCallback((value: boolean) => {
    setFocusModeState(value);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusModeState((v) => !v);
  }, []);

  // Leave focus mode when navigating away from watch.
  useEffect(() => {
    if (!pathname.startsWith("/watch")) {
      setFocusModeState(false);
    }
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (focusMode) {
      root.dataset.focusMode = "true";
    } else {
      delete root.dataset.focusMode;
    }
    return () => {
      delete root.dataset.focusMode;
    };
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFocusModeState(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  const value = useMemo(
    () => ({ focusMode, setFocusMode, toggleFocusMode }),
    [focusMode, setFocusMode, toggleFocusMode],
  );

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode(): FocusModeContextValue {
  const ctx = useContext(FocusModeContext);
  if (!ctx) {
    return {
      focusMode: false,
      setFocusMode: () => undefined,
      toggleFocusMode: () => undefined,
    };
  }
  return ctx;
}
