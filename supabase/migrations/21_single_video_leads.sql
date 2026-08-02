-- Single-video purchase / request leads for Studio.
-- Click logging from the 50 NIS CTA + manual Studio status updates.

create table if not exists public.single_video_leads (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid references public.videos (id) on delete set null,
  video_title  text not null default '',
  phone        text,
  status       text not null default 'requested',
  source       text not null default 'cta',
  note         text,
  watch_url    text,
  club_token_id uuid references public.club_tokens (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint single_video_leads_status_check
    check (status in ('requested', 'chatting', 'paid', 'sent', 'closed')),
  constraint single_video_leads_source_check
    check (source in ('cta', 'whatsapp', 'studio', 'other')),
  constraint single_video_leads_title_not_blank
    check (length(trim(video_title)) > 0)
);

create index if not exists single_video_leads_created_at_idx
  on public.single_video_leads (created_at desc);

create index if not exists single_video_leads_status_idx
  on public.single_video_leads (status);

create index if not exists single_video_leads_video_id_idx
  on public.single_video_leads (video_id);

alter table public.single_video_leads enable row level security;
-- No anon/authenticated policies: service role only (Studio + CTA logger).
