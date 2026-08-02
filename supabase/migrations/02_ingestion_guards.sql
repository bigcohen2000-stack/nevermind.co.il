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
