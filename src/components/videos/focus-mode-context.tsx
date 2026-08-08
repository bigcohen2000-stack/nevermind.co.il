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

import {
  readUiPrefsClient,
  writeUiPrefsClient,
  type UiDensity,
  type UiPrefs,
} from "@/lib/ui/prefs";

type FocusModeContextValue = {
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
  density: UiDensity;
  setDensity: (value: UiDensity) => void;
};

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

type FocusModeProviderProps = {
  children: ReactNode;
  /** Server-read cookie prefs to avoid first-paint flicker. */
  initialPrefs?: UiPrefs;
};

export function FocusModeProvider({
  children,
  initialPrefs,
}: FocusModeProviderProps) {
  const pathname = usePathname() ?? "/";
  const onWatch = pathname.startsWith("/watch");

  const [focusOverride, setFocusOverride] = useState<boolean | null>(null);
  const [density, setDensityState] = useState<UiDensity>(
    initialPrefs?.density ?? "comfortable",
  );
  const [focusDefault, setFocusDefault] = useState(
    Boolean(initialPrefs?.focusDefault),
  );

  const effectiveFocus = onWatch
    ? (focusOverride ?? focusDefault)
    : false;

  const persist = useCallback((next: Partial<UiPrefs>) => {
    const current = readUiPrefsClient();
    const merged: UiPrefs = {
      focusDefault:
        typeof next.focusDefault === "boolean"
          ? next.focusDefault
          : current.focusDefault,
      density: next.density ?? current.density,
    };
    writeUiPrefsClient(merged);
  }, []);

  const setFocusMode = useCallback(
    (value: boolean) => {
      setFocusOverride(value);
      setFocusDefault(value);
      persist({ focusDefault: value });
    },
    [persist],
  );

  const toggleFocusMode = useCallback(() => {
    const next = !effectiveFocus;
    setFocusOverride(next);
    setFocusDefault(next);
    persist({ focusDefault: next });
  }, [effectiveFocus, persist]);

  const setDensity = useCallback(
    (value: UiDensity) => {
      setDensityState(value);
      persist({ density: value });
    },
    [persist],
  );

  useEffect(() => {
    const root = document.documentElement;
    if (effectiveFocus) {
      root.dataset.focusMode = "true";
    } else {
      delete root.dataset.focusMode;
    }
    return () => {
      delete root.dataset.focusMode;
    };
  }, [effectiveFocus]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = density;
    return () => {
      delete root.dataset.density;
    };
  }, [density]);

  useEffect(() => {
    if (!effectiveFocus) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFocusOverride(false);
        setFocusDefault(false);
        persist({ focusDefault: false });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [effectiveFocus, persist]);

  const value = useMemo(
    () => ({
      focusMode: effectiveFocus,
      setFocusMode,
      toggleFocusMode,
      density,
      setDensity,
    }),
    [effectiveFocus, setFocusMode, toggleFocusMode, density, setDensity],
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
      density: "comfortable",
      setDensity: () => undefined,
    };
  }
  return ctx;
}
