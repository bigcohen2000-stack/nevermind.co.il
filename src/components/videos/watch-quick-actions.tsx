"use client";

import Link from "next/link";
import {
  Lock,
  Maximize2,
  MessageCircle,
  Share2,
  Library,
} from "lucide-react";

import { useFocusMode } from "@/components/videos/focus-mode-context";
import { cn } from "@/lib/utils";

type WatchQuickActionsProps = {
  title: string;
  shareUrl: string;
  isMembersOnly?: boolean;
  isEntitled?: boolean;
  className?: string;
};

/**
 * Compact interactive action row under the player.
 * Share, focus, club / library. Mobile-first tap targets.
 */
export function WatchQuickActions({
  title,
  shareUrl,
  isMembersOnly = false,
  isEntitled = false,
  className,
}: WatchQuickActionsProps) {
  const { focusMode, toggleFocusMode } = useFocusMode();

  async function onShare() {
    const absolute =
      typeof window !== "undefined"
        ? new URL(shareUrl, window.location.origin).toString()
        : shareUrl;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: absolute, text: `חקירה: ${title}` });
        return;
      }
    } catch {
      // Fall through to clipboard.
    }
    try {
      await navigator.clipboard.writeText(absolute);
    } catch {
      // Ignore.
    }
  }

  return (
    <div
      className={cn(
        "-mx-3 flex gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
        className,
      )}
      role="toolbar"
      aria-label="פעולות בסרטון"
    >
      <button
        type="button"
        onClick={onShare}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-foreground/15 bg-background px-3.5 text-sm transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        <Share2 className="size-4" aria-hidden />
        שיתוף
      </button>

      <button
        type="button"
        onClick={toggleFocusMode}
        aria-pressed={focusMode}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-foreground/15 bg-background px-3.5 text-sm transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        <Maximize2 className="size-4" aria-hidden />
        מיקוד
      </button>

      {isEntitled ? (
        <Link
          href="/videos?filter=club"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-action/40 bg-action/5 px-3.5 text-sm text-action no-underline transition hover:border-action hover:no-underline"
        >
          <Library className="size-4" aria-hidden />
          למאגר
        </Link>
      ) : (
        <Link
          href={isMembersOnly ? "/members#login" : "/members"}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-action/40 bg-action/5 px-3.5 text-sm text-action no-underline transition hover:border-action hover:no-underline"
        >
          <Lock className="size-4" aria-hidden />
          מועדון
        </Link>
      )}

      <Link
        href="/contact"
        className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-foreground/15 bg-background px-3.5 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline"
      >
        <MessageCircle className="size-4" aria-hidden />
        קשר
      </Link>

      <Link
        href="/videos"
        className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-foreground/15 bg-background px-3.5 text-sm no-underline transition hover:border-action hover:text-action hover:no-underline"
      >
        סרטונים
      </Link>
    </div>
  );
}
