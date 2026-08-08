-- Member gaps: completions, search history sync, topic prefs, tool quota,
-- club asset vault, method Q&A fields on viewer_feedback.

-- ---------------------------------------------------------------------------
-- A1: video completions (explicit "הושלם"; progress rows still clear at ≥92%)
-- ---------------------------------------------------------------------------
create table if not exists public.video_completions (
  user_id       uuid not null references auth.users (id) on delete cascade,
  youtube_id    text not null,
  completed_at  timestamptz not null default now(),

  primary key (user_id, youtube_id),

  constraint video_completions_youtube_id_not_blank
    check (length(trim(youtube_id)) > 0)
);

create index if not exists video_completions_user_completed_at_idx
  on public.video_completions (user_id, completed_at desc);

alter table public.video_completions enable row level security;

drop policy if exists video_completions_select_own on public.video_completions;
create policy video_completions_select_own
  on public.video_completions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists video_completions_insert_own on public.video_completions;
create policy video_completions_insert_own
  on public.video_completions
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists video_completions_delete_own on public.video_completions;
create policy video_completions_delete_own
  on public.video_completions
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- A2: per-user search history (sync across devices)
-- ---------------------------------------------------------------------------
create table if not exists public.user_search_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  query       text not null,
  created_at  timestamptz not null default now(),

  constraint user_search_history_query_not_blank
    check (length(trim(query)) > 0)
);

create index if not exists user_search_history_user_created_at_idx
  on public.user_search_history (user_id, created_at desc);

alter table public.user_search_history enable row level security;

drop policy if exists user_search_history_select_own on public.user_search_history;
create policy user_search_history_select_own
  on public.user_search_history
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_search_history_insert_own on public.user_search_history;
create policy user_search_history_insert_own
  on public.user_search_history
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_search_history_delete_own on public.user_search_history;
create policy user_search_history_delete_own
  on public.user_search_history
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- A3: topic preference alerts
-- ---------------------------------------------------------------------------
create table if not exists public.user_topic_prefs (
  user_id     uuid not null references auth.users (id) on delete cascade,
  concept_id  uuid not null references public.concepts (id) on delete cascade,
  created_at  timestamptz not null default now(),

  primary key (user_id, concept_id)
);

create index if not exists user_topic_prefs_concept_id_idx
  on public.user_topic_prefs (concept_id);

alter table public.user_topic_prefs enable row level security;

drop policy if exists user_topic_prefs_select_own on public.user_topic_prefs;
create policy user_topic_prefs_select_own
  on public.user_topic_prefs
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_topic_prefs_insert_own on public.user_topic_prefs;
create policy user_topic_prefs_insert_own
  on public.user_topic_prefs
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_topic_prefs_delete_own on public.user_topic_prefs;
create policy user_topic_prefs_delete_own
  on public.user_topic_prefs
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.topic_notification_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  video_id    uuid not null references public.videos (id) on delete cascade,
  concept_id  uuid references public.concepts (id) on delete set null,
  channel     text not null check (channel in ('email', 'push')),
  created_at  timestamptz not null default now(),

  constraint topic_notification_log_unique
    unique (user_id, video_id, channel)
);

create index if not exists topic_notification_log_created_at_idx
  on public.topic_notification_log (created_at desc);

alter table public.topic_notification_log enable row level security;
-- No client policies: service role only (cron / admin).

-- ---------------------------------------------------------------------------
-- A4: monthly tool usage quota (invert / deep search)
-- ---------------------------------------------------------------------------
create table if not exists public.tool_usage_events (
  id           uuid primary key default gen_random_uuid(),
  tool         text not null check (tool in ('invert')),
  user_id      uuid references auth.users (id) on delete set null,
  subject_key  text not null,
  created_at   timestamptz not null default now(),

  constraint tool_usage_events_subject_not_blank
    check (length(trim(subject_key)) > 0)
);

create index if not exists tool_usage_events_subject_created_at_idx
  on public.tool_usage_events (tool, subject_key, created_at desc);

alter table public.tool_usage_events enable row level security;
-- Inserts via service role from API. Authenticated users can read own count.
drop policy if exists tool_usage_events_select_own on public.tool_usage_events;
create policy tool_usage_events_select_own
  on public.tool_usage_events
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- B2: club asset vault metadata (files live in Storage bucket club-assets)
-- ---------------------------------------------------------------------------
create table if not exists public.club_assets (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  storage_path  text not null,
  file_name     text not null,
  content_type  text,
  byte_size     integer,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),

  constraint club_assets_title_not_blank check (length(trim(title)) > 0),
  constraint club_assets_path_not_blank check (length(trim(storage_path)) > 0),
  constraint club_assets_file_not_blank check (length(trim(file_name)) > 0)
);

create index if not exists club_assets_published_sort_idx
  on public.club_assets (is_published, sort_order, created_at desc);

alter table public.club_assets enable row level security;
-- Entitlement checked in app; no anon/authenticated select policies.

insert into storage.buckets (id, name, public, file_size_limit)
values ('club-assets', 'club-assets', false, 52428800)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- B3: method Q&A fields on viewer_feedback
-- Create base table if migration 29 was never applied on this project.
-- ---------------------------------------------------------------------------
create table if not exists public.viewer_feedback (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null,
  video_id      uuid references public.videos (id) on delete set null,
  video_title   text,
  body          text not null,
  author_name   text,
  contact_phone text,
  contact_email text,
  want_reply    boolean not null default false,
  status        text not null default 'open'
                  check (status in ('open', 'replied', 'closed')),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users (id) on delete set null,
  reply_body    text,
  replied_at    timestamptz,

  constraint viewer_feedback_body_not_blank check (length(trim(body)) > 0)
);

create index if not exists viewer_feedback_created_at_idx
  on public.viewer_feedback (created_at desc);

create index if not exists viewer_feedback_status_idx
  on public.viewer_feedback (status);

alter table public.viewer_feedback enable row level security;

drop policy if exists viewer_feedback_anon_insert on public.viewer_feedback;
create policy viewer_feedback_anon_insert
  on public.viewer_feedback
  for insert
  to anon, authenticated
  with check (true);

alter table public.viewer_feedback
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.viewer_feedback
  add column if not exists reply_body text;

alter table public.viewer_feedback
  add column if not exists replied_at timestamptz;

-- Replace any kind CHECK (named or auto-named) so method_question is allowed.
do $$
declare
  cname text;
begin
  for cname in
    select conname
    from pg_constraint
    where conrelid = 'public.viewer_feedback'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%kind%'
  loop
    execute format('alter table public.viewer_feedback drop constraint %I', cname);
  end loop;
end $$;

alter table public.viewer_feedback
  add constraint viewer_feedback_kind_check
  check (kind in ('heart_reply', 'dislike', 'reply_request', 'method_question'));

create index if not exists viewer_feedback_user_id_idx
  on public.viewer_feedback (user_id, created_at desc)
  where user_id is not null;

drop policy if exists viewer_feedback_select_own on public.viewer_feedback;
create policy viewer_feedback_select_own
  on public.viewer_feedback
  for select
  to authenticated
  using (user_id = (select auth.uid()));
