"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateViewerFeedbackStatus } from "@/actions/viewer-feedback";
import type { ViewerFeedback } from "@/types/supabase";

type StudioFeedbackPanelProps = {
  items: ViewerFeedback[];
};

const STATUS_LABEL: Record<ViewerFeedback["status"], string> = {
  open: "פתוח",
  replied: "נענה",
  closed: "סגור",
};

const KIND_LABEL: Record<ViewerFeedback["kind"], string> = {
  heart_reply: "לב + תשובה",
  dislike: "לא אהבתי",
  reply_request: "בקשת תשובה",
  method_question: "שאלת שיטה",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function StudioFeedbackPanel({ items }: StudioFeedbackPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4" dir="rtl">
      <p className="text-sm text-zinc-400">
        משוב מהאתר: דיסלייקים, בקשות תשובה, ושאלות שיטה מחשבון מחובר.
      </p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">אין משוב עדיין.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="border border-zinc-800 bg-zinc-950/60 p-4 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-zinc-200">
                  {KIND_LABEL[row.kind] ?? row.kind}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatWhen(row.created_at)}, {STATUS_LABEL[row.status]}
                </span>
              </div>
              {row.video_title ? (
                <p className="mt-2 text-xs text-zinc-400">
                  סרטון: {row.video_title}
                </p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-zinc-300">{row.body}</p>
              {row.reply_body ? (
                <p className="mt-2 whitespace-pre-wrap border-t border-zinc-800 pt-2 text-zinc-400">
                  תשובה: {row.reply_body}
                </p>
              ) : null}
              {(row.author_name || row.contact_phone || row.contact_email) && (
                <p className="mt-2 text-xs text-zinc-500">
                  {row.author_name ? `${row.author_name}, ` : ""}
                  {row.contact_phone ? (
                    <span dir="ltr">{row.contact_phone}</span>
                  ) : null}
                  {row.contact_email ? `, ${row.contact_email}` : null}
                  {row.want_reply ? ", מבקש/ת תשובה" : ""}
                </p>
              )}
              <textarea
                className="mt-3 w-full border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-200"
                rows={3}
                placeholder="תשובה למשתמש (נשלחת במייל אם יש כתובת)"
                value={replies[row.id] ?? ""}
                onChange={(e) =>
                  setReplies((prev) => ({ ...prev, [row.id]: e.target.value }))
                }
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending || !(replies[row.id]?.trim())}
                  className="border border-action/50 px-2 py-1 text-xs text-action disabled:opacity-40"
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      const result = await updateViewerFeedbackStatus({
                        id: row.id,
                        status: "replied",
                        replyBody: replies[row.id],
                      });
                      if (!result.ok) {
                        setError(result.error);
                        return;
                      }
                      router.refresh();
                    });
                  }}
                >
                  שליחת תשובה
                </button>
                {(["open", "replied", "closed"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={pending || row.status === status}
                    className="border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                    onClick={() => {
                      setError(null);
                      startTransition(async () => {
                        const result = await updateViewerFeedbackStatus({
                          id: row.id,
                          status,
                        });
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        router.refresh();
                      });
                    }}
                  >
                    {STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
