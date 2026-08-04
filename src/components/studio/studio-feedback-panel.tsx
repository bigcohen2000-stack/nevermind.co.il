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
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4" dir="rtl">
      <p className="text-sm text-zinc-400">
        משוב מהאתר: דיסלייקים ובקשות תשובה. עדכון סטטוס לניהול מעקב.
      </p>
      <p className="rounded border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs leading-relaxed text-zinc-500">
        שאלות מלבבות ביוטיוב מטופלות בינתיים דרך HEART_INSIGHTS או הדבקה
        ידנית בצ&apos;אט. הפאנל הזה הוא למשוב dislike / reply_request מהאתר
        בלבד.
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
              <div className="mt-3 flex flex-wrap gap-2">
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
