"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { toggleLiveVideoLike } from "@/actions/live-votes";
import { cn } from "@/lib/utils";

type LiveLikeButtonProps = {
  videoId: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
  className?: string;
};

/**
 * Like / unlike a LIVE archive candidate. Auth required.
 */
export function LiveLikeButton({
  videoId,
  initialCount,
  initialLiked,
  isAuthenticated,
  className,
}: LiveLikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Link
        href="/live#live-auth"
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 border border-foreground/15 px-3 text-sm text-foreground/80 no-underline transition hover:border-action hover:text-action hover:no-underline",
          className,
        )}
      >
        <Heart className="size-3.5" aria-hidden />
        <span className="tabular-nums">{count}</span>
        <span className="text-xs text-muted">התחברות ללייק</span>
      </Link>
    );
  }

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <button
        type="button"
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "הסרת לייק" : "לייק לסרטון"}
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 border px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:opacity-60",
          liked
            ? "border-action bg-action/10 text-action"
            : "border-foreground/15 text-foreground/80 hover:border-action hover:text-action",
        )}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleLiveVideoLike(videoId);
            if (!result.ok) {
              setError(result.error);
              if (result.needsAuth) router.refresh();
              return;
            }
            setLiked(result.liked);
            setCount(result.likeCount);
            router.refresh();
          });
        }}
      >
        <Heart
          className="size-3.5"
          aria-hidden
          fill={liked ? "currentColor" : "none"}
        />
        <span className="tabular-nums">{count}</span>
        <span>{liked ? "אהבתי" : "לייק"}</span>
      </button>
      {error ? <p className="text-xs text-action">{error}</p> : null}
    </div>
  );
}
