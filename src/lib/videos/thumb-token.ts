import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { GATED_LOCK_IMAGE } from "@/lib/videos/watch-path";

function getThumbSecret(): string | null {
  const dedicated = process.env.CLUB_GATE_SECRET?.trim();
  if (dedicated && dedicated.length >= 16) return dedicated;
  const cron = process.env.CRON_SECRET?.trim();
  if (cron && cron.length >= 8) return `nm-thumb:${cron}`;
  return null;
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

function signVideoId(videoUuid: string, secret: string): Buffer {
  return Buffer.from(
    createHmac("sha256", secret).update(`thumb:v1:${videoUuid}`).digest(),
  );
}

/**
 * Opaque same-origin thumb path. Does not include a YouTube id.
 * Falls back to the brand lock image when signing is unavailable.
 */
export function buildOpaqueThumbPath(videoUuid: string): string {
  const id = videoUuid.trim();
  if (!id) return GATED_LOCK_IMAGE;
  const secret = getThumbSecret();
  if (!secret) return GATED_LOCK_IMAGE;
  const sig = b64url(signVideoId(id, secret));
  const payload = b64url(`${id}.${sig}`);
  return `/api/thumbs/${payload}`;
}

/** Verify token and return the video UUID, or null. */
export function verifyOpaqueThumbToken(token: string): string | null {
  const secret = getThumbSecret();
  if (!secret) return null;
  try {
    const raw = fromB64url(token.trim()).toString("utf8");
    const dot = raw.lastIndexOf(".");
    if (dot <= 0) return null;
    const videoUuid = raw.slice(0, dot);
    const sigB64 = raw.slice(dot + 1);
    if (!videoUuid || !sigB64) return null;
    const expected = signVideoId(videoUuid, secret);
    const actual = fromB64url(sigB64);
    if (actual.length !== expected.length) return null;
    if (!timingSafeEqual(actual, expected)) return null;
    return videoUuid;
  } catch {
    return null;
  }
}
