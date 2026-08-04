import "server-only";

import { getAllArticles } from "@/lib/content/articles";
import {
  formatLiveSlotLine,
  LIVE_SCHEDULE_SLOTS,
  nextOccurrenceForSlot,
} from "@/lib/live/schedule";
import { getLivePublicStatus } from "@/lib/live/status";
import { listBrowseVideos } from "@/lib/videos/queries";
import { getWatchHref } from "@/lib/videos/watch-path";

export type LiveUpdateItem = {
  id: string;
  kind: "live" | "video" | "article" | "site" | "schedule";
  eyebrow: string;
  title: string;
  href: string;
  /** Short Hebrew date or relative label. */
  dateLabel: string;
};

function formatHeDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function friendlyDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (isSameDay(d, now)) return "היום";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "אתמול";
  return formatHeDate(iso);
}

function scheduleDateLabel(when: Date): string {
  const now = new Date();
  if (isSameDay(when, now)) return "היום";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(when, tomorrow)) return "מחר";
  return when.toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    timeZone: "Asia/Jerusalem",
  });
}

/**
 * Fresh public signals for the top live-updates strip.
 */
export async function getLiveUpdateItems(): Promise<LiveUpdateItem[]> {
  const items: LiveUpdateItem[] = [];
  const now = new Date();

  const [live, videos] = await Promise.all([
    getLivePublicStatus().catch(() => ({ isLive: false, topic: "" })),
    listBrowseVideos({ limit: 6, filter: "open", sort: "newest" }).catch(
      () => [],
    ),
  ]);

  if (live.isLive) {
    items.push({
      id: "live-now",
      kind: "live",
      eyebrow: "שידור חי",
      title: live.topic.trim() || "עכשיו באתר",
      href: "/live",
      dateLabel: "עכשיו",
    });
  } else {
    const upcoming = LIVE_SCHEDULE_SLOTS.map((slot) => ({
      slot,
      when: nextOccurrenceForSlot(slot, now),
    })).sort((a, b) => a.when.getTime() - b.when.getTime());

    for (const row of upcoming.slice(0, 3)) {
      items.push({
        id: `schedule-${row.slot.id}`,
        kind: "schedule",
        eyebrow: "לייב",
        title: `LIVE באתר: ${formatLiveSlotLine(row.slot)}`,
        href: "/live",
        dateLabel: scheduleDateLabel(row.when),
      });
    }
  }

  for (const video of videos.slice(0, 5)) {
    const title = video.title?.trim();
    if (!title) continue;
    items.push({
      id: `video-${video.id}`,
      kind: "video",
      eyebrow: "סרטון",
      title,
      href: getWatchHref(video),
      dateLabel: friendlyDate(video.created_at) || "חדש",
    });
  }

  for (const article of getAllArticles().slice(0, 2)) {
    items.push({
      id: `article-${article.slug}`,
      kind: "article",
      eyebrow: "מאמר",
      title: article.title,
      href: `/articles/${article.slug}`,
      dateLabel: "באתר",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "site-active",
      kind: "site",
      eyebrow: "עדכון",
      title: "האתר פעיל. חפשו מושג או סרטון.",
      href: "/search",
      dateLabel: friendlyDate(new Date().toISOString()) || "היום",
    });
  }

  return items;
}
