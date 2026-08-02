"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type UpNextVideo = {
  youtubeId: string;
  title: string;
  thumbnailUrl: string | null;
  sharedConcept?: string | null;
};

type UpNextOverlayProps = {
  next: UpNextVideo;
  seconds?: number;
  onCancel: () => void;
};

const DEFAULT_COUNTDOWN = 10;

/**
 * Overlay after a video ends: shows the next concept-related video
 * and auto-navigates after a short countdown (Cancel to stay).
 */
export function UpNextOverlay({
  next,
  seconds = DEFAULT_COUNTDOWN,
  onCancel,
}: UpNextOverlayProps) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);
  const href = `/watch/${next.youtubeId}`;
  const thumb =
    next.thumbnailUrl ??
    `https://i.ytimg.com/vi/${next.youtubeId}/hqdefault.jpg`;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds, next.youtubeId]);

  useEffect(() => {
    if (remaining <= 0) {
      router.push(href);
      return;
    }
    const timer = window.setTimeout(() => {
      setRemaining((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [remaining, href, router]);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-labelledby="up-next-title"
      aria-describedby="up-next-countdown"
    >
      <div className="w-full max-w-md border border-background/20 bg-background p-5 text-foreground shadow-[var(--shadow-soft)] sm:p-6">
        <p className="text-xs font-medium tracking-wide text-action">
          הבא בתור
        </p>
        <h3
          id="up-next-title"
          className="mt-2 text-lg font-semibold tracking-tight sm:text-xl"
        >
          הסרטון הבא
        </h3>
        {next.sharedConcept ? (
          <p className="mt-1 text-sm text-foreground/70">
            אותו מושג: {next.sharedConcept}
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-5 flex gap-4 text-foreground no-underline hover:no-underline"
        >
          <div className="relative h-20 w-36 shrink-0 overflow-hidden bg-paper">
            <Image
              src={thumb}
              alt=""
              fill
              className="object-cover"
              sizes="144px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug tracking-tight">
              {next.title}
            </p>
            <p
              id="up-next-countdown"
              className="mt-2 text-sm text-foreground/70"
              aria-live="polite"
            >
              מתחיל בעוד {remaining} שנ׳
            </p>
          </div>
        </Link>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={href} className="btn btn-primary">
            לנגן עכשיו
          </Link>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
