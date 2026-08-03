/**
 * Shared display helpers for header auth labels (safe for client + server).
 */

export type HeaderSession = {
  authUserId: string | null;
  authEmail: string | null;
  clubPhone: string | null;
  /** Friendly short name for greetings (email local or club name). */
  displayName: string | null;
};

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] ?? "*"}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

export function formatHeaderAuthLabel(email: string | null): string | null {
  if (!email) return null;
  if (email.includes("@")) return maskEmail(email);
  return maskPhone(email);
}

export function formatHeaderClubLabel(phone: string | null): string | null {
  if (!phone) return null;
  return maskPhone(phone);
}
