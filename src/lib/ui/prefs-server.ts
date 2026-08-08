import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_UI_PREFS,
  UI_PREFS_COOKIE,
  parseUiPrefsCookie,
  type UiPrefs,
} from "@/lib/ui/prefs";

export async function readUiPrefs(): Promise<UiPrefs> {
  try {
    const jar = await cookies();
    return parseUiPrefsCookie(jar.get(UI_PREFS_COOKIE)?.value);
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}
