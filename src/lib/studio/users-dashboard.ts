import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AuthLoginEvent } from "@/types/supabase";

export type MeetingStatus =
  | "scheduled"
  | "confirmed"
  | "held"
  | "cancelled";

export type StudioUserRow = {
  userId: string;
  email: string | null;
  /** Short label for tables / greetings. */
  displayName: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  hasVideoAccess: boolean;
  isPremium: boolean;
  loginCount: number;
  lastLoginEventAt: string | null;
  accessExpiresAt: string | null;
  lastMeetingAt: string | null;
  lastMeetingStatus: MeetingStatus | null;
  lastMeetingId: string | null;
  meetingCount: number;
  pendingConfirmation: boolean;
};

export type StudioOnlineRow = {
  sessionKey: string;
  kind: "auth" | "club";
  displayLabel: string;
  path: string | null;
  lastSeenAt: string;
  userId: string | null;
};

export type StudioUsersDashboardData = {
  users: StudioUserRow[];
  recentLogins: AuthLoginEvent[];
  onlineNow: StudioOnlineRow[];
  totalUsers: number;
  loginsToday: number;
  withVideoAccess: number;
  onlineCount: number;
  expiringSoonCount: number;
  pendingMeetingConfirmCount: number;
  loadError: string | null;
};

const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const EXPIRING_SOON_MS = 7 * 24 * 60 * 60 * 1000;

function startOfLocalDay(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

function shortNameFromEmail(email: string | null): string {
  if (!email) return "משתמש";
  const local = email.split("@")[0]?.trim();
  if (!local) return "משתמש";
  return local.replace(/[._+-]+/g, " ").trim().slice(0, 32) || "משתמש";
}

type MeetingAgg = {
  lastAt: string;
  lastStatus: MeetingStatus;
  lastId: string;
  count: number;
  pendingConfirmation: boolean;
};

/**
 * Combine Auth admin users, profiles entitlement, meetings, auth_login_events, presence.
 */
export async function getStudioUsersDashboard(): Promise<StudioUsersDashboardData> {
  const empty: StudioUsersDashboardData = {
    users: [],
    recentLogins: [],
    onlineNow: [],
    totalUsers: 0,
    loginsToday: 0,
    withVideoAccess: 0,
    onlineCount: 0,
    expiringSoonCount: 0,
    pendingMeetingConfirmCount: 0,
    loadError: null,
  };

  try {
    const admin = getSupabaseAdmin();
    const since = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();

    const [
      { data: authData, error: authError },
      { data: profiles, error: profilesError },
      { data: loginEvents, error: loginsError },
      { data: presenceRows, error: presenceError },
      { data: meetings, error: meetingsError },
    ] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      admin
        .from("profiles")
        .select("id, is_premium, has_video_access, access_expires_at"),
      admin
        .from("auth_login_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("site_presence")
        .select("session_key, kind, display_label, path, last_seen_at, user_id")
        .gte("last_seen_at", since)
        .order("last_seen_at", { ascending: false })
        .limit(100),
      admin
        .from("user_meetings")
        .select("id, user_id, held_at, status, confirmation_token, confirmed_at")
        .order("held_at", { ascending: false })
        .limit(500),
    ]);

    if (authError) {
      return { ...empty, loadError: authError.message };
    }

    const profileMap = new Map<
      string,
      {
        is_premium: boolean;
        has_video_access: boolean;
        access_expires_at: string | null;
      }
    >();
    if (!profilesError && profiles) {
      for (const row of profiles) {
        profileMap.set(row.id, {
          is_premium: Boolean(row.is_premium),
          has_video_access: Boolean(row.has_video_access),
          access_expires_at: row.access_expires_at ?? null,
        });
      }
    }

    const meetingByUser = new Map<string, MeetingAgg>();
    if (!meetingsError && meetings) {
      for (const row of meetings) {
        const status = (row.status ?? "held") as MeetingStatus;
        const existing = meetingByUser.get(row.user_id);
        const pending =
          status === "scheduled" &&
          Boolean(row.confirmation_token) &&
          !row.confirmed_at;
        if (!existing) {
          meetingByUser.set(row.user_id, {
            lastAt: row.held_at,
            lastStatus: status,
            lastId: row.id,
            count: 1,
            pendingConfirmation: pending,
          });
        } else {
          existing.count += 1;
          if (pending) existing.pendingConfirmation = true;
        }
      }
    }

    const events = (!loginsError && loginEvents
      ? loginEvents
      : []) as AuthLoginEvent[];

    const loginCountByUser = new Map<string, number>();
    const lastEventByUser = new Map<string, string>();
    for (const event of events) {
      loginCountByUser.set(
        event.user_id,
        (loginCountByUser.get(event.user_id) ?? 0) + 1,
      );
      if (!lastEventByUser.has(event.user_id)) {
        lastEventByUser.set(event.user_id, event.created_at);
      }
    }

    const now = Date.now();
    const users: StudioUserRow[] = (authData?.users ?? []).map((user) => {
      const profile = profileMap.get(user.id);
      const hasVideoAccess =
        Boolean(profile?.has_video_access) || Boolean(profile?.is_premium);
      const meeting = meetingByUser.get(user.id);
      const email = user.email ?? null;
      return {
        userId: user.id,
        email,
        displayName: shortNameFromEmail(email),
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        hasVideoAccess,
        isPremium: Boolean(profile?.is_premium),
        loginCount: loginCountByUser.get(user.id) ?? 0,
        lastLoginEventAt: lastEventByUser.get(user.id) ?? null,
        accessExpiresAt: profile?.access_expires_at ?? null,
        lastMeetingAt: meeting?.lastAt ?? null,
        lastMeetingStatus: meeting?.lastStatus ?? null,
        lastMeetingId: meeting?.lastId ?? null,
        meetingCount: meeting?.count ?? 0,
        pendingConfirmation: meeting?.pendingConfirmation ?? false,
      };
    });

    users.sort((a, b) => {
      const aTime = a.lastSignInAt ?? a.createdAt ?? "";
      const bTime = b.lastSignInAt ?? b.createdAt ?? "";
      return bTime.localeCompare(aTime);
    });

    const todayStart = startOfLocalDay().getTime();
    const loginsToday = events.filter(
      (row) => new Date(row.created_at).getTime() >= todayStart,
    ).length;

    const onlineNow: StudioOnlineRow[] = (
      !presenceError && presenceRows ? presenceRows : []
    ).map((row) => ({
      sessionKey: row.session_key,
      kind: row.kind === "club" ? "club" : "auth",
      displayLabel: row.display_label,
      path: row.path,
      lastSeenAt: row.last_seen_at,
      userId: row.user_id,
    }));

    const expiringSoonCount = users.filter((u) => {
      if (!u.accessExpiresAt) return false;
      const t = new Date(u.accessExpiresAt).getTime();
      return t >= now && t <= now + EXPIRING_SOON_MS;
    }).length;

    return {
      users,
      recentLogins: events.slice(0, 40),
      onlineNow,
      totalUsers: users.length,
      loginsToday,
      withVideoAccess: users.filter((u) => u.hasVideoAccess).length,
      onlineCount: onlineNow.length,
      expiringSoonCount,
      pendingMeetingConfirmCount: users.filter((u) => u.pendingConfirmation)
        .length,
      loadError: meetingsError
        ? `פגישות: ${meetingsError.message} (החל מיגרציה 34 אם חסרות עמודות)`
        : null,
    };
  } catch (err) {
    return {
      ...empty,
      loadError: err instanceof Error ? err.message : "טעינה נכשלה.",
    };
  }
}
