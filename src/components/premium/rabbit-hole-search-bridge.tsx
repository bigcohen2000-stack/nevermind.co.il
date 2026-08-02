"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DeepRabbitHole } from "@/components/premium/deep-rabbit-hole";
import {
  ACCESS_GATE_SECONDARY_CTA,
  ACCESS_GATE_SECONDARY_WHATSAPP,
} from "@/lib/premium/access-gate-copy";
import { matchesGatedSearchTerm } from "@/lib/premium/gated-terms";
import { wasAccessGateDismissedRecently } from "@/lib/premium/watch-count-local";
import { buildWhatsAppHref } from "@/lib/whatsapp";

type Props = {
  query: string;
  /** True when profiles.has_video_access (or legacy premium) is granted. */
  hasVideoAccess: boolean;
  /** @deprecated Prefer hasVideoAccess */
  isPremium?: boolean;
};

/**
 * Intent-based access gate on search:
 * - Guests / no access: modal only when the query matches a gated topic list
 *   and the 14-day dismiss cool-down has elapsed.
 * - Entitled users: no modal. Inline note + 1:1 CTA while results stay open.
 */
export function RabbitHoleSearchBridge({
  query,
  hasVideoAccess,
  isPremium,
}: Props) {
  const entitled = hasVideoAccess || Boolean(isPremium);
  const gatedIntent = matchesGatedSearchTerm(query);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (entitled) {
      setOpen(false);
      return;
    }
    if (!gatedIntent) return;
    if (wasAccessGateDismissedRecently()) return;
    const t = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(t);
  }, [query, entitled, gatedIntent]);

  if (entitled && gatedIntent) {
    const href = buildWhatsAppHref(
      [
        ACCESS_GATE_SECONDARY_WHATSAPP,
        query.trim() ? `נושא חיפוש: ${query.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );

    return (
      <aside
        className="mb-8 border border-foreground/15 bg-paper p-5 sm:p-6"
        aria-labelledby="member-deepen-title"
      >
        <p
          id="member-deepen-title"
          className="text-xs font-medium tracking-wide text-muted"
        >
          הרשאה פעילה
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground sm:text-base">
          החיפוש נוגע באזור תוכן מורשה. התוצאות למטה כוללות את מה שזמין לחשבון
          שלך. להעמקה לפי היסטוריית החיפוש אפשר לתאם פגישת ניתוח 1:1.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-none bg-[#D42B2B] px-4 text-sm font-semibold text-[#FAFAF8] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            {ACCESS_GATE_SECONDARY_CTA}
          </a>
          <Link
            href="/paths"
            className="inline-flex min-h-11 items-center justify-center rounded-none border border-[#1A1A1A] px-4 text-sm font-semibold text-foreground transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
          >
            למסלולים
          </Link>
        </div>
      </aside>
    );
  }

  if (entitled) return null;

  return (
    <DeepRabbitHole mode="free" open={open} onOpenChange={setOpen} />
  );
}
