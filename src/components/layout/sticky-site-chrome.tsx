"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const TOP_ALWAYS_SHOW = 48;
const SCROLL_DELTA = 8;

const StickyChromeLockContext = createContext<(locked: boolean) => void>(
  () => {},
);

/** Keep sticky chrome visible while mobile menu / search is open. */
export function useStickyChromeLock(locked: boolean) {
  const setLocked = useContext(StickyChromeLockContext);
  useEffect(() => {
    setLocked(locked);
    return () => setLocked(false);
  }, [locked, setLocked]);
}

/**
 * Sticky top chrome: auto-hides on scroll down, returns on scroll up.
 * Near page top always visible. Locked open when overlays need it.
 */
export function StickySiteChrome({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const setLockedStable = useCallback((value: boolean) => {
    setLocked(value);
  }, []);

  useEffect(() => {
    if (locked) setHidden(false);
  }, [locked]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (locked || y <= TOP_ALWAYS_SHOW) {
          setHidden(false);
        } else if (y > lastY + SCROLL_DELTA) {
          setHidden(true);
        } else if (y < lastY - SCROLL_DELTA) {
          setHidden(false);
        }
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [locked]);

  return (
    <StickyChromeLockContext.Provider value={setLockedStable}>
      <div
        className={cn(
          "sticky top-0 z-50 transition-transform duration-200 ease-out will-change-transform",
          hidden ? "-translate-y-full pointer-events-none" : "translate-y-0",
        )}
        aria-hidden={hidden ? true : undefined}
      >
        {children}
      </div>
    </StickyChromeLockContext.Provider>
  );
}
