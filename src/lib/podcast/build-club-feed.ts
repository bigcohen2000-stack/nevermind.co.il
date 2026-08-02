import "server-only";

import { Podcast } from "podcast";

import {
  getClubPodcastAudioUrl,
  getClubPodcastFeedUrl,
  getPodcastOwnerEmail,
  getPodcastSiteUrl,
} from "@/lib/podcast/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getWatchHref } from "@/lib/videos/watch-path";
import type { Video } from "@/types/supabase";

const FEED_TITLE = "NeverMinde Club: מאגר החקירה";
const FEED_DESCRIPTION =
  "פיד פרטי לחברי מועדון. סרטונים ושיחות לא רשומים, אודיו בלבד.";
const FEED_AUTHOR = "NeverMinde";
const FEED_LANGUAGE = "he";

/**
 * Private iTunes-compatible RSS for club vault videos (gated / unlisted).
 * Enclosure URLs embed the same personal feed token.
 */
export async function buildClubPodcastRssXml(
  rawToken: string,
): Promise<string> {
  const siteUrl = getPodcastSiteUrl();
  const feedUrl = getClubPodcastFeedUrl(rawToken);
  const ownerEmail = getPodcastOwnerEmail();
  const videos = await listClubVaultVideos();

  const imageUrl =
    videos.find((v) => v.thumbnail_url)?.thumbnail_url ||
    `${siteUrl}/icons/icon-512.png`;

  const feed = new Podcast({
    title: FEED_TITLE,
    description: FEED_DESCRIPTION,
    feedUrl,
    siteUrl: `${siteUrl}/members`,
    imageUrl,
    language: FEED_LANGUAGE,
    generator: "NeverMinde Club Podcast Feed",
    author: FEED_AUTHOR,
    copyright: `${new Date().getFullYear()} NeverMinde`,
    ttl: 30,
    itunesAuthor: FEED_AUTHOR,
    itunesSubtitle: "מאגר מועדון בקול",
    itunesSummary: FEED_DESCRIPTION,
    itunesOwner: {
      name: FEED_AUTHOR,
      email: ownerEmail,
    },
    itunesExplicit: false,
    itunesCategory: [
      {
        text: "Education",
        subcats: [{ text: "Self-Improvement" }],
      },
    ],
    itunesImage: imageUrl,
    namespaces: {
      iTunes: true,
      podcast: false,
      simpleChapters: false,
    },
  });

  for (const video of videos) {
    if (!video.youtube_id?.trim()) continue;
    const watchUrl = `${siteUrl}${getWatchHref(video)}`;
    const audioUrl = getClubPodcastAudioUrl(video.youtube_id, rawToken);
    const description =
      video.description?.trim() || `חקירה באתר: ${watchUrl}`;

    feed.addItem({
      title: video.title,
      description,
      url: watchUrl,
      guid: `nevermind-club-${video.youtube_id}`,
      date: new Date(video.published_at || video.created_at),
      enclosure: {
        url: audioUrl,
        type: "audio/mpeg",
        size: 1,
      },
      itunesAuthor: FEED_AUTHOR,
      itunesExplicit: false,
      itunesSummary: description.slice(0, 4000),
      itunesImage: video.thumbnail_url || imageUrl,
      itunesTitle: video.title,
    });
  }

  return feed.buildXml({ indent: "  " });
}

async function listClubVaultVideos(): Promise<Video[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("videos")
      .select("*")
      .or("is_gated.eq.true,is_unlisted.eq.true")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) return [];
    return data.filter((v) => Boolean(v.youtube_id?.trim()));
  } catch {
    return [];
  }
}
