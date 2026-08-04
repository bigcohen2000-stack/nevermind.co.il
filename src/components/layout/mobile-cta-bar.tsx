"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

import { useBetaBannerVisible } from "@/components/layout/site-beta-banner";
import { useFabBarContribution } from "@/components/layout/use-fab-bar-contribution";

const SCROLL_SHOW_AT = 120;

/**
 * Mobile conversion bar: crawlable Link to /contact, shown after scroll.
 * Hidden on md+, contact, /watch, and while the beta report bar is open.
 * Publishes height into --nm-fab-bar while slid in.
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);
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

  const onWatch =
    pathname === "/watch" || Boolean(pathname?.startsWith("/watch/"));
  const blocked =
    pathname === "/contact" || betaOpen || onWatch || isMdUp;
  const active = visible && !blocked;
  const barRef = useFabBarContribution<HTMLDivElement>("cta", active);

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
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link
          href="/contact?from=mobile-cta"
          className="btn btn-primary min-h-12 w-full"
          aria-label="יצירת קשר"
          tabIndex={visible ? undefined : -1}
        >
          ליצירת קשר
        </Link>
      </div>
    </motion.div>
  );
}
