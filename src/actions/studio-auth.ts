"use server";

import { cookies } from "next/headers";

import { getServerEnv } from "@/env";
import {
  STUDIO_COOKIE,
  studioSessionToken,
} from "@/lib/studio/session";

export type StudioAuthResult = { ok: true } | { ok: false; error: string };

export async function unlockStudio(secret: string): Promise<StudioAuthResult> {
  try {
    const env = getServerEnv();
    const trimmed = secret?.trim() ?? "";
    if (!trimmed || trimmed !== env.CRON_SECRET) {
      return { ok: false, error: "Invalid admin secret" };
    }

    const jar = await cookies();
    jar.set(STUDIO_COOKIE, studioSessionToken(env.CRON_SECRET), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
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
