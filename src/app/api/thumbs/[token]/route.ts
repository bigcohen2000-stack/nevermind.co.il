import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isMembersOnlyVideo } from "@/lib/videos/access";
import { verifyOpaqueThumbToken } from "@/lib/videos/thumb-token";
import { GATED_LOCK_IMAGE } from "@/lib/videos/watch-path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ token: string }>;
};

/**
 * Proxies a members-only teaser thumbnail without exposing a YouTube id
 * in the client HTML. Token is HMAC over the internal video UUID.
 */
export async function GET(req: Request, { params }: RouteProps) {
  const { token } = await params;
  const lockFallback = () =>
    NextResponse.redirect(new URL(GATED_LOCK_IMAGE, req.url), 302);

  const videoUuid = verifyOpaqueThumbToken(token ?? "");
  if (!videoUuid) return lockFallback();

  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("videos")
      .select("youtube_id, thumbnail_url, is_gated, is_unlisted")
      .eq("id", videoUuid)
      .maybeSingle();

    if (!data || !isMembersOnlyVideo(data)) return lockFallback();

    const upstream =
      data.thumbnail_url?.trim() ||
      (data.youtube_id
        ? `https://i.ytimg.com/vi/${data.youtube_id}/hqdefault.jpg`
        : null);

    if (!upstream) return lockFallback();

    const res = await fetch(upstream, {
      // Short CDN cache; thumbs rarely change.
      next: { revalidate: 86400 },
    });
    if (!res.ok || !res.body) return lockFallback();

    const contentType = res.headers.get("content-type") || "image/jpeg";
    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return lockFallback();
  }
}
