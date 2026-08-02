import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "nm_club";
/** Club session lifetime after successful login (30 days). */
const MAX_AGE_SEC = 30 * 24 * 60 * 60;

export type ClubSessionPayload = {
  phone: string;
  /** Display name captured at club login (optional for old cookies). */
  name?: string | null;
  tokenId: string | null;
  v: number;
  exp: number;
};

function getClubSecret(): string {
  const dedicated = process.env.CLUB_GATE_SECRET?.trim();
  if (dedicated && dedicated.length >= 16) return dedicated;
  // NeverMind-only fallback so local/dev works before secret is set.
  const cron = process.env.CRON_SECRET?.trim();
  if (cron && cron.length >= 8) return `nm-club:${cron}`;
  throw new Error("Missing CLUB_GATE_SECRET (or CRON_SECRET fallback)");
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

export function hashClubToken(rawToken: string): string {
  return createHmac("sha256", getClubSecret())
    .update(`token:${rawToken}`)
    .digest("hex");
}

/** Long-lived private podcast feed secret (separate namespace from magic links). */
export function hashClubFeedToken(rawToken: string): string {
  return createHmac("sha256", getClubSecret())
    .update(`feed:${rawToken}`)
    .digest("hex");
}

export function generateRawClubToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashClubPassword(password: string, salt?: Buffer): {
  hash: string;
  salt: string;
} {
  const s = salt ?? randomBytes(16);
  const derived = scryptSync(password, s, 32);
  return {
    salt: b64url(s),
    hash: b64url(derived),
  };
}

export function verifyClubPassword(
  password: string,
  stored: string,
): boolean {
  // Format: scrypt$salt$hash
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = fromB64url(parts[1]!);
  const expected = fromB64url(parts[2]!);
  const { hash } = hashClubPassword(password, salt);
  const actual = fromB64url(hash);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function formatPasswordHash(password: string): string {
  const { salt, hash } = hashClubPassword(password);
  return `scrypt$${salt}$${hash}`;
}

function signPayload(payload: ClubSessionPayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", getClubSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function parseSigned(value: string): ClubSessionPayload | null {
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", getClubSecret())
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const json = JSON.parse(fromB64url(body).toString("utf8")) as ClubSessionPayload;
    if (!json.phone || typeof json.exp !== "number") return null;
    if (json.exp * 1000 < Date.now()) return null;
    return json;
  } catch {
    return null;
  }
}

export async function setClubSessionCookie(
  payload: Omit<ClubSessionPayload, "exp"> & { exp?: number },
): Promise<void> {
  const exp = payload.exp ?? Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const full: ClubSessionPayload = {
    phone: payload.phone,
    name: payload.name ?? null,
    tokenId: payload.tokenId,
    v: payload.v,
    exp,
  };
  const jar = await cookies();
  jar.set(COOKIE_NAME, signPayload(full), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearClubSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function readClubSession(): Promise<ClubSessionPayload | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    return parseSigned(raw);
  } catch {
    return null;
  }
}

export { COOKIE_NAME as CLUB_COOKIE_NAME, MAX_AGE_SEC as CLUB_SESSION_MAX_AGE };
