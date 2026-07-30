import "server-only";

import { z } from "zod";

/**
 * Server-only environment guard. Never import this module from Client Components.
 * Missing keys fail fast with a clear Zod error in the terminal.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  YOUTUBE_API_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  GATED_PLAYLIST_IDS: z.string().optional().default(""),
  YOUTUBE_CHANNEL_IDS: z.string().optional().default(""),
  YOUTUBE_PLAYLIST_IDS: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  cached = serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    GATED_PLAYLIST_IDS: process.env.GATED_PLAYLIST_IDS ?? "",
    YOUTUBE_CHANNEL_IDS: process.env.YOUTUBE_CHANNEL_IDS ?? "",
    YOUTUBE_PLAYLIST_IDS: process.env.YOUTUBE_PLAYLIST_IDS ?? "",
  });
  return cached;
}

/** Comma-separated env list → trimmed non-empty strings. */
export function splitCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
