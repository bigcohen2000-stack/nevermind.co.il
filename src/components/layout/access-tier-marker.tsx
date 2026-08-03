"use client";

import { useEffect } from "react";

import type { SiteAccessTier } from "@/lib/access/site-tier";

type AccessTierMarkerProps = {
  tier: SiteAccessTier;
};

/**
 * Sets html[data-access] for CSS chrome. Server cannot mutate root <html> from site layout.
 */
export function AccessTierMarker({ tier }: AccessTierMarkerProps) {
  useEffect(() => {
    const root = document.documentElement;
    if (tier === "guest") {
      root.removeAttribute("data-access");
      return;
    }
    root.setAttribute("data-access", tier);
    return () => {
      root.removeAttribute("data-access");
    };
  }, [tier]);

  return null;
}
