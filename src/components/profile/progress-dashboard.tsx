import Link from "next/link";

import {
  formatDiveDepthHours,
  formatMeetingDate,
  formatMeetingStatus,
  type ProfileProgressStats,
} from "@/lib/profile/progress-format";

type ProgressDashboardProps = {
  stats: ProfileProgressStats;
};

function StatCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-[#FAFAF8]/10 bg-[#0A0A0B] p-5 sm:p-6">
      <p className="text-xs tracking-[0.15em] text-[#9CA3AF] uppercase">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-[#FAFAF8] sm:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Dry analytical strip: mechanisms / dive hours / completions / activity.
 */
export function ProgressDashboard({ stats }: ProgressDashboardProps) {
  const mechanismHint =
    stats.exploredLabels.length > 0
      ? stats.exploredLabels.join(", ")
      : "עדיין לא נרשם מנגנון ליבה מההיסטוריה.";

  const meetingHint = [
    formatMeetingStatus(stats.lastMeetingStatus),
    stats.pendingConfirmPath ? "ממתין לאישור שלך (V)" : "",
  ]
    .filter(Boolean)
    .join(", ");

  const weekPct = Math.min(100, Math.round((stats.activeDaysLast7 / 7) * 100));

  return (
    <section aria-labelledby="progress-dashboard-title" className="mt-10">
      <h2
        id="progress-dashboard-title"
        className="text-xl font-semibold tracking-tight"
      >
        מעקב התקדמות
      </h2>
      <p className="mt-2 max-w-prose text-sm text-[#9CA3AF]">
        תמונת מצב אובייקטיבית מול השיטה. בלי ניקוד ובלי משחוק.
      </p>

      {stats.pendingConfirmPath ? (
        <div className="mt-5 border border-action/40 bg-action/10 p-4">
          <p className="text-sm font-medium text-[#FAFAF8]">
            פגישה ממתינה לאישור
          </p>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            {formatMeetingDate(stats.lastMeetingAt)}. לחץ לסימון V.
          </p>
          <Link
            href={stats.pendingConfirmPath}
            className="mt-3 inline-flex min-h-10 items-center bg-action px-4 text-xs font-semibold text-white"
          >
            לאשר פגישה (V)
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCell
          label="מנגנונים"
          value={`${stats.mechanismsExplored}/${stats.mechanismsTotal}`}
          hint={mechanismHint}
        />
        <StatCell
          label="עומק צלילה"
          value={formatDiveDepthHours(stats.watchTimeSeconds)}
          hint="זמן צפייה שנצבר בחשבון."
        />
        <StatCell
          label="הושלמו"
          value={String(stats.completedCount)}
          hint={`${stats.historyCount} התחלות צפייה בהיסטוריה.`}
        />
        <StatCell
          label="פעילות השבוע"
          value={`${stats.activeDaysLast7}/7`}
          hint="ימים עם צפייה ב-7 הימים האחרונים."
        />
        <StatCell
          label="פגישה אחרונה"
          value={formatMeetingDate(stats.lastMeetingAt)}
          hint={meetingHint || undefined}
        />
      </div>

      <div className="mt-4 border border-[#FAFAF8]/10 bg-[#0A0A0B] p-4">
        <p className="text-xs tracking-[0.15em] text-[#9CA3AF] uppercase">
          רצף שבועי
        </p>
        <div className="mt-3 h-2 w-full bg-[#FAFAF8]/10">
          <div
            className="h-full bg-action"
            style={{ width: `${weekPct}%` }}
            role="presentation"
          />
        </div>
      </div>

      {stats.recentSearches.length > 0 ? (
        <div className="mt-6 border border-[#FAFAF8]/10 bg-[#0A0A0B] p-5">
          <p className="text-xs tracking-[0.15em] text-[#9CA3AF] uppercase">
            חיפושים אחרונים
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {stats.recentSearches.map((term) => (
              <li key={term}>
                <Link
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="border border-[#FAFAF8]/20 px-2.5 py-1 text-xs text-[#FAFAF8] no-underline hover:border-action hover:text-action"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
