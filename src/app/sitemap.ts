import type { MetadataRoute } from "next";

import { getAllArticles } from "@/lib/content/articles";
import { createClient } from "@/lib/supabase/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://nevermind.co.il";

const STATIC_PATHS = [
  "",
  "/articles",
  "/videos",
  "/search",
  "/contact",
  "/paths",
  "/books",
  "/mechanisms",
  "/concepts",
  "/booking",
  "/members",
  "/privacy",
  "/accessibility",
] as const;

async function listPublicYoutubeIds(): Promise<
  Array<{ youtube_id: string; created_at: string }>
> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("videos")
      .select("youtube_id, created_at")
      .eq("is_gated", false)
      .order("created_at", { ascending: false })
      .limit(2000);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/videos" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/videos" || path === "/search" ? 0.9 : 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = getAllArticles().map(
    (article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  const videos = await listPublicYoutubeIds();
  const videoEntries: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${SITE_URL}/watch/${video.youtube_id}`,
    lastModified: new Date(video.created_at),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticEntries, ...articleEntries, ...videoEntries];
}
