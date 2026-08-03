"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { useBetaBannerVisible } from "@/components/layout/site-beta-banner";
import { getContextualWhatsAppHref } from "@/lib/whatsapp-context";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp CTA (end side). Keeps clear of a11y toolbar (start)
 * and bottom bars via safe-area offset.
 */
export function WhatsAppFloat() {
  const pathname = usePathname() || "/";
  const betaOpen = useBetaBannerVisible();

  if (
    pathname === "/contact" ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  const href = getContextualWhatsAppHref({ pathname });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed end-3 z-[90] inline-flex min-h-12 items-center gap-2 border border-[#25D366]/40 bg-[#25D366] px-3.5 py-2.5 text-sm font-medium text-white shadow-float transition hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:end-4",
        betaOpen
          ? "bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
      )}
      aria-label="שלח הודעה בוואטסאפ"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">וואטסאפ</span>
    </a>
  );
}
