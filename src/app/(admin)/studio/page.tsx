import { getLivePushStats } from "@/actions/live-push";
import { getClubPasswordStatus } from "@/actions/club-login";
import { listStudioViewerFeedback } from "@/actions/viewer-feedback";
import { ClubMembersPanel } from "@/components/studio/club-members-panel";
import { ClubPasswordPanel } from "@/components/studio/club-password-panel";
import { ClubTokenMint } from "@/components/studio/club-token-mint";
import { LiveQueueStudioPanel } from "@/components/studio/live-queue-studio-panel";
import {
  LiveStreamStudioPanel,
  type LiveStudioStatus,
} from "@/components/studio/live-stream-studio-panel";
import { listLiveQueue } from "@/lib/live/queue";
import { StudioAccordion } from "@/components/studio/studio-accordion";
import { StudioFeedbackPanel } from "@/components/studio/studio-feedback-panel";
import { StudioHealthPanel } from "@/components/studio/studio-health-panel";
import { StudioLibraryPanel } from "@/components/studio/studio-library-panel";
import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioOpsTipsPanel } from "@/components/studio/studio-ops-tips";
import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { StudioSessionRequired } from "@/components/studio/studio-session-required";
import { StudioTeaserPanel } from "@/components/studio/studio-teaser-panel";
import { VideoIngestionStudio } from "@/components/studio/video-ingestion-studio";
import { getLiveStreamRow } from "@/lib/live/status";
import { getStudioHealth } from "@/lib/studio/health";
import { getStudioLibraryStatus } from "@/lib/studio/library-status";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import type { Video } from "@/types/supabase";

export const dynamic = "force-dynamic";

const JUMP_LINKS = [
  { href: "#readiness", label: "מוכנות" },
  { href: "#library", label: "ספרייה" },
  { href: "#ingest", label: "ייבוא" },
  { href: "#live", label: "שידור חי" },
  { href: "#teasers", label: "טעימות" },
  { href: "#password", label: "סיסמה" },
  { href: "#members", label: "חברים" },
  { href: "#tokens", label: "קישורים" },
  { href: "#ops-help", label: "דגשי ניהול" },
  { href: "#feedback", label: "משוב" },
] as const;

async function listRecentVideos(limit = 5): Promise<Video[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

async function listGatedVideosForTeaser(limit = 40): Promise<Video[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select("*")
      .or("is_gated.eq.true,is_unlisted.eq.true")
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

type ClubMemberListRow = {
  phone: string;
  display_name: string;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
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
        "phone, display_name, notes, expires_at, created_at, updated_at, last_seen_at",
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

export default async function StudioPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return <StudioSessionRequired />;
  }

  const [
    health,
    libraryStatus,
    recentVideos,
    gatedForTeaser,
    recentTokens,
    passwordStatus,
    membersResult,
    recentLogins,
    liveRow,
    feedbackItems,
    liveQueue,
    livePush,
  ] = await Promise.all([
    getStudioHealth(),
    getStudioLibraryStatus(),
    listRecentVideos(5),
    listGatedVideosForTeaser(40),
    listRecentTokens(12),
    getClubPasswordStatus(),
    listClubMembers(80),
    listRecentClubLogins(30),
    getLiveStreamRow(),
    listStudioViewerFeedback(40),
    listLiveQueue(40),
    getLivePushStats(),
  ]);

  const liveStatus: LiveStudioStatus = {
    isLive: Boolean(liveRow?.is_live),
    youtubeUrl: liveRow?.youtube_url ?? "",
    topic: liveRow?.topic ?? "",
    startedAt: liveRow?.started_at ?? null,
    updatedAt: liveRow?.updated_at ?? null,
  };

  return (
    <StudioPageShell
      active="ingestion"
      title="סטודיו"
      description="ייבוא סרטונים, מועדון, טעימות ושידור חי. העמוד לא מפורסם באתר הציבורי. כניסה רק דרך הסימנייה הפרטית."
      actions={<StudioLockButton />}
      summary={
        <nav
          aria-label="מעבר מהיר בתוך הסטודיו"
          className="flex flex-wrap gap-2 text-xs"
        >
          {JUMP_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="border border-zinc-700 px-2.5 py-1.5 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/studio/guide"
            className="border border-zinc-700 px-2.5 py-1.5 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
          >
            מדריך
          </a>
        </nav>
      }
    >
      <div className="space-y-8">
        <StudioHealthPanel health={health} />

        <StudioAccordion
          items={[
            {
              id: "library",
              title: "ספרייה וסנכרון",
              summary: "12 אחרונים, פערי טעימות, סנכרון YouTube",
              defaultOpen: true,
              children: <StudioLibraryPanel status={libraryStatus} />,
            },
            {
              id: "ingest",
              title: "ייבוא",
              summary: "קישור יוטיוב, לא רשום, אחרונים",
              children: (
                <VideoIngestionStudio
                  initialVideos={recentVideos}
                  embedded
                />
              ),
            },
            {
              id: "live",
              title: "שידור חי",
              children: (
                <div className="space-y-6">
                  <LiveStreamStudioPanel
                    status={liveStatus}
                    pushReady={livePush.vapidConfigured}
                    liveOptIns={livePush.optIns}
                  />
                  <LiveQueueStudioPanel
                    items={liveQueue.items}
                    loadError={liveQueue.error}
                  />
                </div>
              ),
            },
            {
              id: "teasers",
              title: "טעימות",
              children: <StudioTeaserPanel videos={gatedForTeaser} />,
            },
            {
              id: "password",
              title: "סיסמת מועדון",
              children: <ClubPasswordPanel status={passwordStatus} />,
            },
            {
              id: "members",
              title: "חברי מועדון",
              children: (
                <ClubMembersPanel
                  members={membersResult.members}
                  loadError={membersResult.error}
                  recentLogins={recentLogins}
                />
              ),
            },
            {
              id: "tokens",
              title: "קישורי כניסה",
              children: <ClubTokenMint recentTokens={recentTokens} />,
            },
            {
              id: "ops-help",
              title: "דגשי ניהול ותפעול",
              summary: "סיסמאות, פרסומים, תבניות עדכון",
              children: <StudioOpsTipsPanel />,
            },
            {
              id: "feedback",
              title: "משוב ולבבות",
              summary: "דיסלייקים ובקשות תשובה מהאתר",
              children: <StudioFeedbackPanel items={feedbackItems} />,
            },
          ]}
        />
      </div>
    </StudioPageShell>
  );
}
