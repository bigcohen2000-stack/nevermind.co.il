/**
 * Shared WhatsApp and SMS link builders for NeverMind booking and lead CTAs.
 * Phone comes from NEXT_PUBLIC_WHATSAPP_NUMBER (digits with country code).
 * SMS uses the same number for kosher-phone users without WhatsApp.
 */

export const DEFAULT_WHATSAPP_NUMBER = "972555634035";

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@nevermindname";

export function getWhatsAppNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_WHATSAPP_NUMBER;
}

/** E.164-ish with leading + for sms: / tel: links. */
export function getPhoneE164(): string {
  const digits = getWhatsAppNumber();
  return digits.startsWith("+") ? digits : `+${digits}`;
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

/**
 * SMS deep link for devices without WhatsApp (e.g. kosher phones).
 *
 * Cross-platform notes:
 * - Digits without "+" avoid broken Android handlers that choke on E.164 "+".
 * - "?&body=" is the common iOS + Android compromise for prefilled body text.
 * - Desktop browsers often have no SMS app: pair with a tel: fallback in UI.
 */
export function buildSmsHref(text: string): string {
  const digits = getWhatsAppNumber();
  const encoded = encodeURIComponent(text);
  return `sms:${digits}?&body=${encoded}`;
}

export function buildTelHref(): string {
  return `tel:${getPhoneE164()}`;
}
