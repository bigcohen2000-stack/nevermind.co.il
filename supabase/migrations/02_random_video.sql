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
