-- NeverMind — optional email on pre-meeting leads
-- Aligns Thought Deconstructor intake with booking modal (name / phone / email).

alter table public.pre_meeting_leads
  add column if not exists email text;

comment on column public.pre_meeting_leads.email is
  'Optional contact email from Thought Deconstructor / booking intake';
