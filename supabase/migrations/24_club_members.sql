-- Club members allowlist + watch events + login display_name
-- NeverMind Supabase only. Service role writes. No anon access.

-- =============================================================================
-- club_members: allowlist (phone must be normalized 972XXXXXXXXX in app)
-- =============================================================================

create table if not exists public.club_members (
  phone         text primary key,
  display_name  text not null default '',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_seen_at  timestamptz,

  constraint club_members_phone_not_blank check (length(trim(phone)) > 0)
);

create index if not exists club_members_last_seen_at_idx
  on public.club_members (last_seen_at desc nulls last);

create index if not exists club_members_updated_at_idx
  on public.club_members (updated_at desc);

-- =============================================================================
-- club_login_events: add display_name (keep historical rows)
-- =============================================================================

alter table public.club_login_events
  add column if not exists display_name text;

-- Optional FK: only for phones that exist in club_members.
-- Historical orphan phones stay as plain text; app upserts members on login.

-- =============================================================================
-- club_watch_events: gated watch identity log
-- =============================================================================

create table if not exists public.club_watch_events (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null references public.club_members (phone) on delete cascade,
  video_id    text not null,
  created_at  timestamptz not null default now(),

  constraint club_watch_events_video_id_not_blank check (length(trim(video_id)) > 0)
);

create index if not exists club_watch_events_created_at_idx
  on public.club_watch_events (created_at desc);

create index if not exists club_watch_events_phone_idx
  on public.club_watch_events (phone);

create index if not exists club_watch_events_phone_video_idx
  on public.club_watch_events (phone, video_id, created_at desc);

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.club_members enable row level security;
alter table public.club_watch_events enable row level security;

-- No anon/authenticated policies = service role only.
