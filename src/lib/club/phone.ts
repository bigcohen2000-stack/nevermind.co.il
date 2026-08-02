/**
 * Canonical Israeli mobile phone form: 972XXXXXXXXX (digits only).
 * Shared by club allowlist, login, tokens, and events.
 */

export function normalizeClubPhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("9720") && digits.length >= 12) {
    digits = `972${digits.slice(4)}`;
  } else if (digits.startsWith("0") && digits.length >= 9) {
    digits = `972${digits.slice(1)}`;
  } else if (digits.startsWith("972")) {
    // already international
  } else if (digits.length === 9 && digits.startsWith("5")) {
    digits = `972${digits}`;
  } else if (digits.length >= 10 && digits.length <= 12 && !digits.startsWith("972")) {
    // leave as-is only if already looks international without 972
  }

  // IL mobile: 972 + 9 digits (5xxxxxxxx)
  if (digits.startsWith("972") && digits.length === 12) {
    return digits;
  }

  // Accept 972 + landline-ish 8-9 more digits sparingly (10-13 total after 972)
  if (digits.startsWith("972") && digits.length >= 11 && digits.length <= 13) {
    return digits;
  }

  return null;
}

/** Display mask for end users: ***XXXX (last 4). */
export function maskClubPhone(phone: string | null | undefined): string {
  if (!phone) return "***";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}
