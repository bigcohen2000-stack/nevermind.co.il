import "server-only";

import { createHash } from "crypto";

import { getStudioUnlockSecret, STUDIO_COOKIE } from "@/lib/studio/token";

export { STUDIO_COOKIE } from "@/lib/studio/token";

/** Sync token for Node server actions (same digest as edge async). */
export function studioSessionToken(secret: string): string {
  return createHash("sha256")
    .update(`nevermind-studio:${secret}`)
    .digest("hex");
}

export async function isStudioAuthenticated(): Promise<boolean> {
  try {
    const { cookies } = await import("next/headers");
    const secret = getStudioUnlockSecret();
    if (!secret) return false;
    const jar = await cookies();
    const token = jar.get(STUDIO_COOKIE)?.value;
    if (!token) return false;
    const expected = studioSessionToken(secret);
    if (token.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i += 1) {
      diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}
