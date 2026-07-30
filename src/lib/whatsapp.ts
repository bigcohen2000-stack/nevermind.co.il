/**
 * Shared WhatsApp link builder for NeverMind booking and lead CTAs.
 * Phone comes from NEXT_PUBLIC_WHATSAPP_NUMBER (digits with country code).
 */

export const DEFAULT_WHATSAPP_NUMBER = "972555634035";

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@NeverMind-il";

export function getWhatsAppNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppHref(text: string): string {
  const phone = getWhatsAppNumber();
  const encoded = encodeURIComponent(text);
  return phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

export function buildWhatsAppHrefPlain(): string {
  const phone = getWhatsAppNumber();
  return phone ? `https://wa.me/${phone}` : "https://wa.me/";
}
