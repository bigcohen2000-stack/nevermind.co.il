-- Live stream queue (plan ahead) + push preference for live alerts.

create table if not exists public.live_stream_queue (
  id            uuid primary key default gen_random_uuid(),
  youtube_url   text not null,
  topic         text not null default '',
  scheduled_at  timestamptz not null,
  status        text not null default 'planned',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint live_stream_queue_youtube_url_len
    check (char_length(trim(youtube_url)) between 12 and 500),
  constraint live_stream_queue_topic_len
    check (char_length(topic) <= 300),
  constraint live_stream_queue_status_check
    check (status in ('planned', 'live', 'done', 'cancelled'))
);

create index if not exists live_stream_queue_scheduled_at_idx
  on public.live_stream_queue (scheduled_at asc);

create index if not exists live_stream_queue_status_scheduled_idx
  on public.live_stream_queue (status, scheduled_at asc);

alter table public.live_stream_queue enable row level security;
-- Service role / Studio only (no public policies).

-- Push topics: daily reset stays on by default, live opt-in.
alter table public.subscribers
  add column if not exists notify_live boolean not null default false;

alter table public.subscribers
  add column if not exists notify_daily boolean not null default true;

alter table public.subscribers
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists subscribers_notify_live_idx
  on public.subscribers (notify_live)
  where notify_live = true;

notify pgrst, 'reload schema';
