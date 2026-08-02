import "server-only";

import { z } from "zod";

/**
 * Server-only environment guards. Never import this module from Client Components.
 *
 * - getPublicSupabaseEnv(): browse/search pages (URL + anon)
 * - getServerEnv(): sync, studio, admin (service role + YouTube + cron)
 */

const publicSupabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message:
      "Missing NEXT_PUBLIC_SUPABASE_URL. Copy from Supabase → Project Settings → API → Project URL into .env.local",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message:
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy from Supabase → Project Settings → API → anon public",
  }),
});

const serverEnvSchema = publicSupabaseSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message:
      "Missing SUPABASE_SERVICE_ROLE_KEY. Copy from Supabase → Project Settings → API → service_role (secret)",
  }),
  YOUTUBE_API_KEY: z.string().min(1, {
    message:
      "Missing YOUTUBE_API_KEY. Create in Google Cloud → Credentials with YouTube Data API v3 enabled",
  }),
  CRON_SECRET: z.string().min(8, {
    message:
      "Missing CRON_SECRET. Set a long random string (e.g. openssl rand -hex 32)",
  }),
  GATED_PLAYLIST_IDS: z.string().optional().default(""),
  YOUTUBE_CHANNEL_IDS: z.string().optional().default(""),
  YOUTUBE_PLAYLIST_IDS: z.string().optional().default(""),
  YOUTUBE_UNLISTED_VIDEO_IDS: z.string().optional().default(""),
  YOUTUBE_GATED_VIDEO_IDS: z.string().optional().default(""),
});

export type PublicSupabaseEnv = z.infer<typeof publicSupabaseSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedPublic: PublicSupabaseEnv | null = null;
let cachedServer: ServerEnv | null = null;

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  if (cachedPublic) return cachedPublic;
  cachedPublic = publicSupabaseSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedPublic;
}

export function hasPublicSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getServerEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  cachedServer = serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    GATED_PLAYLIST_IDS: process.env.GATED_PLAYLIST_IDS ?? "",
    YOUTUBE_CHANNEL_IDS: process.env.YOUTUBE_CHANNEL_IDS ?? "",
    YOUTUBE_PLAYLIST_IDS: process.env.YOUTUBE_PLAYLIST_IDS ?? "",
    YOUTUBE_UNLISTED_VIDEO_IDS: process.env.YOUTUBE_UNLISTED_VIDEO_IDS ?? "",
    YOUTUBE_GATED_VIDEO_IDS: process.env.YOUTUBE_GATED_VIDEO_IDS ?? "",
  });
  cachedPublic = {
    NEXT_PUBLIC_SUPABASE_URL: cachedServer.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: cachedServer.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  return cachedServer;
}

/** Comma-separated env list → trimmed non-empty strings. */
export function splitCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
