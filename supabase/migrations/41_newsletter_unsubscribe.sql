-- Newsletter unsubscribe tokens and status (extends migration 38).

alter table public.newsletter_subscribers
  add column if not exists status text not null default 'active'
    check (status in ('active', 'unsubscribed')),
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz;

create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);
