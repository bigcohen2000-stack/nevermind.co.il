"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Search } from "lucide-react";

import { LiveLikeButton } from "@/components/live/live-like-button";
import { LiveRequestForm } from "@/components/live/live-request-form";
import { getWatchHref } from "@/lib/videos/watch-path";
import type { LiveArchiveItem } from "@/lib/live/archive";
import { LIVE_VOTE_NOTE } from "@/lib/live/previous-lives";
import { cn } from "@/lib/utils";

const PREVIEW_COUNT = 3;

type LiveArchivePanelProps = {
  items: LiveArchiveItem[];
  leaders: LiveArchiveItem[];
  isAuthenticated: boolean;
  hasClubAccess: boolean;
  /** Total archive size hint for locked guests (no titles). */
  archiveCount?: number;
  className?: string;
};

/**
 * Club-only archive list: titles only, max 3 then "show more".
 * Guests see a lock CTA without video thumbs or titles (no leak).
 */
export function LiveArchivePanel({
  items,
  leaders,
  isAuthenticated,
  hasClubAccess,
  archiveCount = 0,
  className,
}: LiveArchivePanelProps) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestVideoId, setRequestVideoId] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.video.title.toLowerCase().includes(needle) ||
        (item.label?.toLowerCase().includes(needle) ?? false),
    );
  }, [items, q]);

  const visible = expanded
    ? filtered
    : filtered.slice(0, PREVIEW_COUNT);
  const hiddenCount = Math.max(0, filtered.length - PREVIEW_COUNT);

  if (!hasClubAccess) {
    return (
      <div className={cn("space-y-5", className)}>
        <div className="border border-foreground/15 bg-paper p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Lock className="size-4 text-action" aria-hidden />
            ארכיון לייבים לחברים
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/75">
            הקלטות מהשידורים הלא רשומים לא מוצגות כאן לציבור. אחרי כניסה למועדון
            אפשר לצפות במאגר המלא.
            {archiveCount > 0 ? (
              <>
                {" "}
                כרגע במאגר:{" "}
                <span className="font-semibold tabular-nums">
                  {archiveCount.toLocaleString("he-IL")}
                </span>{" "}
                פריטים.
              </>
            ) : null}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/members#login" className="btn btn-primary text-sm">
              כניסה למועדון
            </Link>
            <Link href="/members" className="btn btn-secondary text-sm">
              מה כלול
            </Link>
          </div>
        </div>

        <div id="live-request" className="scroll-mt-24">
          <LiveRequestForm isAuthenticated={isAuthenticated} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <p className="text-sm leading-relaxed text-foreground/70">
        רשימת כותרות בלבד. בלי תמונות מקדימות. פתיחה מלאה בעמוד הצפייה.
      </p>

      <label className="relative block max-w-xl">
        <span className="sr-only">חיפוש בארכיון לייב</span>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setExpanded(false);
          }}
          placeholder="חיפוש לפי כותרת"
          className="w-full border border-foreground/20 bg-background py-3 pe-3 ps-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
        />
      </label>

      {leaders.length > 0 ? (
        <section
          aria-labelledby="live-leaders-title"
          className="border border-foreground/12 bg-paper p-4 sm:p-5"
        >
          <h3
            id="live-leaders-title"
            className="text-sm font-semibold tracking-tight"
          >
            מועמדים ללייב (לפי לייקים)
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {LIVE_VOTE_NOTE}
          </p>
          <ol className="mt-3 space-y-2">
            {leaders.slice(0, PREVIEW_COUNT).map((item, index) => (
              <li
                key={item.video.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-foreground/10 bg-background px-3 py-2.5"
              >
                <p className="min-w-0 truncate text-sm">
                  <span className="text-muted">#{index + 1}</span>{" "}
                  {item.video.title}
                </p>
                <LiveLikeButton
                  videoId={item.video.id}
                  initialCount={item.likeCount}
                  initialLiked={item.likedByMe}
                  isAuthenticated={isAuthenticated}
                />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {visible.length > 0 ? (
        <ul className="divide-y divide-foreground/10 border border-foreground/15">
          {visible.map((item) => (
            <li
              key={item.video.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={getWatchHref(item.video)}
                  className="text-sm font-medium text-foreground no-underline hover:text-action hover:no-underline"
                >
                  {item.video.title}
                </Link>
                {item.label || item.airedAt ? (
                  <p className="mt-0.5 text-xs text-muted">
                    {[item.label, item.airedAt].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <LiveLikeButton
                  videoId={item.video.id}
                  initialCount={item.likeCount}
                  initialLiked={item.likedByMe}
                  isAuthenticated={isAuthenticated}
                />
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center border border-foreground/15 px-3 text-sm"
                  onClick={() => {
                    setRequestTitle(item.video.title);
                    setRequestVideoId(item.video.id);
                    document
                      .getElementById("live-request")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ללייב
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          {q.trim()
            ? "לא נמצאו כותרות בחיפוש."
            : "אין עדיין פריטים בארכיון."}
        </p>
      )}

      {hiddenCount > 0 && !expanded ? (
        <button
          type="button"
          className="btn btn-secondary text-sm"
          onClick={() => setExpanded(true)}
        >
          הצג עוד ({hiddenCount})
        </button>
      ) : null}
      {expanded && filtered.length > PREVIEW_COUNT ? (
        <button
          type="button"
          className="btn btn-secondary text-sm"
          onClick={() => setExpanded(false)}
        >
          הצג פחות
        </button>
      ) : null}

      <div id="live-request" className="scroll-mt-24">
        <LiveRequestForm
          key={`${requestVideoId ?? "none"}-${requestTitle}`}
          isAuthenticated={isAuthenticated}
          defaultTitle={requestTitle}
          defaultVideoId={requestVideoId}
        />
      </div>
    </div>
  );
}
