-- NeverMind — LIVE archive votes + requests
-- Registered users can like archive candidates and request a video for a future LIVE.
-- Watching unlisted archive remains club-gated in the app (/watch).

create extension if not exists "pgcrypto";

-- =============================================================================
-- live_video_likes: one like per signed-in user per video
-- =============================================================================

create table if not exists public.live_video_likes (
  user_id     uuid not null references auth.users (id) on delete cascade,
  video_id    uuid not null references public.videos (id) on delete cascade,
  created_at  timestamptz not null default now(),

  primary key (user_id, video_id)
);

create index if not exists live_video_likes_video_id_idx
  on public.live_video_likes (video_id);

create index if not exists live_video_likes_created_at_idx
  on public.live_video_likes (created_at desc);

alter table public.live_video_likes enable row level security;

drop policy if exists live_video_likes_select_authenticated on public.live_video_likes;
create policy live_video_likes_select_authenticated
  on public.live_video_likes
  for select
  to authenticated
  using (true);

drop policy if exists live_video_likes_insert_own on public.live_video_likes;
create policy live_video_likes_insert_own
  on public.live_video_likes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists live_video_likes_delete_own on public.live_video_likes;
create policy live_video_likes_delete_own
  on public.live_video_likes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Public-readable counts (anon + authenticated) without exposing user ids.
create or replace view public.live_video_like_counts
with (security_invoker = false)
as
select
  video_id,
  count(*)::int as like_count
from public.live_video_likes
group by video_id;

grant select on public.live_video_like_counts to anon, authenticated;

comment on table public.live_video_likes is
  'Votes for LIVE archive / next free registered LIVE candidates.';

comment on view public.live_video_like_counts is
  'Aggregate like counts for LIVE voting. Safe for public read.';

-- =============================================================================
-- live_video_requests: "put this video on a future LIVE"
-- =============================================================================

create table if not exists public.live_video_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  video_id     uuid references public.videos (id) on delete set null,
  video_title  text not null,
  note         text not null default '',
  created_at   timestamptz not null default now(),

  constraint live_video_requests_title_len
    check (char_length(video_title) between 2 and 200),
  constraint live_video_requests_note_len
    check (char_length(note) <= 500)
);

create index if not exists live_video_requests_user_id_created_at_idx
  on public.live_video_requests (user_id, created_at desc);

create index if not exists live_video_requests_created_at_idx
  on public.live_video_requests (created_at desc);

alter table public.live_video_requests enable row level security;

drop policy if exists live_video_requests_select_own on public.live_video_requests;
create policy live_video_requests_select_own
  on public.live_video_requests
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists live_video_requests_insert_own on public.live_video_requests;
create policy live_video_requests_insert_own
  on public.live_video_requests
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

comment on table public.live_video_requests is
  'Signed-in requests to feature a specific video on a future LIVE.';
