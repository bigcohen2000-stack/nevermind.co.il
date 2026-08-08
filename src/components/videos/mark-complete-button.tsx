"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { markVideoCompleted } from "@/actions/video-completions";
import { markLocalVideoCompleted } from "@/lib/videos/completions-local";
import { clearLocalVideoProgress } from "@/lib/videos/progress-local";
import { cn } from "@/lib/utils";

type MarkCompleteButtonProps = {
  youtubeId: string;
  initialCompleted?: boolean;
  isAuthenticated?: boolean;
  className?: string;
};

/**
 * Optimistic "סמן כהושלם" under the watch player.
 */
export function MarkCompleteButton({
  youtubeId,
  initialCompleted = false,
  isAuthenticated = false,
  className,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();
  const completed = optimistic ?? initialCompleted;

  function onMark() {
    if (completed || pending) return;
    setOptimistic(true);
    markLocalVideoCompleted(youtubeId);
    clearLocalVideoProgress(youtubeId);

    if (!isAuthenticated) {
      router.push("/my-list");
      return;
    }

    startTransition(async () => {
      const result = await markVideoCompleted(youtubeId);
      if (!result.ok) {
        setOptimistic(false);
        if (result.needsAuth) router.push("/my-list");
        return;
      }
      router.refresh();
    });
  }

  if (completed) {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted",
          className,
        )}
      >
        <CheckCircle2 className="size-3.5 text-action" aria-hidden="true" />
        הושלם
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onMark}
      disabled={pending}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 border border-foreground/20 bg-transparent px-3 text-xs font-medium text-foreground transition hover:border-action hover:text-action disabled:opacity-60",
        className,
      )}
    >
      <CheckCircle2 className="size-3.5" aria-hidden="true" />
      סמן כהושלם
    </button>
  );
}
