-- ============================================================
-- IslaMercado — Chat interno y Favoritos
-- ============================================================

-- ---------- Mensajes ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_listing_idx  on public.messages (listing_id, created_at);
create index if not exists messages_sender_idx   on public.messages (sender_id, created_at desc);
create index if not exists messages_receiver_idx on public.messages (receiver_id, created_at desc);
create index if not exists messages_unread_idx   on public.messages (receiver_id) where read_at is null;

alter table public.messages enable row level security;

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages
  for select using (auth.uid() in (sender_id, receiver_id));

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages
  for insert to authenticated
  with check (auth.uid() = sender_id and receiver_id <> sender_id);

-- Solo quien recibe puede marcar como leído
drop policy if exists "messages_update_receiver_read" on public.messages;
create policy "messages_update_receiver_read" on public.messages
  for update using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- Tiempo real para los mensajes entrantes
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;

-- ---------- Favoritos ----------
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);
