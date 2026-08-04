"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  requestMeetingConfirmation,
  scheduleUserMeeting,
} from "@/actions/studio-user-meeting";
import { ProfileAccessExpiryEditor } from "@/components/studio/profile-access-expiry-editor";
import { StudioCopyButton } from "@/components/studio/studio-copy-button";
import { StudioCsvExportButton } from "@/components/studio/studio-csv-export-button";
import { VideoAccessToggle } from "@/components/studio/video-access-toggle";
import { buildTimeGreeting } from "@/lib/greeting/time-greeting";
import type { StudioPlatformSnapshot } from "@/lib/studio/platform-snapshot";
import type {
  MeetingStatus,
  StudioOnlineRow,
  StudioUserRow,
  StudioUsersDashboardData,
} from "@/lib/studio/users-dashboard";
import type { AuthLoginEvent } from "@/types/supabase";

type StudioUsersDashboardProps = {
  data: StudioUsersDashboardData;
  platform: StudioPlatformSnapshot;
};

type UserFilter = "all" | "video" | "expiring" | "pending-meeting" | "online";

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("he-IL", { dateStyle: "medium" });
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function meetingStatusLabel(status: MeetingStatus | null): string {
  if (!status) return "-";
  if (status === "scheduled") return "מתוכננת";
  if (status === "confirmed") return "אושרה (V)";
  if (status === "held") return "התקיימה";
  if (status === "cancelled") return "בוטלה";
  return status;
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
    <section className="border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
      <h2 className="text-xs font-medium tracking-wide text-zinc-400">{title}</h2>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-zinc-500">{hint}</p>
    </section>
  );
}

function PlatformStrip({ platform }: { platform: StudioPlatformSnapshot }) {
  return (
    <section className="border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400">
      <h2 className="text-sm font-medium text-zinc-200">סטטוס פלטפורמה (קריאה בלבד)</h2>
      <p className="mt-1 text-[11px] text-zinc-500">
        בלי קריאות פולשניות ל-Cloudflare / Vercel / GitHub. רק מה שכבר זמין ב-env.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-start">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="py-2 pe-3 font-medium">מקור</th>
              <th className="py-2 pe-3 font-medium">ערך</th>
              <th className="py-2 font-medium">הערה</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-800/80">
              <td className="py-2 pe-3 text-zinc-300">Vercel</td>
              <td className="py-2 pe-3 font-mono text-zinc-200" dir="ltr">
                {platform.vercelEnv ?? "-"}
                {platform.vercelCommit ? ` · ${platform.vercelCommit}` : ""}
              </td>
              <td className="py-2 text-zinc-500">
                {platform.vercelUrl ? (
                  <a
                    href={platform.vercelUrl}
                    className="underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    deployment URL
                  </a>
                ) : (
                  "מופיע אחרי deploy"
                )}
              </td>
            </tr>
            <tr className="border-b border-zinc-800/80">
              <td className="py-2 pe-3 text-zinc-300">Cloudflare Access</td>
              <td className="py-2 pe-3 text-zinc-200">
                {platform.cfAccessConfigured ? "מוגדר" : "לא מוגדר"}
                {platform.studioRequireCfAccess ? " · חובה לסטודיו" : ""}
              </td>
              <td className="py-2 text-zinc-500">הגנת /studio בלבד</td>
            </tr>
            <tr className="border-b border-zinc-800/80">
              <td className="py-2 pe-3 text-zinc-300">GitHub</td>
              <td className="py-2 pe-3 text-zinc-200" dir="ltr">
                {platform.githubRepoUrl ? (
                  <a
                    href={platform.githubRepoUrl}
                    className="underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    repo
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-2 text-zinc-500">{platform.githubActionsHint}</td>
            </tr>
            <tr>
              <td className="py-2 pe-3 text-zinc-300">Site</td>
              <td className="py-2 pe-3 font-mono text-zinc-200" dir="ltr">
                {platform.siteUrl}
              </td>
              <td className="py-2 text-zinc-500">NEXT_PUBLIC_SITE_URL</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OnlineTable({ rows }: { rows: StudioOnlineRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-400">
        אין מחוברים כרגע (פעילות ב-5 הדקות האחרונות).
      </p>
    );
  }

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="py-2 pe-3 font-medium">מי</th>
            <th className="py-2 pe-3 font-medium">סוג</th>
            <th className="py-2 pe-3 font-medium">עמוד</th>
            <th className="py-2 font-medium">נראה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sessionKey} className="border-b border-zinc-800/80">
              <td className="py-2 pe-3 text-zinc-100">{row.displayLabel}</td>
              <td className="py-2 pe-3 text-zinc-300">
                {row.kind === "club" ? "מועדון" : "חשבון"}
              </td>
              <td className="py-2 pe-3 font-mono text-xs text-zinc-400" dir="ltr">
                {row.path ?? "-"}
              </td>
              <td className="py-2 text-zinc-300">
                {formatDateTime(row.lastSeenAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoginsTable({ rows }: { rows: AuthLoginEvent[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-400">
        עדיין אין אירועי התחברות.
      </p>
    );
  }

  return (
    <div className="mt-3 overflow-x-auto">
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
            <tr key={row.id} className="border-b border-zinc-800/80">
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

function UserActions({
  user,
  onHint,
}: {
  user: StudioUserRow;
  onHint: (msg: string) => void;
}) {
  const router = useRouter();
  const [heldAt, setHeldAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return toLocalInputValue(d);
  });
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [waText, setWaText] = useState<string | null>(null);

  const siteGreeting = buildTimeGreeting({ name: user.displayName });

  function afterMeetingOk(message: string, whatsappText?: string | null) {
    if (whatsappText) setWaText(whatsappText);
    onHint(message);
    router.refresh();
  }

  return (
    <div className="space-y-3 border-t border-zinc-800 bg-zinc-950/40 p-4 text-xs">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[10px] text-zinc-500">תפוגת גישה</p>
          <div className="mt-1">
            <ProfileAccessExpiryEditor
              userId={user.userId}
              accessExpiresAt={user.accessExpiresAt}
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500">גישת וידאו</p>
          <div className="mt-1">
            <VideoAccessToggle
              userId={user.userId}
              enabled={user.hasVideoAccess}
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500">ברכה באתר (העתקה)</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <StudioCopyButton
              text={siteGreeting}
              label="העתק ברכה"
              onCopied={() => onHint("ברכה הועתקה.")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-[10px] text-zinc-500">תאריך פגישה</label>
          <input
            type="datetime-local"
            value={heldAt}
            onChange={(e) => setHeldAt(e.target.value)}
            className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-100"
            dir="ltr"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500">הערה</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-100"
            placeholder="אופציונלי"
          />
        </div>
        <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
          <button
            type="button"
            disabled={pending}
            className="min-h-9 border border-zinc-600 px-3 text-zinc-200 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                const result = await scheduleUserMeeting({
                  userId: user.userId,
                  heldAt,
                  note,
                  status: "scheduled",
                  requestConfirmation: true,
                  customerName: user.displayName,
                });
                if (!result.ok) {
                  onHint(result.error);
                  return;
                }
                afterMeetingOk(
                  result.message ?? "נקבעה + קישור אישור.",
                  result.whatsappText,
                );
              });
            }}
          >
            קבע + בקש V
          </button>
          <button
            type="button"
            disabled={pending}
            className="min-h-9 border border-zinc-600 px-3 text-zinc-200 disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                const result = await scheduleUserMeeting({
                  userId: user.userId,
                  heldAt,
                  note,
                  status: "held",
                  customerName: user.displayName,
                });
                if (!result.ok) {
                  onHint(result.error);
                  return;
                }
                afterMeetingOk(result.message ?? "נרשמה פגישה שהתקיימה.");
              });
            }}
          >
            רשום שהתקיימה
          </button>
          {user.lastMeetingId ? (
            <button
              type="button"
              disabled={pending}
              className="min-h-9 border border-zinc-600 px-3 text-zinc-200 disabled:opacity-50"
              onClick={() => {
                startTransition(async () => {
                  const result = await requestMeetingConfirmation({
                    meetingId: user.lastMeetingId!,
                    customerName: user.displayName,
                  });
                  if (!result.ok) {
                    onHint(result.error);
                    return;
                  }
                  afterMeetingOk(
                    result.message ?? "קישור אישור חדש.",
                    result.whatsappText,
                  );
                });
              }}
            >
              שלח שוב קישור V
            </button>
          ) : null}
        </div>
      </div>

      {waText ? (
        <div className="space-y-2 border border-zinc-700 bg-zinc-900 p-3">
          <pre className="whitespace-pre-wrap font-sans text-[11px] text-zinc-300">
            {waText}
          </pre>
          <div className="flex flex-wrap gap-2">
            <StudioCopyButton
              text={waText}
              label="העתק לוואטסאפ"
              onCopied={() => onHint("הודעת אישור הועתקה.")}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function StudioUsersDashboard({
  data,
  platform,
}: StudioUsersDashboardProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserFilter>("all");
  const [query, setQuery] = useState("");
  const [openUserId, setOpenUserId] = useState<string | null>(null);

  const onlineUserIds = useMemo(() => {
    const set = new Set<string>();
    for (const row of data.onlineNow) {
      if (row.userId) set.add(row.userId);
    }
    return set;
  }, [data.onlineNow]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.users.filter((user) => {
      if (filter === "video" && !user.hasVideoAccess) return false;
      if (filter === "pending-meeting" && !user.pendingConfirmation) return false;
      if (filter === "online" && !onlineUserIds.has(user.userId)) return false;
      if (filter === "expiring") {
        if (!user.accessExpiresAt) return false;
        const t = new Date(user.accessExpiresAt).getTime();
        const now = Date.now();
        if (!(t >= now && t <= now + 7 * 24 * 60 * 60 * 1000)) return false;
      }
      if (!q) return true;
      return (
        (user.email ?? "").toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q) ||
        user.userId.toLowerCase().includes(q)
      );
    });
  }, [data.users, filter, query, onlineUserIds]);

  const filters: { id: UserFilter; label: string }[] = [
    { id: "all", label: "הכל" },
    { id: "video", label: "עם גישת וידאו" },
    { id: "expiring", label: "תפוגה בקרוב" },
    { id: "pending-meeting", label: "ממתינים ל-V" },
    { id: "online", label: "מחוברים עכשיו" },
  ];

  return (
    <div className="space-y-10">
      {data.loadError ? (
        <p
          role="alert"
          className="border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          {data.loadError}
        </p>
      ) : null}

      {hint ? (
        <p className="text-sm text-zinc-300" role="status">
          {hint}
        </p>
      ) : null}

      <PlatformStrip platform={platform} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          title="מחוברים"
          value={data.onlineCount}
          hint="5 דקות אחרונות"
        />
        <SummaryCard
          title="משתמשים"
          value={data.totalUsers}
          hint="Auth עד 200"
        />
        <SummaryCard
          title="כניסות היום"
          value={data.loginsToday}
          hint="auth_login_events"
        />
        <SummaryCard
          title="גישת וידאו"
          value={data.withVideoAccess}
          hint="has_video_access / premium"
        />
        <SummaryCard
          title="תפוגה בקרוב"
          value={data.expiringSoonCount}
          hint="7 ימים"
        />
        <SummaryCard
          title="ממתינים ל-V"
          value={data.pendingMeetingConfirmCount}
          hint="פגישות מתוכננות"
        />
      </div>

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-100">מחוברים עכשיו</h2>
        <OnlineTable rows={data.onlineNow} />
      </section>

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              טבלת משתמשים
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              הרשמה, תפוגה, פגישה אחרונה, ופעולות לכל שורה.
            </p>
          </div>
          <StudioCsvExportButton
            filename={`studio-users-${new Date().toISOString().slice(0, 10)}.csv`}
            headers={[
              "email",
              "display_name",
              "created_at",
              "last_sign_in",
              "access_expires_at",
              "has_video_access",
              "last_meeting_at",
              "last_meeting_status",
              "meeting_count",
              "login_count",
              "user_id",
            ]}
            rows={filteredUsers.map((u) => [
              u.email,
              u.displayName,
              u.createdAt,
              u.lastSignInAt,
              u.accessExpiresAt,
              u.hasVideoAccess ? "yes" : "no",
              u.lastMeetingAt,
              u.lastMeetingStatus,
              u.meetingCount,
              u.loginCount,
              u.userId,
            ])}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`border px-3 py-1.5 text-xs ${
                filter === f.id
                  ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש אימייל / שם / מזהה"
          className="mt-4 w-full max-w-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />

        {filteredUsers.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">אין משתמשים בסינון הזה.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[64rem] border-collapse text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 pe-3 font-medium">משתמש</th>
                  <th className="py-2 pe-3 font-medium">הרשמה</th>
                  <th className="py-2 pe-3 font-medium">כניסה אחרונה</th>
                  <th className="py-2 pe-3 font-medium">תפוגה</th>
                  <th className="py-2 pe-3 font-medium">פגישה</th>
                  <th className="py-2 pe-3 font-medium">סטטוס פגישה</th>
                  <th className="py-2 pe-3 font-medium">וידאו</th>
                  <th className="py-2 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const accessExpired =
                    user.accessExpiresAt &&
                    new Date(user.accessExpiresAt).getTime() < Date.now();
                  const open = openUserId === user.userId;
                  return (
                    <Fragment key={user.userId}>
                      <tr
                        className={`border-b border-zinc-800/80 align-top ${
                          accessExpired ? "bg-red-950/20" : ""
                        }`}
                      >
                        <td className="py-2 pe-3">
                          <p className="font-medium text-zinc-100">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-zinc-400" dir="ltr">
                            {user.email ?? "-"}
                          </p>
                          {onlineUserIds.has(user.userId) ? (
                            <span className="mt-1 inline-block text-[10px] text-emerald-400">
                              מחובר עכשיו
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2 pe-3 text-zinc-300">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-2 pe-3 text-zinc-300">
                          {formatDateTime(user.lastSignInAt)}
                          <span className="mt-0.5 block text-[10px] text-zinc-600">
                            כניסות: {user.loginCount}
                          </span>
                        </td>
                        <td
                          className={`py-2 pe-3 ${
                            accessExpired ? "text-red-300" : "text-zinc-300"
                          }`}
                        >
                          {formatDate(user.accessExpiresAt)}
                        </td>
                        <td className="py-2 pe-3 text-zinc-300">
                          {formatDateTime(user.lastMeetingAt)}
                          <span className="mt-0.5 block text-[10px] text-zinc-600">
                            סה"כ {user.meetingCount}
                          </span>
                        </td>
                        <td className="py-2 pe-3 text-zinc-300">
                          {meetingStatusLabel(user.lastMeetingStatus)}
                          {user.pendingConfirmation ? (
                            <span className="mt-0.5 block text-[10px] text-amber-300">
                              ממתין ל-V
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2 pe-3 text-zinc-300">
                          {user.hasVideoAccess ? "כן" : "לא"}
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            className="border border-zinc-600 px-2 py-1 text-[11px] text-zinc-200"
                            onClick={() =>
                              setOpenUserId(open ? null : user.userId)
                            }
                          >
                            {open ? "סגור" : "נהל"}
                          </button>
                        </td>
                      </tr>
                      {open ? (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <UserActions user={user} onHint={setHint} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-100">כניסות אחרונות</h2>
        <LoginsTable rows={data.recentLogins} />
      </section>
    </div>
  );
}
