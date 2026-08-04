import Link from "next/link";

import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { StudioUsersDashboard } from "@/components/studio/studio-users-dashboard";
import { getStudioPlatformSnapshot } from "@/lib/studio/platform-snapshot";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getStudioUsersDashboard } from "@/lib/studio/users-dashboard";

export const dynamic = "force-dynamic";

export default async function StudioUsersPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const [data, platform] = await Promise.all([
    getStudioUsersDashboard(),
    Promise.resolve(getStudioPlatformSnapshot()),
  ]);

  return (
    <StudioPageShell
      active="users"
      title="משתמשים ומחוברים"
      description="טבלאות: מחוברים, משתמשים (הרשמה / תפוגה / פגישה / V), כניסות. פעולות לכל משתמש מתחת לשורה."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/studio/leads"
            className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            לידים
          </Link>
          <StudioLockButton />
        </div>
      }
      summary={
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>
            מחוברים:{" "}
            <strong className="text-zinc-100">{data.onlineCount}</strong>
          </span>
          <span>
            משתמשים:{" "}
            <strong className="text-zinc-100">{data.totalUsers}</strong>
          </span>
          <span>
            תפוגה בקרוב:{" "}
            <strong className="text-zinc-100">{data.expiringSoonCount}</strong>
          </span>
          <span>
            ממתינים ל-V:{" "}
            <strong className="text-zinc-100">
              {data.pendingMeetingConfirmCount}
            </strong>
          </span>
        </div>
      }
    >
      <StudioUsersDashboard data={data} platform={platform} />
    </StudioPageShell>
  );
}
