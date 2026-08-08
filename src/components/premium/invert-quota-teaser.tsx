"use client";

import { useEffect, useState } from "react";

import { DeepRabbitHole } from "@/components/premium/deep-rabbit-hole";

type InvertQuotaTeaserProps = {
  hasVideoAccess: boolean;
};

/**
 * Shows remaining free invert credits; quiet strip + modal when exhausted.
 * Uses a non-consuming quota peek endpoint.
 */
export function InvertQuotaTeaser({ hasVideoAccess }: InvertQuotaTeaserProps) {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    if (hasVideoAccess) {
      setRemaining(null);
      return;
    }

    let cancelled = false;
    void fetch("/api/search/invert/quota")
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as {
          remaining?: number;
          limit?: number;
          unlimited?: boolean;
        };
        if (data.unlimited) return;
        if (typeof data.limit === "number") setLimit(data.limit);
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      cancelled = true;
    };
  }, [hasVideoAccess]);

  if (hasVideoAccess || remaining == null) return null;

  return (
    <>
      {remaining > 0 && remaining <= 2 ? (
        <p className="mb-4 text-xs text-muted">
          נותרו {remaining} מתוך {limit} חיפושים עמוקים החודש.
        </p>
      ) : null}
      {remaining <= 0 ? (
        <aside className="mb-6 border border-foreground/15 bg-paper p-4 text-sm">
          <p className="font-medium text-foreground">
            מכסת החיפוש העמוק לחודש הזה נוצלה
          </p>
          <p className="mt-1 text-muted">
            במועדון החיפוש העמוק פתוח בלי מכסה חודשית.
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-action underline-offset-2 hover:underline"
            onClick={() => setOpen(true)}
          >
            לפתיחת גישה
          </button>
        </aside>
      ) : null}
      <DeepRabbitHole mode="free" open={open} onOpenChange={setOpen} />
    </>
  );
}
