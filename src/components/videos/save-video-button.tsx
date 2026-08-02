"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toggleSavedVideo } from "@/actions/saved-videos";
import { cn } from "@/lib/utils";

type SaveVideoButtonProps = {
  youtubeId: string;
  initialSaved?: boolean;
  className?: string;
};

export function SaveVideoButton({
  youtubeId,
  initialSaved = false,
  className,
}: SaveVideoButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  function onToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const previous = saved;
    setSaved(!previous);

    startTransition(async () => {
      const result = await toggleSavedVideo(youtubeId);
      if (!result.ok) {
        setSaved(previous);
        if (result.needsAuth) {
          router.push("/my-list");
        }
        return;
      }
      setSaved(result.saved);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "הסר מהרשימה שלי" : "שמור לרשימה שלי"}
      title={saved ? "הסר מהרשימה" : "שמור לרשימה"}
      className={cn(
        "absolute top-2 end-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action",
        "disabled:cursor-wait disabled:opacity-70",
        saved
          ? "border-action/50 bg-action text-background"
          : "border-background/50 bg-foreground/70 text-background hover:bg-foreground",
        className,
      )}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
