-- NeverMind — unlisted videos are always members-only (auto gate)
-- YouTube privacy "unlisted" (לא רשום) → is_gated = true automatically.
-- Public listed videos stay open unless explicitly gated.

-- Backfill existing rows.
update public.videos
set is_gated = true
where is_unlisted = true
  and is_gated = false;

-- Keep is_gated in sync whenever is_unlisted flips on.
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

comment on function public.videos_unlisted_forces_gated() is
  'Forces is_gated=true whenever is_unlisted=true (club / לא רשום library).';
