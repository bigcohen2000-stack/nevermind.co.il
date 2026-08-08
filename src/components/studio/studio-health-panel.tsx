import Link from "next/link";

import type { StudioHealth } from "@/lib/studio/health";

type StudioHealthPanelProps = {
  health: StudioHealth;
};

/**
 * Hebrew readiness checklist for WhatsApp-based club billing (no card checkout).
 */
export function StudioHealthPanel({ health }: StudioHealthPanelProps) {
  const latest = health.latestVideo;

  return (
    <section
      id="readiness"
      className="mt-8 scroll-mt-6 border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6"
      dir="rtl"
    >
      <h2 className="text-base font-semibold text-zinc-100">מוכן לגבייה?</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        הגבייה עדיין דרך וואטסאפ. אין כאן תשלום בכרטיס. הרשימה בודקת שהמערכת
        מוכנה לפתוח גישה אחרי תשלום ידני.
      </p>

      <div
        className={`mt-4 inline-flex items-center gap-2 border px-3 py-2 text-sm ${
          health.paymentReady
            ? "border-emerald-500/40 text-emerald-200"
            : "border-amber-500/40 text-amber-200"
        }`}
      >
        <span aria-hidden>{health.paymentReady ? "✓" : "!"}</span>
        <span>
          {health.paymentReady
            ? "הבסיס מוכן לגבייה בוואטסאפ."
            : "חסרים פריטים לפני גבייה בטוחה."}
        </span>
      </div>

      <ul className="mt-5 space-y-2">
        {health.checklist.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-start gap-2 border-b border-zinc-800/80 py-2 text-sm"
          >
            <span
              className={
                item.ok ? "text-emerald-400" : "text-red-400"
              }
              aria-hidden
            >
              {item.ok ? "●" : "○"}
            </span>
            <div>
              <p className="font-medium text-zinc-200">{item.label}</p>
              <p className="text-xs text-zinc-500">{item.hint}</p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-6 grid gap-3 text-xs text-zinc-400 sm:grid-cols-2">
        <div>
          <dt>סרטוני מועדון / לא רשום</dt>
          <dd className="text-zinc-200">{health.gatedVideosCount}</dd>
        </div>
        <div>
          <dt>חסרות טעימות</dt>
          <dd className="text-zinc-200">
            {health.teasersMissingCount}
            {health.teasersMissingCount > 0 ? (
              <>
                {" "}
                <Link
                  href="/studio#teasers"
                  className="text-amber-200 underline-offset-2 hover:underline"
                >
                  לפאנל טעימות
                </Link>
              </>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>פלייליסט מועדון מוגדר</dt>
          <dd className="text-zinc-200">
            {health.gatedPlaylistConfigured ? "כן" : "לא (מומלץ להגדיר)"}
          </dd>
        </div>
        <div>
          <dt>חברים ברשימה</dt>
          <dd className="text-zinc-200">{health.membersCount}</dd>
        </div>
        <div>
          <dt>סרטון אחרון במאגר</dt>
          <dd className="text-zinc-200">
            {latest ? (
              <>
                {latest.title}{" "}
                <span dir="ltr" className="font-mono text-zinc-500">
                  ({latest.youtube_id})
                </span>
              </>
            ) : (
              "אין עדיין"
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
