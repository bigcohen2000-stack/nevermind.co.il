/**
 * Single-video access request (50 NIS base).
 * WhatsApp prefills include internal id so Yakir knows what to unlock after payment.
 */

import { buildWhatsAppHref, buildSmsHref } from "@/lib/whatsapp";

export const SINGLE_VIDEO_PRICE = '50 ש"ח';

export type SingleVideoRequestInput = {
  title: string;
  /** Internal UUID (safe to share). Prefer over youtube_id for gated. */
  videoId: string;
};

/**
 * Prefill that asks for a specific video + invites a short "why" for a possible discount.
 */
export function buildSingleVideoWhatsAppText(
  input: SingleVideoRequestInput,
): string {
  return [
    `היי יקיר, אני מבקש צפייה בסרטון ספציפי ב-${SINGLE_VIDEO_PRICE}.`,
    "",
    `כותרת: ${input.title}`,
    `מזהה פנימי: ${input.videoId}`,
    "",
    "למה זה מעניין אותי (אפרט בקצרה. פירוט אמיתי יכול להוריד מחיר):",
    "",
  ].join("\n");
}

export function buildSingleVideoWhatsAppHref(
  input: SingleVideoRequestInput,
): string {
  return buildWhatsAppHref(buildSingleVideoWhatsAppText(input));
}

export function buildSingleVideoSmsHref(
  input: SingleVideoRequestInput,
): string {
  return buildSmsHref(buildSingleVideoWhatsAppText(input));
}
