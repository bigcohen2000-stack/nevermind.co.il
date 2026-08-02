-- NeverMind — weekly unlisted live ("שידור חי מהאין")
-- Single-row config. URL is never readable via anon/authenticated PostgREST.
-- Free account + profiles.age_confirmed_at required in the app before URL reveal.

create extension if not exists "pgcrypto";

-- =============================================================================
-- live_stream_config: Studio-controlled go-live (row id = 1)
-- =============================================================================

create table if not exists public.live_stream_config (
  id          int primary key default 1 check (id = 1),
  is_live     boolean not null default false,
  youtube_url text not null default '',
  topic       text not null default '',
  started_at  timestamptz,
  updated_at  timestamptz not null default now(),

  constraint live_stream_config_youtube_url_len
    check (char_length(youtube_url) <= 500),
  constraint live_stream_config_topic_len
    check (char_length(topic) <= 300)
);

insert into public.live_stream_config (id, is_live, youtube_url, topic)
values (1, false, '', '')
on conflict (id) do nothing;

alter table public.live_stream_config enable row level security;

-- No policies for anon/authenticated = no PostgREST access. Service role only.

comment on table public.live_stream_config is
  'Weekly unlisted YouTube Live. Studio writes. App reveals URL only after auth + 18+.';

-- =============================================================================
-- profiles.age_confirmed_at: 18+ consent for live reveal
-- Written by Server Action via service role after verifying auth.uid().
-- =============================================================================

alter table public.profiles
  add column if not exists age_confirmed_at timestamptz;

comment on column public.profiles.age_confirmed_at is
  'Set when the signed-in user confirms they are 18+. Required to reveal live URL.';

-- Keep insert policy tight: new rows start without age confirmation.
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and is_premium = false
    and has_video_access = false
    and age_confirmed_at is null
  );
