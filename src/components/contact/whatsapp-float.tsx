"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { useWhatsAppTopic } from "@/components/contact/whatsapp-topic-context";
import { getContextualWhatsAppHref } from "@/lib/whatsapp-context";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp CTA (end side). Clears a11y on start via corner convention.
 * Bottom offset from shared --nm-fab-offset-bottom (bars + safe-area).
 * On /watch uses published video title when available.
 */
export function WhatsAppFloat() {
  const pathname = usePathname() || "/";
  const { topic } = useWhatsAppTopic();

  if (
    pathname === "/contact" ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  const shortTopic =
    topic && topic.length > 80 ? `${topic.slice(0, 77)}...` : topic || undefined;
  const href = getContextualWhatsAppHref({
    pathname,
    topic: shortTopic,
  });
  const ariaLabel = shortTopic
    ? `וואטסאפ לגבי: ${shortTopic}`
    : "שלח הודעה בוואטסאפ";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "nm-fab-bottom fixed end-3 z-[90] inline-flex min-h-12 items-center gap-2 border border-[#25D366]/40 bg-[#25D366] px-3.5 py-2.5 text-sm font-medium text-white shadow-float transition hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:end-4",
      )}
      aria-label={ariaLabel}
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">וואטסאפ</span>
    </a>
  );
}
