"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getRandomClubVideo } from "@/actions/random-club-video";
import { cn } from "@/lib/utils";

type RandomClubButtonProps = {
  className?: string;
  variant?: "primary" | "secondary";
};

/**
 * After club login: jump to a random members-only video.
 */
export function RandomClubButton({
  className,
  variant = "primary",
}: RandomClubButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await getRandomClubVideo();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(result.href);
    });
  };

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-busy={pending}
        className={cn(
          "btn",
          variant === "primary" ? "btn-primary" : "btn-secondary",
        )}
      >
        {pending ? "בוחר סרטון..." : "סרטון אקראי מהמועדון"}
      </button>
      {error ? (
        <p role="status" className="text-xs text-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}
