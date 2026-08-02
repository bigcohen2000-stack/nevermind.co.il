-- Timed caption chunks for Transcript Heatmap (offset/duration in ms).

alter table public.video_transcripts
  add column if not exists segments jsonb not null default '[]'::jsonb;

comment on column public.video_transcripts.segments is
  'Caption chunks: [{ "offsetMs", "durationMs", "text" }, ...] for density heatmap.';
