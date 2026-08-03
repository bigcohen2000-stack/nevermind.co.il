import { ProfileAccessExpiryEditor } from "@/components/studio/profile-access-expiry-editor";
import { RecordMeetingForm } from "@/components/studio/record-meeting-form";
import { VideoAccessToggle } from "@/components/studio/video-access-toggle";
import type {
  StudioOnlineRow,
  StudioUsersDashboardData,
} from "@/lib/studio/users-dashboard";
import type { AuthLoginEvent } from "@/types/supabase";

type StudioUsersDashboardProps = {
  data: StudioUsersDashboardData;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRelative(iso: string): string {
  const diffSec = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (diffSec < 60) return "עכשיו";
  if (diffSec < 3600) return `לפני ${Math.floor(diffSec / 60)} דק'`;
  return formatDateTime(iso);
}

function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint: string;
}) {
  return (
    <section className="border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <h2 className="text-sm font-medium tracking-wide text-zinc-400">{title}</h2>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </section>
  );
}

function OnlineNow({ rows }: { rows: StudioOnlineRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-400">
        אין מחוברים כרגע (פעילות ב-5 הדקות האחרונות).
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="py-2 pe-3 font-medium">מי</th>
            <th className="py-2 pe-3 font-medium">סוג</th>
            <th className="py-2 pe-3 font-medium">עמוד</th>
            <th className="py-2 font-medium">נראה לאחרונה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.sessionKey}
              className="border-b border-zinc-800/80 align-top"
            >
              <td className="py-2 pe-3 text-zinc-100">{row.displayLabel}</td>
              <td className="py-2 pe-3 text-zinc-300">
                {row.kind === "club" ? "מועדון" : "חשבון"}
              </td>
              <td className="py-2 pe-3 font-mono text-xs text-zinc-400" dir="ltr">
                {row.path ?? "-"}
              </td>
              <td className="py-2 text-zinc-300">
                {formatRelative(row.lastSeenAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentLogins({ rows }: { rows: AuthLoginEvent[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-400">
        עדיין אין אירועי התחברות. הם מופיעים אחרי כניסה לחשבון.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="py-2 pe-3 font-medium">מתי</th>
            <th className="py-2 pe-3 font-medium">אימייל</th>
            <th className="py-2 pe-3 font-medium">מזהה</th>
            <th className="py-2 font-medium">דפדפן</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-zinc-800/80 align-top">
              <td className="py-2 pe-3 text-zinc-300">
                {formatDateTime(row.created_at)}
              </td>
              <td className="py-2 pe-3 text-zinc-200">{row.email ?? "-"}</td>
              <td className="py-2 pe-3 font-mono text-[10px] text-zinc-500">
                {row.user_id.slice(0, 8)}...
              </td>
              <td className="max-w-[14rem] truncate py-2 text-xs text-zinc-500">
                {row.user_agent ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StudioUsersDashboard({ data }: StudioUsersDashboardProps) {
  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="מחוברים כרגע"
          value={data.onlineCount}
          hint="פעילות ב-5 דקות אחרונות"
        />
        <SummaryCard
          title="משתמשים"
          value={data.totalUsers}
          hint='מ-Auth (עד 200)'
        />
        <SummaryCard
          title="כניסות היום"
          value={data.loginsToday}
          hint="מ-auth_login_events"
        />
        <SummaryCard
          title="גישת וידאו"
          value={data.withVideoAccess}
          hint="has_video_access או premium"
        />
      </div>

      <section className="border border-emerald-900/50 bg-emerald-950/20 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">
          מחוברים כרגע לאתר
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          חשבון (אימייל/SMS) או מועדון (טלפון). תוויות ממוסכות. רק כאן בסטודיו.
        </p>
        <OnlineNow rows={data.onlineNow} />
      </section>

      <section className="border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">כניסות אחרונות</h2>
        <RecentLogins rows={data.recentLogins} />
      </section>

      <section className="border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">כל המשתמשים</h2>
        <p className="mt-1 text-xs text-zinc-500">
          ממוין לפי כניסה אחרונה. אפשר להעניק גישה מכאן.
        </p>

        {data.users.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">אין משתמשים עדיין.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 pe-3 font-medium">אימייל</th>
                  <th className="py-2 pe-3 font-medium">Auth: כניסה אחרונה</th>
                  <th className="py-2 pe-3 font-medium">אירוע כניסה</th>
                  <th className="py-2 pe-3 font-medium">כניסות</th>
                  <th className="py-2 pe-3 font-medium">תפוגת גישה</th>
                  <th className="py-2 pe-3 font-medium">וידאו</th>
                  <th className="py-2 pe-3 font-medium">פגישה</th>
                  <th className="py-2 font-medium">מזהה</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => {
                  const accessExpired =
                    user.accessExpiresAt &&
                    new Date(user.accessExpiresAt).getTime() < Date.now();
                  return (
                  <tr
                    key={user.userId}
                    className={`border-b border-zinc-800/80 align-top ${
                      accessExpired ? "bg-red-950/20" : ""
                    }`}
                  >
                    <td className="py-2 pe-3 text-zinc-100">
                      {user.email ?? "-"}
                    </td>
                    <td className="py-2 pe-3 text-zinc-300">
                      <span className="block">
                        {formatDateTime(user.lastSignInAt)}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-zinc-600">
                        הצטרף: {formatDateTime(user.createdAt)}
                      </span>
                    </td>
                    <td className="py-2 pe-3 text-zinc-300">
                      {formatDateTime(user.lastLoginEventAt)}
                    </td>
                    <td className="py-2 pe-3 font-mono text-xs text-zinc-400">
                      {user.loginCount}
                    </td>
                    <td className="py-2 pe-3">
                      <ProfileAccessExpiryEditor
                        userId={user.userId}
                        accessExpiresAt={user.accessExpiresAt}
                      />
                    </td>
                    <td className="py-2 pe-3">
                      <VideoAccessToggle
                        userId={user.userId}
                        enabled={user.hasVideoAccess}
                      />
                    </td>
                    <td className="py-2 pe-3">
                      <RecordMeetingForm userId={user.userId} />
                    </td>
                    <td className="py-2 font-mono text-[10px] text-zinc-600">
                      {user.userId}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
