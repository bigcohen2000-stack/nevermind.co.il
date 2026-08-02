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
