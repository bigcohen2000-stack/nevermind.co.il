"use client";

import { useState, useTransition } from "react";

import { markClubRenewalRequested } from "@/actions/club-login";

type ClubRenewalRequestMarkProps = {
  /** ISO timestamp of an existing mark, from club_members.renewal_requested_at. */
  requestedAt: string | null;
};

function formatMarkedWhen(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", { dateStyle: "medium" });
}

/**
 * Lets a club member say that the renewal request was already sent on WhatsApp.
 * Writes a single timestamp on the member row, so Studio sees a pending request.
 * No payment and no free text.
 */
export function ClubRenewalRequestMark({
  requestedAt,
}: ClubRenewalRequestMarkProps) {
  const [marked, setMarked] = useState<string | null>(requestedAt);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (marked) {
    const when = formatMarkedWhen(marked);
    return (
      <p className="text-xs text-muted" role="status">
        {when
          ? `סימנת שנשלחה בקשת חידוש בוואטסאפ (${when}). ההארכה נעשית ידנית.`
          : "סימנת שנשלחה בקשת חידוש בוואטסאפ. ההארכה נעשית ידנית."}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        className="inline-flex min-h-9 items-center justify-center border border-foreground/20 px-3 text-xs text-foreground transition hover:border-action hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:opacity-50"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await markClubRenewalRequested();
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMarked(result.requestedAt);
          });
        }}
      >
        {pending ? "רושם..." : "שלחתי בוואטסאפ"}
      </button>
      {error ? (
        <p className="text-xs text-action" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default ClubRenewalRequestMark;
