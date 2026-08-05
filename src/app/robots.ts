import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://nevermind.co.il";

/**
 * Keep admin / private surfaces out of search indexes.
 * Studio gate slug defaults to nm-ops (override via STUDIO_GATE_SLUG).
 */
export default function robots(): MetadataRoute.Robots {
  const gateSlug = (process.env.STUDIO_GATE_SLUG || "nm-ops").replace(
    /^\/+|\/+$/g,
    "",
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/podcast.xml", "/api/podcast/"],
        disallow: [
          "/api/admin/",
          "/api/club/",
          "/api/search/",
          "/api/thumbs/",
          "/studio",
          "/studio/",
          `/${gateSlug}`,
          `/${gateSlug}/`,
          "/not-found-studio",
          "/my-list",
          "/profile",
          "/live",
          "/auth/",
          "/q/",
          "/nm-ops",
          "/nm-ops/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
