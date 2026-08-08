-- NeverMind go-live: remaining migrations after 01_init.sql
-- Paste once in Supabase SQL Editor.
-- Idempotent. Does NOT touch YouTube sync.



-- ===== 02_ingestion_guards.sql =====
-- NeverMind — ingestion guards (idempotent)
-- Ensures videos + video_transcripts (and search index) exist for transcript sync.
-- Does NOT add concepts text[] or transcript columns onto videos.
-- Normalized model: concepts via video_concepts, transcript via video_transcripts.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists public.videos (
  id              uuid primary key default gen_random_uuid(),
  youtube_id      text not null,
  title           text not null,
  description     text,
  thumbnail_url   text,
  is_unlisted     boolean not null default false,
  is_gated        boolean not null default false,
  playlist_id     text,
  created_at      timestamptz not null default now(),

  constraint videos_youtube_id_key unique (youtube_id),
  constraint videos_youtube_id_not_blank check (length(trim(youtube_id)) > 0),
  constraint videos_title_not_blank check (length(trim(title)) > 0)
);

create index if not exists videos_created_at_idx
  on public.videos (created_at desc);

create index if not exists videos_title_trgm
  on public.videos using gin (title gin_trgm_ops);

create table if not exists public.video_transcripts (
  video_id      uuid primary key
    references public.videos (id) on delete cascade,
  content       text not null default '',
  search_vector tsvector
);

create or replace function public.video_transcripts_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('simple', coalesce(new.content, ''));
  return new;
end;
$$;

drop trigger if exists video_transcripts_search_vector_trigger
  on public.video_transcripts;

create trigger video_transcripts_search_vector_trigger
before insert or update of content on public.video_transcripts
for each row
execute function public.video_transcripts_search_vector_update();

create index if not exists video_transcripts_search_vector_gin
  on public.video_transcripts using gin (search_vector);

update public.video_transcripts
set search_vector = to_tsvector('simple', coalesce(content, ''))
where search_vector is null and content is not null;


-- ===== 02_random_video.sql =====
-- Random Investigation helper: one public-visible video via ORDER BY random().
-- RLS on videos still applies (anon sees non-gated only).

create or replace function public.get_random_video()
returns setof public.videos
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.videos
  order by random()
  limit 1;
$$;

grant execute on function public.get_random_video() to anon, authenticated;


-- ===== 03_search_analytics.sql =====
-- NeverMind — search analytics
-- Target: NEW isolated Supabase project only.
-- Logs search queries for product insight (authenticated + anonymous sessions).

create extension if not exists "pgcrypto";

create table if not exists public.search_analytics (
  id             uuid primary key default gen_random_uuid(),
  search_query   text not null,
  user_id        uuid references auth.users (id) on delete set null,
  session_id     text,
  created_at     timestamptz not null default now(),
  results_count  integer not null default 0,

  constraint search_analytics_query_not_blank
    check (length(trim(search_query)) > 0),
  constraint search_analytics_results_count_nonneg
    check (results_count >= 0)
);

create index if not exists search_analytics_created_at_idx
  on public.search_analytics (created_at desc);

create index if not exists search_analytics_search_query_idx
  on public.search_analytics (search_query);

create index if not exists search_analytics_user_id_idx
  on public.search_analytics (user_id)
  where user_id is not null;

create index if not exists search_analytics_session_id_idx
  on public.search_analytics (session_id)
  where session_id is not null;

-- RLS: clients may insert their own events; reads stay service-role only.
alter table public.search_analytics enable row level security;

drop policy if exists search_analytics_insert_own on public.search_analytics;
create policy search_analytics_insert_own
  on public.search_analytics
  for insert
  to anon, authenticated
  with check (
    user_id is null
    or user_id = (select auth.uid())
  );

-- No SELECT/UPDATE/DELETE for anon/authenticated — service role bypasses RLS.


-- ===== 04_saved_videos.sql =====
-- NeverMind — saved videos ("My List" / Save for Later)
-- Maps authenticated users to YouTube video ids.

create extension if not exists "pgcrypto";

create table if not exists public.saved_videos (
  user_id     uuid not null references auth.users (id) on delete cascade,
  youtube_id  text not null,
  created_at  timestamptz not null default now(),

  primary key (user_id, youtube_id),

  constraint saved_videos_youtube_id_not_blank
    check (length(trim(youtube_id)) > 0)
);

create index if not exists saved_videos_user_id_created_at_idx
  on public.saved_videos (user_id, created_at desc);

create index if not exists saved_videos_youtube_id_idx
  on public.saved_videos (youtube_id);

alter table public.saved_videos enable row level security;

drop policy if exists saved_videos_select_own on public.saved_videos;
create policy saved_videos_select_own
  on public.saved_videos
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists saved_videos_insert_own on public.saved_videos;
create policy saved_videos_insert_own
  on public.saved_videos
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists saved_videos_delete_own on public.saved_videos;
create policy saved_videos_delete_own
  on public.saved_videos
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- No anon access. Service role bypasses RLS for admin tools if needed.


-- ===== 05_video_progress.sql =====
-- NeverMind — video playback progress (Continue Watching)
-- Logged-in users only. Anonymous progress stays in localStorage on the client.

create extension if not exists "pgcrypto";

create table if not exists public.video_progress (
  user_id           uuid not null references auth.users (id) on delete cascade,
  youtube_id        text not null,
  progress_seconds  integer not null default 0,
  duration_seconds  integer,
  updated_at        timestamptz not null default now(),

  primary key (user_id, youtube_id),

  constraint video_progress_youtube_id_not_blank
    check (length(trim(youtube_id)) > 0),
  constraint video_progress_seconds_nonneg
    check (progress_seconds >= 0),
  constraint video_progress_duration_positive
    check (duration_seconds is null or duration_seconds > 0)
);

create index if not exists video_progress_user_updated_at_idx
  on public.video_progress (user_id, updated_at desc);

alter table public.video_progress enable row level security;

drop policy if exists video_progress_select_own on public.video_progress;
create policy video_progress_select_own
  on public.video_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists video_progress_insert_own on public.video_progress;
create policy video_progress_insert_own
  on public.video_progress
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists video_progress_update_own on public.video_progress;
create policy video_progress_update_own
  on public.video_progress
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists video_progress_delete_own on public.video_progress;
create policy video_progress_delete_own
  on public.video_progress
  for delete
  to authenticated
  using (user_id = (select auth.uid()));


-- ===== 06_watch_history.sql =====
-- NeverMind — watch history (profile "recently watched")
-- One row per user + youtube_id. Re-watching updates watched_at.

create extension if not exists "pgcrypto";

create table if not exists public.watch_history (
  user_id     uuid not null references auth.users (id) on delete cascade,
  youtube_id  text not null,
  watched_at  timestamptz not null default now(),

  primary key (user_id, youtube_id),

  constraint watch_history_youtube_id_not_blank
    check (length(trim(youtube_id)) > 0)
);

create index if not exists watch_history_user_watched_at_idx
  on public.watch_history (user_id, watched_at desc);

alter table public.watch_history enable row level security;

drop policy if exists watch_history_select_own on public.watch_history;
create policy watch_history_select_own
  on public.watch_history
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists watch_history_insert_own on public.watch_history;
create policy watch_history_insert_own
  on public.watch_history
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists watch_history_update_own on public.watch_history;
create policy watch_history_update_own
  on public.watch_history
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists watch_history_delete_own on public.watch_history;
create policy watch_history_delete_own
  on public.watch_history
  for delete
  to authenticated
  using (user_id = (select auth.uid()));


-- ===== 07_search_feedback.sql =====
-- NeverMind — search quality feedback columns
-- Target: NEW isolated Supabase project only.

alter table public.search_analytics
  add column if not exists user_feedback boolean,
  add column if not exists feedback_note text;

comment on column public.search_analytics.user_feedback is
  'true = thumbs up, false = thumbs down, null = no feedback yet';

comment on column public.search_analytics.feedback_note is
  'Optional free-text when user_feedback is false (thumbs down)';

-- Still no client UPDATE via RLS: feedback writes go through a Server Action
-- using the service role after session/user ownership checks.


-- ===== 08_pre_meeting_leads.sql =====
-- NeverMind — pre-meeting logic filter leads
-- Stores structured fact/story intake before a booking call.
-- Writes via service role from the server action. No public read.

create extension if not exists "pgcrypto";

create table if not exists public.pre_meeting_leads (
  id                   uuid primary key default gen_random_uuid(),
  situation_text       text not null,
  objective_facts      text not null,
  subjective_story     text not null,
  name                 text not null,
  phone                text not null,
  source               text not null default 'booking-logic-filter',
  created_at           timestamptz not null default now(),

  constraint pre_meeting_leads_situation_not_blank
    check (length(trim(situation_text)) > 0),
  constraint pre_meeting_leads_facts_not_blank
    check (length(trim(objective_facts)) > 0),
  constraint pre_meeting_leads_story_not_blank
    check (length(trim(subjective_story)) > 0),
  constraint pre_meeting_leads_name_not_blank
    check (length(trim(name)) > 0),
  constraint pre_meeting_leads_phone_not_blank
    check (length(trim(phone)) > 0)
);

create index if not exists pre_meeting_leads_created_at_idx
  on public.pre_meeting_leads (created_at desc);

alter table public.pre_meeting_leads enable row level security;

-- No anon/authenticated policies: inserts go through service role only.


-- ===== 09_push_subscribers.sql =====
-- Web Push subscribers for Daily Resets (PWA).
-- Run after 01_init.sql on the isolated NeverMind Supabase project.

create table if not exists public.subscribers (
  endpoint    text primary key,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),

  constraint subscribers_endpoint_not_blank check (length(trim(endpoint)) > 0),
  constraint subscribers_p256dh_not_blank check (length(trim(p256dh)) > 0),
  constraint subscribers_auth_not_blank check (length(trim(auth)) > 0)
);

create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);

alter table public.subscribers enable row level security;

-- Clients may subscribe (upsert-friendly insert) without reading the full list.
drop policy if exists subscribers_insert_public on public.subscribers;
create policy subscribers_insert_public
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

-- Clients may update their own row when keys rotate (matched by endpoint PK via upsert).
drop policy if exists subscribers_update_public on public.subscribers;
create policy subscribers_update_public
  on public.subscribers
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Clients may unsubscribe by endpoint.
drop policy if exists subscribers_delete_public on public.subscribers;
create policy subscribers_delete_public
  on public.subscribers
  for delete
  to anon, authenticated
  using (true);

-- No SELECT for anon/authenticated. Cron uses service_role (bypasses RLS).


-- ===== 10_core_facts.sql =====
-- Objective Truth: logical core facts extracted once at ingest.
-- text[] of 3–5 short sentences, no emotion / story.

alter table public.videos
  add column if not exists core_facts text[] not null default '{}';

comment on column public.videos.core_facts is
  'Absolute logical facts from transcript (OpenAI, once at import). Empty until extracted.';


-- ===== 11_transcript_segments.sql =====
-- Timed caption chunks for Transcript Heatmap (offset/duration in ms).

alter table public.video_transcripts
  add column if not exists segments jsonb not null default '[]'::jsonb;

comment on column public.video_transcripts.segments is
  'Caption chunks: [{ "offsetMs", "durationMs", "text" }, ...] for density heatmap.';


-- ===== 12_profiles_premium.sql =====
-- NeverMind — user profiles with premium entitlement
-- is_premium is a manual/admin flag for now (no payment provider in Stage 1).
-- Anonymous visitors are treated as non-premium in the app layer.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_is_premium_idx
  on public.profiles (is_premium)
  where is_premium = true;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Optional: allow a signed-in user to upsert their own stub row (is_premium stays false).
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and is_premium = false
  );

-- No public update of is_premium (service role / SQL editor only).


-- ===== 13_pre_meeting_leads_email.sql =====
-- NeverMind — optional email on pre-meeting leads
-- Aligns Thought Deconstructor intake with booking modal (name / phone / email).

alter table public.pre_meeting_leads
  add column if not exists email text;

comment on column public.pre_meeting_leads.email is
  'Optional contact email from Thought Deconstructor / booking intake';

-- ===== 14_has_video_access.sql =====
alter table public.profiles
  add column if not exists has_video_access boolean not null default false;

comment on column public.profiles.has_video_access is
  'Manual grant for gated video library. Default false. Service role / SQL editor only.';

update public.profiles
set has_video_access = true, updated_at = now()
where is_premium = true
  and has_video_access = false;

create index if not exists profiles_has_video_access_idx
  on public.profiles (has_video_access)
  where has_video_access = true;

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and is_premium = false
    and has_video_access = false
  );

-- ===== 15_auth_login_events.sql =====
create extension if not exists "pgcrypto";

create table if not exists public.auth_login_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  email       text,
  event_type  text not null default 'login',
  user_agent  text,
  created_at  timestamptz not null default now(),

  constraint auth_login_events_type_not_blank
    check (length(trim(event_type)) > 0)
);

create index if not exists auth_login_events_created_at_idx
  on public.auth_login_events (created_at desc);

create index if not exists auth_login_events_user_id_idx
  on public.auth_login_events (user_id, created_at desc);

alter table public.auth_login_events enable row level security;

-- ===== 16_unlisted_auto_gate.sql =====
update public.videos
set is_gated = true
where is_unlisted = true
  and is_gated = false;

create or replace function public.videos_unlisted_forces_gated()
returns trigger
language plpgsql
as $$
begin
  if new.is_unlisted = true then
    new.is_gated := true;
  end if;
  return new;
end;
$$;

drop trigger if exists videos_unlisted_forces_gated_trg on public.videos;
create trigger videos_unlisted_forces_gated_trg
  before insert or update of is_unlisted, is_gated
  on public.videos
  for each row
  execute function public.videos_unlisted_forces_gated();


-- ===== 17_club_access.sql =====
-- NeverMind club access (magic links + optional shared password backup)
-- Run on NeverMind Supabase ONLY. Service role writes. No anon access.

create extension if not exists "pgcrypto";

-- =============================================================================
-- club_tokens: personal magic-link tokens (WhatsApp)
-- Store token_hash only. Raw token appears only in the URL once.
-- =============================================================================

create table if not exists public.club_tokens (
  id           uuid primary key default gen_random_uuid(),
  token_hash   text not null,
  phone        text not null,
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,

  constraint club_tokens_token_hash_key unique (token_hash),
  constraint club_tokens_phone_not_blank check (length(trim(phone)) > 0),
  constraint club_tokens_token_hash_not_blank check (length(trim(token_hash)) > 0)
);

create index if not exists club_tokens_phone_idx
  on public.club_tokens (phone);

create index if not exists club_tokens_expires_at_idx
  on public.club_tokens (expires_at desc);

-- =============================================================================
-- club_login_events: who entered and when
-- =============================================================================

create table if not exists public.club_login_events (
  id         uuid primary key default gen_random_uuid(),
  phone      text not null,
  token_id   uuid references public.club_tokens (id) on delete set null,
  source     text not null default 'magic',
  user_agent text,
  created_at timestamptz not null default now(),

  constraint club_login_events_phone_not_blank check (length(trim(phone)) > 0),
  constraint club_login_events_source_check
    check (source in ('magic', 'password'))
);

create index if not exists club_login_events_created_at_idx
  on public.club_login_events (created_at desc);

create index if not exists club_login_events_phone_idx
  on public.club_login_events (phone);

-- =============================================================================
-- club_config: single-row shared password backup (no Vercel redeploy)
-- =============================================================================

create table if not exists public.club_config (
  id            int primary key default 1 check (id = 1),
  password_hash text not null default '',
  version       int not null default 1,
  updated_at    timestamptz not null default now(),

  constraint club_config_version_positive check (version >= 1)
);

insert into public.club_config (id, password_hash, version)
values (1, '', 1)
on conflict (id) do nothing;

-- =============================================================================
-- RLS: deny all for anon/authenticated. Service role bypasses.
-- =============================================================================

alter table public.club_tokens enable row level security;
alter table public.club_login_events enable row level security;
alter table public.club_config enable row level security;

-- No policies for anon/authenticated = no access via PostgREST with anon key.

-- ===== 38_newsletter_subscribers.sql =====
-- Email newsletter list (manual send via Resend / Studio later).
-- Service role writes from the Server Action. No public SELECT.

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text not null default 'site',
  created_at timestamptz not null default now(),

  constraint newsletter_subscribers_email_not_blank
    check (length(trim(email)) > 0),
  constraint newsletter_subscribers_email_unique
    unique (email)
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- ===== 41_newsletter_unsubscribe.sql =====
alter table public.newsletter_subscribers
  add column if not exists status text not null default 'active'
    check (status in ('active', 'unsubscribed')),
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz;

create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);

-- ===== 40_club_ops_stage.sql =====
alter table public.club_members
  add column if not exists ops_link_minted_at timestamptz,
  add column if not exists ops_whatsapp_sent_at timestamptz;

-- ===== 43_club_renewal_request.sql =====
alter table public.club_members
  add column if not exists renewal_requested_at timestamptz;

create index if not exists club_members_renewal_requested_at_idx
  on public.club_members (renewal_requested_at)
  where renewal_requested_at is not null;

-- ===== 22_unlisted_gate_backfill.sql =====
update public.videos
set is_gated = true
where coalesce(is_unlisted, false) = true
  and coalesce(is_gated, false) = false;

