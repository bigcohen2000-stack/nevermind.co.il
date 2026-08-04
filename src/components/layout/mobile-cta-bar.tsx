"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

import { useBetaBannerVisible } from "@/components/layout/site-beta-banner";
import { useFabBarContribution } from "@/components/layout/use-fab-bar-contribution";

const SCROLL_SHOW_AT = 120;
const DISMISS_KEY = "nm_mobile_cta_dismissed";

function isReadingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/articles" || pathname.startsWith("/articles/")) return true;
  if (pathname === "/concepts" || pathname.startsWith("/concepts/")) return true;
  if (
    pathname === "/mechanisms" ||
    pathname.startsWith("/mechanisms/")
  ) {
    return true;
  }
  if (pathname === "/privacy" || pathname === "/accessibility") return true;
  return false;
}

/**
 * Mobile conversion bar: crawlable Link to /contact, shown after scroll.
 * Hidden on md+, reading pages, contact, /watch, beta bar, or after dismiss.
 * Publishes height into --nm-fab-bar while slid in.
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const betaOpen = useBetaBannerVisible();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > SCROLL_SHOW_AT);
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const onWatch =
    pathname === "/watch" || Boolean(pathname?.startsWith("/watch/"));
  const blocked =
    pathname === "/contact" ||
    betaOpen ||
    onWatch ||
    isMdUp ||
    isReadingPath(pathname) ||
    dismissed;
  const active = visible && !blocked;
  const barRef = useFabBarContribution<HTMLDivElement>("cta", active);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  if (blocked) {
    return null;
  }

  return (
    <motion.div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-white/10 bg-black/75 backdrop-blur-lg md:hidden"
      initial={{ y: "100%" }}
      animate={{ y: visible ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.85 }}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link
          href="/contact?from=mobile-cta"
          className="btn btn-primary min-h-12 min-w-0 flex-1"
          aria-label="יצירת קשר"
          tabIndex={visible ? undefined : -1}
        >
          ליצירת קשר
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 border border-white/20 px-3 py-2 text-xs text-white/80 transition hover:border-white/40 hover:text-white"
          aria-label="הסתרת סרגל יצירת קשר"
          tabIndex={visible ? undefined : -1}
        >
          הסתר
        </button>
      </div>
    </motion.div>
  );
}
