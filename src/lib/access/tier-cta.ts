/**
 * Single source for tier-aware upgrade / next-step CTAs.
 * Guest = free account. Account = request club. Club = archive shortcuts.
 */

import type { SiteAccessTier } from "@/lib/access/site-tier";

export type TierCta = {
  href: string;
  label: string;
  /** Short status chip / aria hint. */
  statusLabel: string;
  variant: "primary" | "secondary";
};

export type TierCtaBundle = {
  tier: SiteAccessTier;
  statusLabel: string;
  primary: TierCta;
  secondary?: TierCta;
  /** One dry line under CTAs. */
  note: string;
};

export function getTierCtaBundle(tier: SiteAccessTier): TierCtaBundle {
  if (tier === "club") {
    return {
      tier,
      statusLabel: "מועדון פעיל",
      primary: {
        href: "/videos?filter=club",
        label: "ארכיון מועדון",
        statusLabel: "מועדון פעיל",
        variant: "primary",
      },
      secondary: {
        href: "/search",
        label: "חיפוש תמלילים",
        statusLabel: "מועדון פעיל",
        variant: "secondary",
      },
      note: "המאגר פתוח במכשיר הזה.",
    };
  }

  if (tier === "account") {
    return {
      tier,
      statusLabel: "חשבון במייל",
      primary: {
        href: "/members#access",
        label: "למועדון",
        statusLabel: "חשבון במייל",
        variant: "primary",
      },
      secondary: {
        href: "/my-list",
        label: "הרשימה שלי",
        statusLabel: "חשבון במייל",
        variant: "secondary",
      },
      note: "חשבון מייל שומר רשימה. הוא לא פותח את מאגר המועדון. גישה אחרי שיחה בוואטסאפ או במייל. אין סליקה באתר.",
    };
  }

  return {
    tier: "guest",
    statusLabel: "אורח",
    primary: {
      href: "/members#access",
      label: "למועדון",
      statusLabel: "אורח",
      variant: "primary",
    },
    secondary: {
      href: "/profile?mode=register",
      label: "הירשם לחשבון",
      statusLabel: "אורח",
      variant: "secondary",
    },
    note: "חשבון במייל שומר רשימה. מועדון נפתח אחרי שיחת התאמה. אין סליקה באתר.",
  };
}
