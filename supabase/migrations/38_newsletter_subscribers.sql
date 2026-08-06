-- Email newsletter list (manual send via Resend / Studio later).
-- Service role writes from the Server Action. No public SELECT.

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text not null default 'site',
  created_at timestamptz not null default now(),

  constraint newsletter_subscribers_email_not_blank
    check (length(trim(email)) > 0),
  constraint newsletter_subscribers_email_unique
    unique (email)
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;
-- No anon/authenticated policies: service role only.
