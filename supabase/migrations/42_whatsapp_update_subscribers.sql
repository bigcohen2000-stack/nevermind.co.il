-- WhatsApp updates channel waitlist (phone). Service-role writes only.

create table if not exists public.whatsapp_update_subscribers (
  id           uuid primary key default gen_random_uuid(),
  phone        text not null,
  source       text not null default 'site',
  status       text not null default 'active'
                 check (status in ('active', 'unsubscribed')),
  created_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,

  constraint whatsapp_update_subscribers_phone_not_blank
    check (length(trim(phone)) > 0),
  constraint whatsapp_update_subscribers_phone_unique
    unique (phone)
);

create index if not exists whatsapp_update_subscribers_created_at_idx
  on public.whatsapp_update_subscribers (created_at desc);

alter table public.whatsapp_update_subscribers enable row level security;
-- No anon/authenticated policies: service role only.
