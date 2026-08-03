"use client";

import { usePathname } from "next/navigation";

import { getContextualWhatsAppHref } from "@/lib/whatsapp-context";

/**
 * Discrete floating WhatsApp CTA with path-aware message text.
 * Hidden on contact (form already present) and on very small chrome pages.
 */
export function WhatsAppFloat() {
  const pathname = usePathname() || "/";

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
      className="fixed bottom-[4.75rem] end-4 z-40 hidden min-h-11 items-center border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground shadow-float hover:border-action hover:text-action md:inline-flex"
      aria-label="וואטסאפ לפי העמוד הנוכחי"
    >
      וואטסאפ
    </a>
  );
}
