-- Member facing renewal signal: the club member marks that a renewal request
-- was already sent on WhatsApp, so Studio sees a pending request.
-- No payment flow. Written only by a signed club session (service role action).

alter table public.club_members
  add column if not exists renewal_requested_at timestamptz;

comment on column public.club_members.renewal_requested_at is
  'Member marked in the expiry banner that a renewal request was sent on WhatsApp. Cleared by Studio when the membership is extended.';

create index if not exists club_members_renewal_requested_at_idx
  on public.club_members (renewal_requested_at)
  where renewal_requested_at is not null;
