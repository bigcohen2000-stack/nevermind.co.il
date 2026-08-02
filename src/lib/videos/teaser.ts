/**
 * Resolve the YouTube id that locked (non-member) viewers may play.
 * Only a dedicated teaser clip. Never the full archive youtube_id.
 */

const YOUTUBE_ID_RE = /^[\w-]{11}$/;

export type TeaserSourceVideo = {
  teaser_youtube_id?: string | null;
  youtube_id?: string | null;
};

/** Public teaser clip id, or null when the lock should show with no player. */
export function getLockedTeaserYoutubeId(
  video: TeaserSourceVideo,
): string | null {
  const teaser = video.teaser_youtube_id?.trim() ?? "";
  if (!YOUTUBE_ID_RE.test(teaser)) return null;

  const full = video.youtube_id?.trim() ?? "";
  // Refuse to treat the full archive id as a "teaser" (would leak the whole video).
  if (full && teaser === full) return null;

  return teaser;
}

/** Extract an 11-char YouTube id from a raw id or watch/embed URL. */
export function extractYoutubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (YOUTUBE_ID_RE.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return YOUTUBE_ID_RE.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && YOUTUBE_ID_RE.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (embedIdx >= 0) {
        const id = parts[embedIdx + 1] ?? "";
        return YOUTUBE_ID_RE.test(id) ? id : null;
      }
    }
  } catch {
    /* not a URL */
  }

  const loose = raw.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([\w-]{11})/);
  return loose?.[1] && YOUTUBE_ID_RE.test(loose[1]) ? loose[1] : null;
}
