"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { LiveLikeButton } from "@/components/live/live-like-button";
import { LiveRequestForm } from "@/components/live/live-request-form";
import { VideoCard } from "@/components/videos/video-card";
import type { LiveArchiveItem } from "@/lib/live/archive";
import { LIVE_VOTE_NOTE } from "@/lib/live/previous-lives";
import { cn } from "@/lib/utils";

type LiveArchivePanelProps = {
  items: LiveArchiveItem[];
  leaders: LiveArchiveItem[];
  isAuthenticated: boolean;
  hasClubAccess: boolean;
  className?: string;
};

/**
 * Client search + grid for previous LIVE / unlisted archive teasers.
 */
export function LiveArchivePanel({
  items,
  leaders,
  isAuthenticated,
  hasClubAccess,
  className,
}: LiveArchivePanelProps) {
  const [q, setQ] = useState("");
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

  return (
    <div className={cn("space-y-10", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="live-archive-title"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            לייבים קודמים
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/70">
            תצוגה מקדימה של סרטונים ששודרו בלא רשום. הצפייה המלאה פתוחה לחברי
            המועדון. אפשר לחפש כאן, לתת לייק, או להזמין סרטון ללייב.
          </p>
        </div>
        {!hasClubAccess ? (
          <a href="/members" className="btn btn-primary shrink-0 text-sm">
            כניסה למועדון לצפייה
          </a>
        ) : null}
      </div>

      <label className="relative block max-w-xl">
        <span className="sr-only">חיפוש בארכיון לייב</span>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש בארכיון: כותרת או נושא"
          className="w-full border border-foreground/20 bg-background py-3 pe-3 ps-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
        />
      </label>

      {leaders.length > 0 ? (
        <section
          aria-labelledby="live-leaders-title"
          className="border border-action/30 bg-paper p-5 sm:p-6"
        >
          <h3
            id="live-leaders-title"
            className="text-base font-semibold tracking-tight"
          >
            מועמדים ללייב חינם לרשומים
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {LIVE_VOTE_NOTE}
          </p>
          <ol className="mt-4 space-y-3">
            {leaders.map((item, index) => (
              <li
                key={item.video.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-foreground/10 bg-background px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted">#{index + 1}</p>
                  <p className="truncate text-sm font-medium">
                    {item.video.title}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <LiveLikeButton
                    videoId={item.video.id}
                    initialCount={item.likeCount}
                    initialLiked={item.likedByMe}
                    isAuthenticated={isAuthenticated}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary text-sm"
                    onClick={() => {
                      setRequestTitle(item.video.title);
                      setRequestVideoId(item.video.id);
                      document
                        .getElementById("live-request")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    הזמנה ללייב
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section
          aria-labelledby="live-vote-pitch-title"
          className="border border-foreground/12 bg-paper p-5"
        >
          <h3
            id="live-vote-pitch-title"
            className="text-base font-semibold tracking-tight"
          >
            לייקים בוחרים כיוון
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {LIVE_VOTE_NOTE} תנו לייק לסרטונים למטה. הראשונים יופיעו כאן.
          </p>
        </section>
      )}

      {filtered.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, index) => (
            <li key={item.video.id} className="flex flex-col gap-3">
              <VideoCard video={item.video} priority={index < 2} />
              <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
                <div className="min-w-0 text-xs text-muted">
                  {item.label ? <span>{item.label}</span> : null}
                  {item.airedAt ? (
                    <span className={item.label ? "ms-2" : undefined}>
                      {item.airedAt}
                    </span>
                  ) : null}
                  {!item.label && !item.airedAt ? (
                    <span>שידור קודם / לא רשום</span>
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
                    className="inline-flex min-h-10 items-center border border-foreground/15 px-3 text-sm text-foreground/80 transition hover:border-action hover:text-action"
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
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          {q.trim()
            ? "לא נמצאו סרטונים בחיפוש הזה בארכיון."
            : "עדיין אין סרטוני ארכיון להצגה. אפשר להגדיר לייבים קודמים בקובץ התוכן, או לסנכרן סרטונים לא רשומים."}
        </p>
      )}

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
