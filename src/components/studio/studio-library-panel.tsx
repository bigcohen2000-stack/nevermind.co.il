"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { runStudioLibrarySync } from "@/actions/studio-library-sync";
import { StudioOpsTipsPanel } from "@/components/studio/studio-ops-tips";
import { getWatchHref } from "@/lib/videos/watch-path";
import type { StudioLibraryStatus } from "@/lib/studio/library-status";

type StudioLibraryPanelProps = {
  status: StudioLibraryStatus;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function StudioLibraryPanel({ status }: StudioLibraryPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();

  const filteredRecent = useMemo(() => {
    if (!q) return status.recentVideos;
    return status.recentVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.youtube_id.toLowerCase().includes(q),
    );
  }, [q, status.recentVideos]);

  const filteredGaps = useMemo(() => {
    if (!q) return status.gatedWithoutTeaser;
    return status.gatedWithoutTeaser.filter((v) =>
      v.title.toLowerCase().includes(q),
    );
  }, [q, status.gatedWithoutTeaser]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">
            סרטונים אחרונים שהמערכת מכירה, ופערי טעימות במועדון.
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            setMessage(null);
            startTransition(async () => {
              const result = await runStudioLibrarySync();
              if (!result.ok) {
                setError(result.message);
                return;
              }
              setMessage(result.message);
              router.refresh();
            });
          }}
          className="inline-flex min-h-10 items-center justify-center border border-zinc-600 bg-zinc-950 px-4 text-sm font-medium text-zinc-100 transition hover:border-red-500/60 disabled:opacity-60"
        >
          {pending ? "מסנכרנים..." : "סנכרון ספרייה עכשיו"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <div>
        <label className="block text-xs text-zinc-400" htmlFor="library-search">
          חיפוש בכותרת או מזהה
        </label>
        <input
          id="library-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1 w-full max-w-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          placeholder="לדוגמה: חרדה"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-200">
          סרטונים אחרונים שהמערכת מכירה
        </h3>
        {filteredRecent.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">אין תוצאות.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="px-2 py-2 font-medium">כותרת</th>
                  <th className="px-2 py-2 font-medium">מזהה</th>
                  <th className="px-2 py-2 font-medium">מועדון</th>
                  <th className="px-2 py-2 font-medium">טעימה</th>
                  <th className="px-2 py-2 font-medium">נוצר</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((video) => (
                  <tr
                    key={video.id}
                    className="border-b border-zinc-800/80 text-zinc-200"
                  >
                    <td className="px-2 py-2">
                      <Link
                        href={getWatchHref(video)}
                        className="text-zinc-100 underline-offset-2 hover:underline"
                      >
                        {video.title}
                      </Link>
                    </td>
                    <td
                      className="px-2 py-2 font-mono text-xs text-zinc-400"
                      dir="ltr"
                    >
                      {video.youtube_id}
                    </td>
                    <td className="px-2 py-2 text-xs text-zinc-400">
                      {video.is_gated || video.is_unlisted ? "כן" : "לא"}
                    </td>
                    <td className="px-2 py-2 text-xs text-zinc-400">
                      {video.teaser_youtube_id ? "יש" : "חסר"}
                    </td>
                    <td className="px-2 py-2 text-xs text-zinc-400">
                      {formatWhen(video.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-200">
          חסרות טעימות ({status.gatedWithoutTeaser.length})
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          סרטוני מועדון / לא רשום בלי טעימה.{" "}
          <a
            href="#teasers"
            className="text-zinc-300 underline-offset-2 hover:underline"
          >
            לפאנל טעימות
          </a>
        </p>
        {filteredGaps.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">אין פערים או אין תוצאות.</p>
        ) : (
          <details className="mt-3 border border-zinc-800 bg-zinc-950/40">
            <summary className="cursor-pointer px-3 py-2.5 text-sm text-zinc-300 hover:text-zinc-100">
              הצג רשימה ({filteredGaps.length})
            </summary>
            <ul className="max-h-72 space-y-2 overflow-y-auto border-t border-zinc-800 px-3 py-2 text-sm text-zinc-300">
              {filteredGaps.map((video) => (
                <li key={video.id} className="border-b border-zinc-800/80 py-2 last:border-0">
                  <Link
                    href={getWatchHref(video)}
                    className="underline-offset-2 hover:underline"
                  >
                    {video.title}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <StudioOpsTipsPanel mode="library" />
    </div>
  );
}
