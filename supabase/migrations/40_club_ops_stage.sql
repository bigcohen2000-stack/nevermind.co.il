-- Club ops stage timestamps (Studio grant flow survives refresh).

alter table public.club_members
  add column if not exists ops_link_minted_at timestamptz,
  add column if not exists ops_whatsapp_sent_at timestamptz;

comment on column public.club_members.ops_link_minted_at is
  'Studio: link or password minted for this member.';
comment on column public.club_members.ops_whatsapp_sent_at is
  'Studio: WhatsApp access message marked as sent.';
