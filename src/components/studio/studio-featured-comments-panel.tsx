"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createFeaturedComment,
  deleteFeaturedComment,
} from "@/actions/studio-featured-comments";
import type { StudioFeaturedCommentRow } from "@/lib/studio/featured-comments";

type StudioFeaturedCommentsPanelProps = {
  initialRows: StudioFeaturedCommentRow[];
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Studio CRUD for "החוקר המצטיין" comments on watch pages.
 */
export function StudioFeaturedCommentsPanel({
  initialRows,
}: StudioFeaturedCommentsPanelProps) {
  const [rows, setRows] = useState(initialRows);
  const [youtubeId, setYoutubeId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [timestampSeconds, setTimestampSeconds] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            הוספת תגובה מאומתת
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            תגובות עם לב מהיוצר. מוצגות בעמוד הצפייה (עד 3 לסרטון). מזהים
            סרטון לפי YouTube ID שכבר קיים במסד.
          </p>
        </div>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setMessage(null);
            const sort = Number(sortOrder);
            const tsRaw = timestampSeconds.trim();
            const ts = tsRaw === "" ? null : Number(tsRaw);
            startTransition(async () => {
              const result = await createFeaturedComment({
                youtubeId,
                authorName,
                body,
                sortOrder: Number.isFinite(sort) ? sort : 0,
                timestampSeconds:
                  ts !== null && Number.isFinite(ts) ? ts : null,
              });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              if (result.rows) setRows(result.rows);
              setMessage(result.message ?? "נשמר.");
              setBody("");
              setAuthorName("");
            });
          }}
        >
          <div className="sm:col-span-1">
            <label
              htmlFor="fc-youtube-id"
              className="block text-xs text-zinc-400"
            >
              YouTube ID
            </label>
            <input
              id="fc-youtube-id"
              required
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              dir="ltr"
              placeholder="shDcHL4cVgc"
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="fc-author" className="block text-xs text-zinc-400">
              שם הכותב
            </label>
            <input
              id="fc-author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="אופציונלי"
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="fc-body" className="block text-xs text-zinc-400">
              תוכן התגובה
            </label>
            <textarea
              id="fc-body"
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={4000}
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="fc-sort" className="block text-xs text-zinc-400">
              סדר תצוגה
            </label>
            <input
              id="fc-sort"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
              dir="ltr"
            />
          </div>
          <div>
            <label htmlFor="fc-ts" className="block text-xs text-zinc-400">
              שניות בוידאו (אופציונלי)
            </label>
            <input
              id="fc-ts"
              type="number"
              min={0}
              value={timestampSeconds}
              onChange={(e) => setTimestampSeconds(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
              dir="ltr"
              placeholder="120"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
            >
              {pending ? "שומר..." : "הוסף תגובה"}
            </button>
          </div>
        </form>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100">
          תגובות במסד ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">אין תגובות עדיין.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-100">
                      {row.author_name || "ללא שם"}
                      <span className="ms-2 text-xs font-normal text-zinc-500">
                        סדר {row.sort_order}
                        {row.timestamp_seconds != null
                          ? `, ${row.timestamp_seconds}s`
                          : ""}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      <Link
                        href={`/watch/${row.youtube_id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {row.video_title}
                      </Link>
                      <span className="ms-2 font-mono text-zinc-600" dir="ltr">
                        {row.youtube_id}
                      </span>
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                      {row.body}
                    </p>
                    <p className="mt-2 text-[10px] text-zinc-600">
                      {formatDateTime(row.created_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    className="shrink-0 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-red-500/60 hover:text-red-300 disabled:opacity-40"
                    onClick={() => {
                      setError(null);
                      setMessage(null);
                      startTransition(async () => {
                        const result = await deleteFeaturedComment(row.id);
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        if (result.rows) setRows(result.rows);
                        setMessage(result.message ?? "נמחקה.");
                      });
                    }}
                  >
                    מחק
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
