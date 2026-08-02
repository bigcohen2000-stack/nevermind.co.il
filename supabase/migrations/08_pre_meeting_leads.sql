-- NeverMind — pre-meeting logic filter leads
-- Stores structured fact/story intake before a booking call.
-- Writes via service role from the server action. No public read.

create extension if not exists "pgcrypto";

create table if not exists public.pre_meeting_leads (
  id                   uuid primary key default gen_random_uuid(),
  situation_text       text not null,
  objective_facts      text not null,
  subjective_story     text not null,
  name                 text not null,
  phone                text not null,
  source               text not null default 'booking-logic-filter',
  created_at           timestamptz not null default now(),

  constraint pre_meeting_leads_situation_not_blank
    check (length(trim(situation_text)) > 0),
  constraint pre_meeting_leads_facts_not_blank
    check (length(trim(objective_facts)) > 0),
  constraint pre_meeting_leads_story_not_blank
    check (length(trim(subjective_story)) > 0),
  constraint pre_meeting_leads_name_not_blank
    check (length(trim(name)) > 0),
  constraint pre_meeting_leads_phone_not_blank
    check (length(trim(phone)) > 0)
);

create index if not exists pre_meeting_leads_created_at_idx
  on public.pre_meeting_leads (created_at desc);

alter table public.pre_meeting_leads enable row level security;

-- No anon/authenticated policies: inserts go through service role only.
