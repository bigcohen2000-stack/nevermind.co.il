"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

const SCROLL_SHOW_AT = 120;

/**
 * Mobile conversion bar: crawlable Link to /contact, shown after scroll.
 * Hidden on md+ and on the contact page itself.
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > SCROLL_SHOW_AT);
  });

  if (pathname === "/contact") {
    return null;
  }

  return (
    <motion.div
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
