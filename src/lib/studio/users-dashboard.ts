import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AuthLoginEvent } from "@/types/supabase";

export type StudioUserRow = {
  userId: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  hasVideoAccess: boolean;
  isPremium: boolean;
  loginCount: number;
  lastLoginEventAt: string | null;
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
};

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function startOfLocalDay(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Combine Auth admin users, profiles entitlement, auth_login_events, presence.
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
  };

  try {
    const admin = getSupabaseAdmin();
    const since = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();

    const [
      { data: authData, error: authError },
      { data: profiles, error: profilesError },
      { data: loginEvents, error: loginsError },
      { data: presenceRows, error: presenceError },
    ] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      admin.from("profiles").select("id, is_premium, has_video_access"),
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
    ]);

    if (authError) return empty;

    const profileMap = new Map<
      string,
      { is_premium: boolean; has_video_access: boolean }
    >();
    if (!profilesError && profiles) {
      for (const row of profiles) {
        profileMap.set(row.id, {
          is_premium: Boolean(row.is_premium),
          has_video_access: Boolean(row.has_video_access),
        });
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

    const users: StudioUserRow[] = (authData?.users ?? []).map((user) => {
      const profile = profileMap.get(user.id);
      const hasVideoAccess =
        Boolean(profile?.has_video_access) || Boolean(profile?.is_premium);
      return {
        userId: user.id,
        email: user.email ?? null,
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        hasVideoAccess,
        isPremium: Boolean(profile?.is_premium),
        loginCount: loginCountByUser.get(user.id) ?? 0,
        lastLoginEventAt: lastEventByUser.get(user.id) ?? null,
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

    return {
      users,
      recentLogins: events.slice(0, 40),
      onlineNow,
      totalUsers: users.length,
      loginsToday,
      withVideoAccess: users.filter((u) => u.hasVideoAccess).length,
      onlineCount: onlineNow.length,
    };
  } catch {
    return empty;
  }
}
