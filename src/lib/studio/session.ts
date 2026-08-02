import { createHash } from "crypto";
import { cookies } from "next/headers";

import { getServerEnv } from "@/env";

export const STUDIO_COOKIE = "nm_studio";

export function studioSessionToken(secret: string): string {
  return createHash("sha256")
    .update(`nevermind-studio:${secret}`)
    .digest("hex");
}

export async function isStudioAuthenticated(): Promise<boolean> {
  try {
    const env = getServerEnv();
    const jar = await cookies();
    const token = jar.get(STUDIO_COOKIE)?.value;
    if (!token) return false;
    return token === studioSessionToken(env.CRON_SECRET);
  } catch {
    return false;
  }
}
