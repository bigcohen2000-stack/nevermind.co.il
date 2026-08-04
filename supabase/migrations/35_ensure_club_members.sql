-- Ensure club_members (+ related) exist.
-- Safe to re-run. Paste into Supabase SQL Editor and click Run.

create table if not exists public.club_members (
  phone         text primary key,
  display_name  text not null default '',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_seen_at  timestamptz,
  expires_at    timestamptz,

  constraint club_members_phone_not_blank check (length(trim(phone)) > 0)
);

alter table public.club_members
  add column if not exists expires_at timestamptz;

alter table public.club_members
  add column if not exists notes text;

alter table public.club_members
  add column if not exists last_seen_at timestamptz;

create index if not exists club_members_last_seen_at_idx
  on public.club_members (last_seen_at desc nulls last);

create index if not exists club_members_updated_at_idx
  on public.club_members (updated_at desc);

alter table public.club_members enable row level security;
-- No anon/authenticated policies = service role / Studio only.

-- Optional companion tables used by Studio club tools.
alter table public.club_login_events
  add column if not exists display_name text;

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

alter table public.club_watch_events enable row level security;

create table if not exists public.club_feed_tokens (
  id uuid primary key default gen_random_uuid(),
  phone text not null references public.club_members (phone) on delete cascade,
  token_hash text not null,
  label text not null default '',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  constraint club_feed_tokens_token_hash_key unique (token_hash),
  constraint club_feed_tokens_phone_not_blank check (length(trim(phone)) > 0),
  constraint club_feed_tokens_token_hash_not_blank check (length(trim(token_hash)) > 0)
);

create index if not exists club_feed_tokens_phone_idx
  on public.club_feed_tokens (phone);

alter table public.club_feed_tokens enable row level security;

notify pgrst, 'reload schema';
