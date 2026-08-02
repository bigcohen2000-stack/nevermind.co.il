/**
 * YouTube playlistItems often keeps tombstone rows after a video is removed:
 * title "Deleted video" or "Private video". Those are not playable.
 */
export function isYoutubeUnavailableTitle(title: string | null | undefined): boolean {
  const t = (title ?? "").trim().toLowerCase();
  if (!t) return false;
  return (
    t === "deleted video" ||
    t === "private video" ||
    t.startsWith("deleted video") ||
    t.startsWith("private video")
  );
}
