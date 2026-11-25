-- ============================================================
-- IslaMercado — Reseñas de vendedores
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_id, seller_id)
);

create index if not exists reviews_seller_idx on public.reviews (seller_id, created_at desc);
create index if not exists reviews_author_idx on public.reviews (author_id);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_author" on public.reviews;
create policy "reviews_insert_author" on public.reviews
  for insert to authenticated
  with check (auth.uid() = author_id and author_id <> seller_id);

drop policy if exists "reviews_update_author" on public.reviews;
create policy "reviews_update_author" on public.reviews
  for update using (auth.uid() = author_id)
  with check (auth.uid() = author_id and author_id <> seller_id);

drop policy if exists "reviews_delete_author" on public.reviews;
create policy "reviews_delete_author" on public.reviews
  for delete using (auth.uid() = author_id);

drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch
  before update on public.reviews
  for each row execute function public.set_updated_at();
