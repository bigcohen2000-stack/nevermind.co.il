-- Meeting schedule + user confirmation (V) for Studio users.

alter table public.user_meetings
  add column if not exists status text not null default 'held';

alter table public.user_meetings
  add column if not exists confirmation_token text;

alter table public.user_meetings
  add column if not exists confirmation_requested_at timestamptz;

alter table public.user_meetings
  add column if not exists confirmed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_meetings_status_check'
  ) then
    alter table public.user_meetings
      add constraint user_meetings_status_check
      check (status in ('scheduled', 'confirmed', 'held', 'cancelled'));
  end if;
end $$;

create unique index if not exists user_meetings_confirmation_token_uidx
  on public.user_meetings (confirmation_token)
  where confirmation_token is not null;

create index if not exists user_meetings_status_held_at_idx
  on public.user_meetings (status, held_at desc);
