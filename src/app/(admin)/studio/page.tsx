import { getClubPasswordStatus } from "@/actions/club-login";
import { ClubPasswordPanel } from "@/components/studio/club-password-panel";
import { ClubTokenMint } from "@/components/studio/club-token-mint";
import { StudioUnlockForm } from "@/components/studio/studio-unlock-form";
import { VideoIngestionStudio } from "@/components/studio/video-ingestion-studio";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isStudioAuthenticated } from "@/lib/studio/session";
import type { Video } from "@/types/supabase";

export const dynamic = "force-dynamic";

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

export default async function StudioPage() {
  const unlocked = await isStudioAuthenticated();

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-6 py-16">
        <StudioUnlockForm />
      </main>
    );
  }

  const [recentVideos, recentTokens, passwordStatus] = await Promise.all([
    listRecentVideos(5),
    listRecentTokens(12),
    getClubPasswordStatus(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16">
      <VideoIngestionStudio initialVideos={recentVideos} />
      <ClubPasswordPanel status={passwordStatus} />
      <ClubTokenMint recentTokens={recentTokens} />
    </main>
  );
}
