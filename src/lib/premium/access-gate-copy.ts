/**
 * Factual access-gate copy and pricing frames (before VAT).
 * Zero drama: structure of the data, not subjective FOMO.
 * WhatsApp prefills share the same request shape as /paths.
 */

import {
  ARCHIVE_PRICING_ROWS,
  buildArchiveAccessWhatsAppText,
  buildTrackWhatsAppText,
  DEFAULT_ARCHIVE_PRICING_ID,
} from "@/lib/content/offers";

export const ACCESS_GATE_TITLE =
  "המידע המלא מוגדר כתוכן מורשה בלבד.";

export const ACCESS_GATE_DESCRIPTION =
  "התכנים הגלויים כרגע הם חלק חלקי ממאגר הידע. ניתוחי עומק בנושאי התמכרויות, מנגנוני תודעה, מערכות הפעלה של המוח, מיניות ומבנה המציאות, דורשים הרשאה פרטית ופתוחים למנויים בלבד. אין כאן סודות. יש כאן חקירה שמצריכה מחויבות.";

export const ACCESS_GATE_PATHS_NOTE =
  "פירוט המסלולים המלא נמצא בעמוד המסלולים.";

export const ACCESS_GATE_PRIMARY_WHATSAPP = buildTrackWhatsAppText({
  track: "הרשאת גישה למאגר הסרטונים",
  detail: "מסגרת המחיר תיקבע בשיחת התאמה. אין סליקה אוטומטית באתר.",
  requiresFitCall: true,
});

export const ACCESS_GATE_SECONDARY_WHATSAPP = buildTrackWhatsAppText({
  track: "פגישת ניתוח 1:1",
  requiresFitCall: true,
});

export const ACCESS_GATE_PRIMARY_CTA = "בקשת גישה למאגר";
export const ACCESS_GATE_SECONDARY_CTA = "בקשת פגישת ניתוח 1:1";
export const ACCESS_GATE_DISMISS_CTA = "המשך צפייה בתכנים הציבוריים";
export const ACCESS_GATE_DISMISS_NOTE =
  "סרטונים מורשים נשארים נעולים. אפשר להמשיך רק בתכנים הציבוריים.";

export type AccessFrameRow = {
  id: string;
  frame: string;
  validity: string;
  price: string;
  fitCheck: string;
  /** Exact WhatsApp / SMS prefill for this price frame. */
  whatsappText: string;
};

/** Full authorization frames inside the access gate (before VAT). */
export const ACCESS_FRAME_ROWS: AccessFrameRow[] = ARCHIVE_PRICING_ROWS.map(
  (row) => ({
    id: row.id,
    frame: row.frame,
    validity: row.validity,
    price: row.price,
    fitCheck: "שיחת התאמה נדרשת",
    whatsappText: buildArchiveAccessWhatsAppText(row.frame, row.price),
  }),
);

export const DEFAULT_ACCESS_FRAME_ID = DEFAULT_ARCHIVE_PRICING_ID;

export function getAccessFrameById(id: string): AccessFrameRow | undefined {
  return ACCESS_FRAME_ROWS.find((row) => row.id === id);
}

/** Days after dismiss before the free access gate may show again. */
export const ACCESS_GATE_DISMISS_DAYS = 14;
