import { getClubPasswordStatus } from "@/actions/club-login";
import { listStudioViewerFeedback } from "@/actions/viewer-feedback";
import { ClubMembersPanel } from "@/components/studio/club-members-panel";
import { ClubPasswordPanel } from "@/components/studio/club-password-panel";
import { ClubTokenMint } from "@/components/studio/club-token-mint";
import {
  LiveStreamStudioPanel,
  type LiveStudioStatus,
} from "@/components/studio/live-stream-studio-panel";
import { StudioAccordion } from "@/components/studio/studio-accordion";
import { StudioFeedbackPanel } from "@/components/studio/studio-feedback-panel";
import { StudioHealthPanel } from "@/components/studio/studio-health-panel";
import { StudioLibraryPanel } from "@/components/studio/studio-library-panel";
import { StudioLockButton } from "@/components/studio/studio-lock-button";
import { StudioNav } from "@/components/studio/studio-nav";
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

async function listClubMembers(limit = 80) {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("club_members")
      .select(
        "phone, display_name, notes, expires_at, created_at, updated_at, last_seen_at",
      )
      .order("updated_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
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
    members,
    recentLogins,
    liveRow,
    feedbackItems,
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
  ]);

  const liveStatus: LiveStudioStatus = {
    isLive: Boolean(liveRow?.is_live),
    youtubeUrl: liveRow?.youtube_url ?? "",
    topic: liveRow?.topic ?? "",
    startedAt: liveRow?.started_at ?? null,
    updatedAt: liveRow?.updated_at ?? null,
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16" dir="rtl">
      <header className="space-y-5">
        <StudioNav active="ingestion" actions={<StudioLockButton />} />
        <div>
          <p className="text-xs text-zinc-500">ניהול פנימי</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            סטודיו
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            ייבוא סרטונים, מועדון, טעימות ושידור חי. העמוד לא מפורסם באתר
            הציבורי. כניסה רק דרך הסימנייה הפרטית.{" "}
            <a
              href="/studio/guide"
              className="text-zinc-200 underline-offset-2 hover:underline"
            >
              מדריך: מה כל אזור עושה
            </a>
            .
          </p>
        </div>
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
        </nav>
      </header>

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
            children: <LiveStreamStudioPanel status={liveStatus} />,
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
                members={members}
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
            id: "feedback",
            title: "משוב ולבבות",
            summary: "דיסלייקים ובקשות תשובה מהאתר",
            children: <StudioFeedbackPanel items={feedbackItems} />,
          },
        ]}
      />
    </main>
  );
}
