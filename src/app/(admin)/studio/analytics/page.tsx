import Link from "next/link";

import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { SearchAnalyticsDashboard } from "@/components/studio/search-analytics-dashboard";
import { getSearchAnalyticsDashboard } from "@/lib/studio/search-analytics-dashboard";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

export default async function StudioAnalyticsPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const data = await getSearchAnalyticsDashboard();

  return (
    <StudioPageShell
      active="analytics"
      title="חיפושים"
      description="מה אנשים מחפשים, ואיפה יש חורים במאגר (0 תוצאות)."
      actions={<StudioLockButton />}
      summary={
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>
            היום:{" "}
            <strong className="text-zinc-100">{data.totalToday}</strong>
          </span>
          <span>
            דיסלייק השבוע:{" "}
            <strong className="text-zinc-100">
              {data.thumbsDownThisWeek}
            </strong>
          </span>
          <span>
            אירועים בטעינה:{" "}
            <strong className="text-zinc-100">{data.rows.length}</strong>
          </span>
          {data.loadError ? (
            <Link
              href="/studio/guide"
              className="text-red-300 underline-offset-2 hover:underline"
            >
              שגיאת טעינה. ראה מדריך.
            </Link>
          ) : null}
        </div>
      }
    >
      <SearchAnalyticsDashboard data={data} />
    </StudioPageShell>
  );
}
