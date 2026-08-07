"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

import { useBetaBannerVisible } from "@/components/layout/site-beta-banner";
import { useFabBarContribution } from "@/components/layout/use-fab-bar-contribution";
import type { SiteAccessTier } from "@/lib/access/site-tier";
import { getTierCtaBundle } from "@/lib/access/tier-cta";

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

type MobileCtaBarProps = {
  accessTier?: SiteAccessTier;
};

/**
 * Mobile conversion bar by access tier.
 * Shown after scroll. Hidden on md+, reading pages, contact, members access, or dismiss.
 * On /watch it stays available (highest upgrade intent).
 */
export function MobileCtaBar({ accessTier = "guest" }: MobileCtaBarProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const betaOpen = useBetaBannerVisible();
  const { scrollY } = useScroll();
  const bundle = getTierCtaBundle(accessTier);

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

  const onMembersAccess =
    pathname === "/members" || Boolean(pathname?.startsWith("/members/"));
  const onProfileAuth =
    pathname === "/profile" || pathname === "/welcome";
  const blocked =
    pathname === "/contact" ||
    onMembersAccess ||
    onProfileAuth ||
    betaOpen ||
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
          href={bundle.primary.href}
          className="btn btn-primary min-h-12 min-w-0 flex-1"
          aria-label={bundle.primary.label}
          tabIndex={visible ? undefined : -1}
        >
          {bundle.primary.label}
        </Link>
        {bundle.secondary ? (
          <Link
            href={bundle.secondary.href}
            className="btn btn-secondary min-h-12 shrink-0 border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
            aria-label={bundle.secondary.label}
            tabIndex={visible ? undefined : -1}
          >
            {bundle.secondary.label}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 border border-white/20 px-3 py-2 text-xs text-white/80 transition hover:border-white/40 hover:text-white"
          aria-label="הסתרת סרגל פעולה"
          tabIndex={visible ? undefined : -1}
        >
          הסתר
        </button>
      </div>
    </motion.div>
  );
}
