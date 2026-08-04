/**
 * Lightweight platform snapshot for Studio (env only, no invasive API calls).
 */

export type StudioPlatformSnapshot = {
  vercelEnv: string | null;
  vercelCommit: string | null;
  vercelUrl: string | null;
  siteUrl: string;
  cfAccessConfigured: boolean;
  studioRequireCfAccess: boolean;
  githubRepoUrl: string | null;
  githubActionsHint: string;
};

function trimEnv(key: string): string | null {
  const v = process.env[key]?.trim();
  return v || null;
}

/**
 * Read-only deploy / access hints available on Vercel and local .env.
 * Does not call Cloudflare, Vercel, or GitHub APIs.
 */
export function getStudioPlatformSnapshot(): StudioPlatformSnapshot {
  const vercelCommit =
    trimEnv("VERCEL_GIT_COMMIT_SHA") ?? trimEnv("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA");
  const githubRepoUrl =
    trimEnv("GITHUB_REPO_URL") ??
    trimEnv("NEXT_PUBLIC_GITHUB_REPO_URL");

  return {
    vercelEnv: trimEnv("VERCEL_ENV") ?? trimEnv("NODE_ENV"),
    vercelCommit: vercelCommit ? vercelCommit.slice(0, 7) : null,
    vercelUrl: trimEnv("VERCEL_URL")
      ? `https://${trimEnv("VERCEL_URL")}`
      : null,
    siteUrl:
      trimEnv("NEXT_PUBLIC_SITE_URL") ?? "https://nevermind.co.il",
    cfAccessConfigured: Boolean(
      trimEnv("CF_ACCESS_TEAM_DOMAIN") && trimEnv("CF_ACCESS_AUD"),
    ),
    studioRequireCfAccess:
      trimEnv("STUDIO_REQUIRE_CF_ACCESS") === "1" ||
      trimEnv("STUDIO_REQUIRE_CF_ACCESS") === "true",
    githubRepoUrl,
    githubActionsHint:
      "סטטוס בילד ב-GitHub Actions / Vercel Deployments. בלי מפתחות נוספים כאן.",
  };
}
