-- Objective Truth: logical core facts extracted once at ingest.
-- text[] of 3–5 short sentences, no emotion / story.

alter table public.videos
  add column if not exists core_facts text[] not null default '{}';

comment on column public.videos.core_facts is
  'Absolute logical facts from transcript (OpenAI, once at import). Empty until extracted.';
