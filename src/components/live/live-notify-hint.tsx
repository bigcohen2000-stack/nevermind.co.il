"use client";

import Link from "next/link";

/**
 * Soft CTA on /live: remind signed-in viewers they can enable browser live alerts.
 */
export function LiveNotifyHint({ signedIn }: { signedIn: boolean }) {
  if (!signedIn) {
    return (
      <p className="text-sm text-foreground/70">
        רוצים התראה כששידור מתחיל?{" "}
        <Link
          href="/profile"
          className="text-action underline-offset-2 hover:underline"
        >
          התחברות
        </Link>
        {" ו "}
        <Link
          href="/profile?tab=settings#settings"
          className="text-action underline-offset-2 hover:underline"
        >
          הפעלת התראות בפרופיל
        </Link>
        .
      </p>
    );
  }

  return (
    <p className="text-sm text-foreground/70">
      אפשר לקבל התראת דפדפן כששידור חי מתחיל.{" "}
      <Link
        href="/profile?tab=settings#settings"
        className="text-action underline-offset-2 hover:underline"
      >
        הפעלה בהגדרות הפרופיל
      </Link>
      .
    </p>
  );
}
