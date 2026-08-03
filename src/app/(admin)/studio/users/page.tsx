import Link from "next/link";

import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { StudioUsersDashboard } from "@/components/studio/studio-users-dashboard";
import { isStudioAuthenticated } from "@/lib/studio/session";
import { getStudioUsersDashboard } from "@/lib/studio/users-dashboard";

export const dynamic = "force-dynamic";

export default async function StudioUsersPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const data = await getStudioUsersDashboard();

  return (
    <StudioPageShell
      active="users"
      title="משתמשים ומחוברים"
      description="מי מחובר עכשיו, מי נכנס לאחרונה, ומי מקבל גישה לספרייה."
      actions={
        <Link
          href="/studio/leads"
          className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          לידים
        </Link>
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
            כניסות היום:{" "}
            <strong className="text-zinc-100">{data.loginsToday}</strong>
          </span>
        </div>
      }
    >
      <StudioUsersDashboard data={data} />
    </StudioPageShell>
  );
}
