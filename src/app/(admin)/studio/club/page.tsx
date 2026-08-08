import Link from "next/link";

import { getClubPasswordStatus } from "@/actions/club-login";
import { ClubMembersPanel } from "@/components/studio/club-members-panel";
import { ClubOpsChecklist } from "@/components/studio/club-ops-checklist";
import { ClubPasswordPanel } from "@/components/studio/club-password-panel";
import { ClubTokenMint } from "@/components/studio/club-token-mint";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

type ClubMemberListRow = {
  phone: string;
  display_name: string;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
  ops_link_minted_at: string | null;
  ops_whatsapp_sent_at: string | null;
  renewal_requested_at: string | null;
};

async function listClubMembers(limit = 80): Promise<{
  members: ClubMemberListRow[];
  error: string | null;
}> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("club_members")
      .select(
        "phone, display_name, notes, expires_at, created_at, updated_at, last_seen_at, ops_link_minted_at, ops_whatsapp_sent_at, renewal_requested_at",
      )
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (!error) {
      return { members: (data as ClubMemberListRow[]) ?? [], error: null };
    }

    const fallback = await admin
      .from("club_members")
      .select("phone, display_name, notes, created_at, updated_at, last_seen_at")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (fallback.error) {
      return { members: [], error: fallback.error.message };
    }

    return {
      members: (fallback.data ?? []).map((row) => ({
        phone: row.phone,
        display_name: row.display_name,
        notes: row.notes,
        expires_at: null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        last_seen_at: row.last_seen_at,
        ops_link_minted_at: null,
        ops_whatsapp_sent_at: null,
        renewal_requested_at: null,
      })),
      error: null,
    };
  } catch (err) {
    return {
      members: [],
      error: err instanceof Error ? err.message : "טעינת חברים נכשלה.",
    };
  }
}

async function listRecentClubLogins(limit = 30) {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_login_events")
      .select("id, phone, display_name, source, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

async function listRecentTokens(limit = 12) {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_tokens")
      .select(
        "id, phone, expires_at, revoked_at, last_used_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function StudioClubPage() {
  const unlocked = await isStudioAuthenticated();
  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const [membersResult, recentLogins, passwordStatus, recentTokens] =
    await Promise.all([
      listClubMembers(80),
      listRecentClubLogins(30),
      getClubPasswordStatus(),
      listRecentTokens(12),
    ]);

  return (
    <StudioPageShell
      active="club"
      title="חברי מועדון"
      description="פתיחת גישה, קישור, סיסמה, ותבניות וואטסאפ. בלי סליקה באתר."
      actions={
        <Link
          href="/studio/users"
          className="inline-flex min-h-11 items-center border border-zinc-600 px-3 text-xs text-zinc-200 transition hover:border-zinc-400"
        >
          משתמשים וגישת וידאו
        </Link>
      }
    >
      <div className="space-y-8">
        <ClubOpsChecklist members={membersResult.members} />

        <section id="password" className="scroll-mt-6">
          <ClubPasswordPanel status={passwordStatus} />
        </section>

        <section id="members" className="scroll-mt-6">
          <ClubMembersPanel
            members={membersResult.members}
            recentLogins={recentLogins}
            loadError={membersResult.error}
          />
        </section>

        <section id="tokens" className="scroll-mt-6">
          <ClubTokenMint recentTokens={recentTokens} />
        </section>
      </div>
    </StudioPageShell>
  );
}
