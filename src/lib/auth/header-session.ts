import "server-only";

import { createClient } from "@/lib/supabase/server";
import { readClubSession } from "@/lib/club/session";
import { displayNameFromEmail } from "@/lib/greeting/time-greeting";
import type { HeaderSession } from "@/lib/auth/header-session-shared";

export type { HeaderSession } from "@/lib/auth/header-session-shared";
export {
  formatHeaderAuthLabel,
  formatHeaderClubLabel,
} from "@/lib/auth/header-session-shared";

export async function getHeaderSession(): Promise<HeaderSession> {
  let authUserId: string | null = null;
  let authEmail: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      authUserId = user.id;
      authEmail = user.email ?? user.phone ?? null;
    }
  } catch {
    // Auth unavailable in this request.
  }

  let clubPhone: string | null = null;
  let clubName: string | null = null;
  try {
    const club = await readClubSession();
    clubPhone = club?.phone ?? null;
    clubName = club?.name?.trim() || null;
  } catch {
    // Club cookie unavailable.
  }

  const displayName =
    clubName ||
    displayNameFromEmail(authEmail) ||
    null;

  return { authUserId, authEmail, clubPhone, displayName };
}
