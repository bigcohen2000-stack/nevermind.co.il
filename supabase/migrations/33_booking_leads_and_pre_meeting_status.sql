-- Booking / contact leads for Studio + optional status on pre-meeting leads.

create table if not exists public.booking_leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text not null,
  email        text not null,
  context      text not null default '',
  source       text not null default 'site',
  status       text not null default 'new',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint booking_leads_name_not_blank
    check (length(trim(name)) > 0),
  constraint booking_leads_phone_not_blank
    check (length(trim(phone)) > 0),
  constraint booking_leads_email_not_blank
    check (length(trim(email)) > 0),
  constraint booking_leads_status_check
    check (status in ('new', 'contacted', 'closed'))
);

create index if not exists booking_leads_created_at_idx
  on public.booking_leads (created_at desc);

create index if not exists booking_leads_status_idx
  on public.booking_leads (status);

alter table public.booking_leads enable row level security;
-- Service role only (booking action + Studio).

alter table public.pre_meeting_leads
  add column if not exists status text not null default 'new';

alter table public.pre_meeting_leads
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pre_meeting_leads_status_check'
  ) then
    alter table public.pre_meeting_leads
      add constraint pre_meeting_leads_status_check
      check (status in ('new', 'contacted', 'closed'));
  end if;
end $$;

create index if not exists pre_meeting_leads_status_idx
  on public.pre_meeting_leads (status);
