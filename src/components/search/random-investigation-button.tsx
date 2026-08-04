"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getRandomInvestigation } from "@/actions/random-investigation";
import { InfoTip } from "@/components/ui/info-tip";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { INFO_TIPS } from "@/lib/content/info-tips";
import { cn } from "@/lib/utils";

type RandomInvestigationButtonProps = {
  className?: string;
  variant?: "light" | "dark";
  /** Public videos eligible for random pick. Omit or 0 hides the count. */
  videoCount?: number;
};

/**
 * Hero serendipity CTA: Server Action picks a random video (+ optional ?t=),
 * then client navigates instantly to /watch/[id].
 */
export function RandomInvestigationButton({
  className,
  variant = "light",
  videoCount,
}: RandomInvestigationButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await getRandomInvestigation();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(result.href);
    });
  };

  const showCount = typeof videoCount === "number" && videoCount > 0;
  const countLabel = showCount
    ? `חקירות אקראיות · ${videoCount.toLocaleString("he-IL")} סרטונים`
    : "חקירות אקראיות";
  const tipTone = variant === "dark" ? "dark" : "light";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
        <ShimmerButton
          onClick={onClick}
          disabled={pending}
          aria-busy={pending}
          className={cn(
            variant === "dark" &&
              "border-white/30 bg-white text-black hover:border-action focus-visible:ring-offset-black",
          )}
        >
          {pending ? "בוחר חקירה..." : "חקירה אקראית"}
        </ShimmerButton>
        <p
          className={cn(
            "inline-flex items-center gap-1 text-xs leading-snug sm:text-sm",
            variant === "dark" ? "text-white/70" : "text-muted",
          )}
        >
          <span>{countLabel}</span>
          <InfoTip label={INFO_TIPS.random.label} tone={tipTone}>
            {INFO_TIPS.random.text}
          </InfoTip>
        </p>
      </div>
      {error ? (
        <p
          role="status"
          className={cn(
            "text-xs",
            variant === "dark" ? "text-white/70" : "text-muted",
          )}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
