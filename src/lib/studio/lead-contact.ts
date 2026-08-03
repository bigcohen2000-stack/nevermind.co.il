/**
 * Studio lead helpers: phone links and WhatsApp to the visitor.
 */

export function normalizePhoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length >= 9) {
    digits = `972${digits.slice(1)}`;
  }
  return digits;
}

export function buildLeadTelHref(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  return digits ? `tel:+${digits}` : "tel:";
}

export function buildLeadWhatsAppHref(phone: string, text: string): string {
  const digits = normalizePhoneDigits(phone);
  const encoded = encodeURIComponent(text);
  return digits
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
