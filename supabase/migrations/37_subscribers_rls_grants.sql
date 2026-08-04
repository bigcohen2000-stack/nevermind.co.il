-- Fix public subscribe path for Web Push (Daily Resets).
-- App subscribe API uses service_role. These grants/policies keep direct client
-- writes working and match 09_push_subscribers.sql intent.

grant insert, update, delete on table public.subscribers to anon, authenticated;

drop policy if exists subscribers_insert_public on public.subscribers;
create policy subscribers_insert_public
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists subscribers_update_public on public.subscribers;
create policy subscribers_update_public
  on public.subscribers
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists subscribers_delete_public on public.subscribers;
create policy subscribers_delete_public
  on public.subscribers
  for delete
  to anon, authenticated
  using (true);

-- No public SELECT: endpoints and keys stay server-side only.

notify pgrst, 'reload schema';
