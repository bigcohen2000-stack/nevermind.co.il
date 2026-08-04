"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  activateLiveQueueItem,
  addLiveQueueBulk,
  addLiveQueueItem,
  deleteLiveQueueItem,
  markLiveQueueDone,
  updateLiveQueueStatus,
} from "@/actions/live-stream-queue";
import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import { liveUpcomingAnnounce } from "@/lib/studio/whatsapp-templates";

export type LiveQueueStudioItem = {
  id: string;
  youtube_url: string;
  topic: string;
  scheduled_at: string;
  status: string;
};

type LiveQueueStudioPanelProps = {
  items: LiveQueueStudioItem[];
  loadError?: string | null;
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_HE: Record<string, string> = {
  planned: "מתוכנן",
  live: "בשידור",
  done: "בוצע",
  cancelled: "בוטל",
};

/**
 * Plan multiple YouTube Live slots ahead of time. Activate when the stream starts.
 */
export function LiveQueueStudioPanel({
  items,
  loadError,
}: LiveQueueStudioPanelProps) {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 2);
    return toDatetimeLocalValue(d.toISOString());
  });
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime(),
      ),
    [items],
  );

  const planned = sorted.filter(
    (i) => i.status === "planned" || i.status === "live",
  );
  const past = sorted.filter(
    (i) => i.status === "done" || i.status === "cancelled",
  );

  return (
    <section
      className="space-y-5 border border-zinc-700 bg-zinc-950/40 p-5 sm:p-6"
      dir="rtl"
    >
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">תור שידורים</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          מוסיפים מראש קישורים לא רשומים עם תאריך ושעה. בזמן השידור לוחצים
          &quot;הפעל עכשיו&quot;. מי שנרשם בפרופיל להתראות לייב מקבל התראת דפדפן.
        </p>
      </div>

      {loadError ? (
        <p className="text-sm text-amber-300">{loadError}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="queue-youtube-url"
            className="block text-xs text-zinc-400"
          >
            קישור YouTube
          </label>
          <input
            id="queue-youtube-url"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            dir="ltr"
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 w-full border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label
            htmlFor="queue-scheduled-at"
            className="block text-xs text-zinc-400"
          >
            תאריך ושעה
          </label>
          <input
            id="queue-scheduled-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1 w-full border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="queue-topic" className="block text-xs text-zinc-400">
            נושא (אופציונלי)
          </label>
          <input
            id="queue-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={300}
            className="mt-1 w-full border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={pending}
        className="border border-zinc-500 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-300 disabled:opacity-50"
        onClick={() => {
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const when = scheduledAt
              ? new Date(scheduledAt).toISOString()
              : "";
            const result = await addLiveQueueItem({
              youtubeUrl,
              topic,
              scheduledAt: when,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setYoutubeUrl("");
            setTopic("");
            setMessage(result.message ?? "נוסף.");
            router.refresh();
          });
        }}
      >
        {pending ? "שומר..." : "הוסף לתור"}
      </button>

      <details className="border border-zinc-800 p-3">
        <summary className="cursor-pointer text-xs text-zinc-400">
          הוספה מרובה (שורה לכל שידור)
        </summary>
        <p className="mt-2 text-xs text-zinc-500">
          פורמט: קישור | תאריך ISO או מקומי | נושא. דוגמה:{" "}
          <span dir="ltr" className="text-zinc-400">
            https://youtu.be/xxx | 2026-08-10T20:00 | נושא
          </span>
        </p>
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          rows={4}
          dir="ltr"
          className="mt-2 w-full border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          placeholder={"url | 2026-08-10T20:00 | topic"}
        />
        <button
          type="button"
          disabled={pending}
          className="mt-2 border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 disabled:opacity-50"
          onClick={() => {
            setError(null);
            setMessage(null);
            startTransition(async () => {
              const result = await addLiveQueueBulk({ text: bulkText });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setBulkText("");
              setMessage(result.message ?? "נוסף.");
              router.refresh();
            });
          }}
        >
          הוסף שורות
        </button>
      </details>

      {planned.length === 0 ? (
        <p className="text-sm text-zinc-500">אין שידורים מתוכננים בתור.</p>
      ) : (
        <ul className="space-y-3">
          {planned.map((item) => {
            const whenLabel = formatWhen(item.scheduled_at);
            const waText = liveUpcomingAnnounce({
              whenLabel,
              topic: item.topic,
            });
            return (
              <li
                key={item.id}
                className="border border-zinc-800 bg-zinc-950/60 p-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-100">
                      {item.topic || "בלי נושא"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {whenLabel}, {STATUS_HE[item.status] ?? item.status}
                    </p>
                    <p
                      className="mt-1 truncate text-xs text-zinc-600"
                      dir="ltr"
                    >
                      {item.youtube_url}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status === "planned" ? (
                      <button
                        type="button"
                        disabled={pending}
                        className="bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        onClick={() => {
                          setError(null);
                          setMessage(null);
                          startTransition(async () => {
                            const result = await activateLiveQueueItem(
                              item.id,
                            );
                            if (!result.ok) {
                              setError(result.error);
                              return;
                            }
                            setMessage(result.message ?? "בשידור.");
                            router.refresh();
                          });
                        }}
                      >
                        הפעל עכשיו
                      </button>
                    ) : null}
                    <StudioCopyButton
                      text={waText}
                      label="העתק תזכורת"
                      onCopied={() => setMessage("תזכורת WhatsApp הועתקה.")}
                    />
                    <button
                      type="button"
                      disabled={pending}
                      className="border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-50"
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const result = await markLiveQueueDone(item.id);
                          if (!result.ok) setError(result.error);
                          else {
                            setMessage(result.message ?? "סומן כבוצע.");
                            router.refresh();
                          }
                        });
                      }}
                    >
                      סמן בוצע
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-50"
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const result = await updateLiveQueueStatus({
                            id: item.id,
                            status: "cancelled",
                          });
                          if (!result.ok) setError(result.error);
                          else router.refresh();
                        });
                      }}
                    >
                      בטל
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="border border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 disabled:opacity-50"
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const result = await deleteLiveQueueItem(item.id);
                          if (!result.ok) setError(result.error);
                          else router.refresh();
                        });
                      }}
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {past.length > 0 ? (
        <details className="text-xs text-zinc-500">
          <summary className="cursor-pointer">
            היסטוריה ({past.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {past.slice(0, 12).map((item) => (
              <li key={item.id}>
                {formatWhen(item.scheduled_at)},{" "}
                {STATUS_HE[item.status] ?? item.status},{" "}
                {item.topic || "בלי נושא"}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    </section>
  );
}
