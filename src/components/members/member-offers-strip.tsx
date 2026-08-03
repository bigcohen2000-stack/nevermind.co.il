import Link from "next/link";
import { Star } from "lucide-react";

import {
  MEMBER_POST_LOGIN_OFFERS,
} from "@/lib/content/access-layers";
import { cn } from "@/lib/utils";

/** Offers for site account after sign-in (club not required). */
export const SITE_POST_LOGIN_OFFERS = [
  {
    id: "members",
    title: "כניסה למועדון",
    body: "מאגר חסום, פיד פרטי, וחיפוש בתמליל. אחרי שיחת התאמה.",
    href: "/members#login",
    cta: "למועדון",
  },
  {
    id: "paths",
    title: "מסגרות ומחירים",
    body: "טבלת פלוסים ומסגרות מחיר גלויות. בלי סליקה באתר.",
    href: "/members#membership-prices",
    cta: "למסלולים",
  },
  {
    id: "videos",
    title: "סרטונים פתוחים",
    body: "להמשיך מהציבורי. טיזר קצר גם לסרטוני מועדון.",
    href: "/videos",
    cta: "לסרטונים",
  },
  {
    id: "my-list",
    title: "הרשימה שלי",
    body: "שמירה והיסטוריה בחשבון האתר. בלי פתיחת מאגר.",
    href: "/my-list",
    cta: "לרשימה",
  },
] as const;

type Offer = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

type MemberOffersStripProps = {
  /** Club / archive access open. */
  isMember?: boolean;
  tone?: "light" | "dark";
  className?: string;
  title?: string;
};

/**
 * Compact offer cards after login / club entry.
 */
export function MemberOffersStrip({
  isMember = false,
  tone = "dark",
  className,
  title = "הצעות בשבילכם עכשיו",
}: MemberOffersStripProps) {
  const offers: readonly Offer[] = isMember
    ? MEMBER_POST_LOGIN_OFFERS
    : SITE_POST_LOGIN_OFFERS;
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "border p-5 sm:p-6",
        dark
          ? "border-action/35 bg-ink text-[#FAFAF8]"
          : "border-foreground/20 bg-paper text-foreground",
        className,
      )}
    >
      <p
        className={cn(
          "flex items-center gap-2 text-xs font-medium tracking-[0.14em] uppercase",
          dark ? "text-[#FAFAF8]/55" : "text-muted",
        )}
      >
        <Star
          className="size-3.5 text-action"
          fill="currentColor"
          aria-hidden
        />
        מחוברים
      </p>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className={cn(
              "border p-4",
              dark
                ? "border-[#FAFAF8]/15 bg-black/40"
                : "border-foreground/15 bg-background",
            )}
          >
            <p className="font-medium tracking-tight">{offer.title}</p>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed",
                dark ? "text-[#FAFAF8]/70" : "text-muted",
              )}
            >
              {offer.body}
            </p>
            <Link
              href={offer.href}
              className="mt-4 inline-flex text-sm font-medium text-action no-underline hover:underline"
            >
              {offer.cta}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
