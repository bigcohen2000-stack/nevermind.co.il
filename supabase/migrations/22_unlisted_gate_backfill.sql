-- NeverMind — idempotent safety net: unlisted rows are always club (gated).
-- Sync already sets both flags from YouTube privacyStatus "unlisted".
-- Trigger videos_unlisted_forces_gated (migration 16) covers new writes.
-- This backfill catches any legacy rows that slipped through.

update public.videos
set is_gated = true
where coalesce(is_unlisted, false) = true
  and coalesce(is_gated, false) = false;

comment on column public.videos.is_unlisted is
  'YouTube privacy unlisted (לא רשום). Always implies is_gated via trigger + sync.';

comment on column public.videos.is_gated is
  'Club / members-only lock. Set for unlisted videos, GATED_PLAYLIST_IDS, or explicit gated IDs.';
