"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getRandomInvestigation } from "@/actions/random-investigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

type RandomInvestigationButtonProps = {
  className?: string;
  variant?: "light" | "dark";
};

/**
 * Hero serendipity CTA: Server Action picks a random video (+ optional ?t=),
 * then client navigates instantly to /watch/[id].
 */
export function RandomInvestigationButton({
  className,
  variant = "light",
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

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
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
