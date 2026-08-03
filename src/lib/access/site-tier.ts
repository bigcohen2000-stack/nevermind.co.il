/**
 * Site-wide access tier for chrome (not paywall logic).
 * Guest = public. Account = free Google/email. Club = archive unlocked by Yakir.
 */

export type SiteAccessTier = "guest" | "account" | "club";

export function resolveSiteAccessTier(input: {
  authUserId: string | null;
  /** True only after resolveVideoEntitlement (club cookie or has_video_access). */
  entitled: boolean;
}): SiteAccessTier {
  if (input.entitled) return "club";
  if (input.authUserId) return "account";
  return "guest";
}
