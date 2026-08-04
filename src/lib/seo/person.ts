/**
 * Unified Person schema for יקיר כהן (Yakir Cohen).
 * Reuse as author on VideoObject / Article. Plain keyboard punctuation only.
 */

import { getSocialSameAsUrls } from "@/lib/social";
import { YOUTUBE_CHANNEL_URL } from "@/lib/whatsapp";

export const SITE_ORIGIN = "https://nevermind.co.il";
export const PERSON_ID = `${SITE_ORIGIN}/#yakir-cohen`;
const PUBLIC_PODCAST_FEED = `${SITE_ORIGIN}/api/podcast.xml`;

/** Absolute Person node for @graph / standalone JsonLd. */
export function buildYakirCohenPersonLd() {
  const sameAs = Array.from(
    new Set([
      YOUTUBE_CHANNEL_URL,
      PUBLIC_PODCAST_FEED,
      ...getSocialSameAsUrls(),
    ]),
  );

  return {
    "@type": "Person" as const,
    "@id": PERSON_ID,
    name: "יקיר כהן",
    alternateName: ["Yakir Cohen", "NeverMinde", "השם לא משנה"],
    url: SITE_ORIGIN,
    jobTitle: "חוקר ומנחה",
    description:
      "ניתוח לוגי של המציאות: הפרדה בין עובדה לבין סיפור. יוצר NeverMind (nevermind.co.il).",
    knowsAbout: [
      "הפרדה בין עובדה לסיפור",
      "מנגנוני מחשבה",
      "חקירה לפי נושא",
    ],
    sameAs,
  };
}

/** Compact author reference for VideoObject / Article. */
export function yakirCohenAuthorRef() {
  return {
    "@type": "Person" as const,
    "@id": PERSON_ID,
    name: "יקיר כהן",
    url: SITE_ORIGIN,
  };
}
