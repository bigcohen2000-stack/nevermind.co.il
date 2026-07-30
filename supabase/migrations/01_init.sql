-- NeverMind / nevermind.co.il — video search schema
-- Target: NEW isolated Supabase (PostgreSQL) project only.
-- Run in SQL Editor (or via supabase db push).

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm"; -- Hebrew / prefix autocomplete on concept names

-- =============================================================================
-- 1. videos
-- =============================================================================

create table if not exists public.videos (
  id              uuid primary key default gen_random_uuid(),
  youtube_id      text not null,
  title           text not null,
  description     text,
  thumbnail_url   text,
  is_unlisted     boolean not null default false,
  -- App extension: members-only content (RLS). Safe to keep even if unused.
  is_gated        boolean not null default false,
  playlist_id     text,
  created_at      timestamptz not null default now(),

  constraint videos_youtube_id_key unique (youtube_id),
  constraint videos_youtube_id_not_blank check (length(trim(youtube_id)) > 0),
  constraint videos_title_not_blank check (length(trim(title)) > 0)
);

create index if not exists videos_created_at_idx
  on public.videos (created_at desc);

create index if not exists videos_playlist_id_idx
  on public.videos (playlist_id)
  where playlist_id is not null;

create index if not exists videos_is_gated_idx
  on public.videos (is_gated);

create index if not exists videos_title_trgm
  on public.videos using gin (title gin_trgm_ops);

-- =============================================================================
-- 2. concepts  (e.g. "חרדה", "מציאות", "הזדהות")
-- =============================================================================

create table if not exists public.concepts (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  category text,

  constraint concepts_name_key unique (name),
  constraint concepts_name_not_blank check (length(trim(name)) > 0)
);

-- GIN for fast Hebrew autocomplete / ILIKE '%…%'
create index if not exists concepts_name_trgm
  on public.concepts using gin (name gin_trgm_ops);

-- Also useful for full-text style queries on concept names
create index if not exists concepts_name_fts_gin
  on public.concepts using gin (to_tsvector('simple', name));

-- =============================================================================
-- 3. video_concepts  (many-to-many + optional timestamp in seconds)
-- =============================================================================

create table if not exists public.video_concepts (
  video_id         uuid not null
    references public.videos (id) on delete cascade,
  concept_id       uuid not null
    references public.concepts (id) on delete cascade,
  start_timestamp  integer,

  primary key (video_id, concept_id),

  constraint video_concepts_start_timestamp_nonneg
    check (start_timestamp is null or start_timestamp >= 0)
);

create index if not exists video_concepts_concept_id_idx
  on public.video_concepts (concept_id);

create index if not exists video_concepts_video_id_idx
  on public.video_concepts (video_id);

-- =============================================================================
-- 4. video_transcripts  (+ tsvector for full-text search)
-- =============================================================================

create table if not exists public.video_transcripts (
  video_id      uuid primary key
    references public.videos (id) on delete cascade,
  content       text not null default '',
  search_vector tsvector
);

-- Keep search_vector in sync with content ('simple' = stable for Hebrew)
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

-- Backfill if rows already exist without vectors
update public.video_transcripts
set search_vector = to_tsvector('simple', coalesce(content, ''))
where search_vector is null and content is not null;

-- GIN on search_vector for full-text search
create index if not exists video_transcripts_search_vector_gin
  on public.video_transcripts using gin (search_vector);

-- =============================================================================
-- Row Level Security (anon: non-gated only; authenticated: all; writes: service role)
-- =============================================================================

alter table public.videos enable row level security;
alter table public.concepts enable row level security;
alter table public.video_concepts enable row level security;
alter table public.video_transcripts enable row level security;

drop policy if exists videos_select_public on public.videos;
create policy videos_select_public
  on public.videos
  for select
  to anon, authenticated
  using (
    is_gated = false
    or (select auth.role()) = 'authenticated'
  );

drop policy if exists concepts_select_all on public.concepts;
create policy concepts_select_all
  on public.concepts
  for select
  to anon, authenticated
  using (true);

drop policy if exists video_concepts_select_visible on public.video_concepts;
create policy video_concepts_select_visible
  on public.video_concepts
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.videos v
      where v.id = video_id
        and (
          v.is_gated = false
          or (select auth.role()) = 'authenticated'
        )
    )
  );

drop policy if exists video_transcripts_select_visible on public.video_transcripts;
create policy video_transcripts_select_visible
  on public.video_transcripts
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.videos v
      where v.id = video_id
        and (
          v.is_gated = false
          or (select auth.role()) = 'authenticated'
        )
    )
  );

-- No INSERT/UPDATE/DELETE for anon/authenticated — service role bypasses RLS.
