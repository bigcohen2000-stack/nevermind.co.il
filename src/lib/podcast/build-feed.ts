import "server-only";

import { Podcast } from "podcast";

import {
  getPodcastAudioUrl,
  getPodcastFeedUrl,
  getPodcastOwnerEmail,
  getPodcastSiteUrl,
} from "@/lib/podcast/config";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/types/supabase";

const FEED_TITLE = "NeverMinde: הרצאות";
const FEED_DESCRIPTION =
  "הרצאות וחקירה לוגית לפי מושגים. אותם מנגנונים, בקול.";
const FEED_AUTHOR = "NeverMinde";
const FEED_LANGUAGE = "he";

/**
 * Build an iTunes-compatible podcast RSS 2.0 document from public videos.
 */
export async function buildPodcastRssXml(): Promise<string> {
  const siteUrl = getPodcastSiteUrl();
  const feedUrl = getPodcastFeedUrl();
  const ownerEmail = getPodcastOwnerEmail();
  const videos = await listPublicPodcastVideos();

  const imageUrl =
    videos.find((v) => v.thumbnail_url)?.thumbnail_url ||
    `${siteUrl}/icon.png`;

  const feed = new Podcast({
    title: FEED_TITLE,
    description: FEED_DESCRIPTION,
    feedUrl,
    siteUrl,
    imageUrl,
    language: FEED_LANGUAGE,
    generator: "NeverMinde Podcast Feed",
    author: FEED_AUTHOR,
    copyright: `${new Date().getFullYear()} NeverMinde`,
    ttl: 60,
    itunesAuthor: FEED_AUTHOR,
    itunesSubtitle: "חקירה לוגית בקול",
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
    const watchUrl = `${siteUrl}/watch/${video.youtube_id}`;
    const audioUrl = getPodcastAudioUrl(video.youtube_id);
    const description =
      video.description?.trim() || `צפייה באתר: ${watchUrl}`;

    feed.addItem({
      title: video.title,
      description,
      url: watchUrl,
      guid: `nevermind-youtube-${video.youtube_id}`,
      date: new Date(video.created_at),
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

async function listPublicPodcastVideos(): Promise<Video[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_gated", false)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
