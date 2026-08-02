"use server";

import { cookies, headers } from "next/headers";

import {
  assertStudioUnlockRateLimit,
  clearStudioUnlockFailures,
  recordStudioUnlockFailure,
} from "@/lib/studio/rate-limit";
import {
  STUDIO_COOKIE,
  studioSessionToken,
} from "@/lib/studio/session";
import { getStudioUnlockSecret } from "@/lib/studio/token";

export type StudioAuthResult = { ok: true } | { ok: false; error: string };

async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
    return h.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

export async function unlockStudio(secret: string): Promise<StudioAuthResult> {
  const ip = await clientIp();
  const rate = assertStudioUnlockRateLimit(ip);
  if (!rate.ok) return rate;

  try {
    const expected = getStudioUnlockSecret();
    const trimmed = secret?.trim() ?? "";
    if (!expected || expected.length < 8) {
      return { ok: false, error: "Studio is not configured." };
    }
    if (!trimmed || trimmed !== expected) {
      recordStudioUnlockFailure(ip);
      return { ok: false, error: "סוד לא תקין." };
    }

    clearStudioUnlockFailures(ip);

    const jar = await cookies();
    jar.set(STUDIO_COOKIE, studioSessionToken(expected), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function lockStudio(): Promise<void> {
  const jar = await cookies();
  jar.delete(STUDIO_COOKIE);
}
