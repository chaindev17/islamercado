-- ============================================================
-- IslaMercado — esquema inicial
-- Marketplace para Cuba: categorías, perfiles, publicaciones,
-- storage de imágenes y políticas RLS.
-- ============================================================

-- ---------- Tablas ----------
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  icon text not null default '📦'
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  category_id bigint not null references public.categories(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null default '',
  price_usd numeric(12,2) not null check (price_usd >= 0),
  negotiable boolean not null default false,
  condition text not null default 'usado' check (condition in ('nuevo','como_nuevo','usado')),
  province text not null,
  city text,
  images text[] not null default '{}',
  phone text,
  status text not null default 'active' check (status in ('active','sold','paused')),
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_created_idx on public.listings (created_at desc);
create index if not exists listings_category_idx on public.listings (category_id);
create index if not exists listings_province_idx on public.listings (province);

-- ---------- Funciones y triggers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists listings_touch on public.listings;
create trigger listings_touch
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Crea automáticamente el perfil de cada usuario nuevo
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Contador de vistas (ejecutable desde el cliente anónimo)
create or replace function public.incrementar_vista(listing uuid)
returns void language sql security definer set search_path = public as $$
  update public.listings set views = views + 1 where id = listing;
$$;

grant execute on function public.incrementar_vista(uuid) to anon, authenticated;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories
  for select using (true);

drop policy if exists "listings_select" on public.listings;
create policy "listings_select" on public.listings
  for select using (status = 'active' or auth.uid() = seller_id);

drop policy if exists "listings_insert_owner" on public.listings;
create policy "listings_insert_owner" on public.listings
  for insert to authenticated with check (auth.uid() = seller_id);

drop policy if exists "listings_update_owner" on public.listings;
create policy "listings_update_owner" on public.listings
  for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists "listings_delete_owner" on public.listings;
create policy "listings_delete_owner" on public.listings
  for delete using (auth.uid() = seller_id);

-- ---------- Storage: bucket de imágenes ----------
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "img_select_public" on storage.objects;
create policy "img_select_public" on storage.objects
  for select using (bucket_id = 'listing-images');

drop policy if exists "img_insert_owner_folder" on storage.objects;
create policy "img_insert_owner_folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "img_delete_owner_folder" on storage.objects;
create policy "img_delete_owner_folder" on storage.objects
  for delete using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ---------- Categorías iniciales ----------
insert into public.categories (slug, name, icon) values
  ('vehiculos',        'Vehículos',                    '🚗'),
  ('inmuebles',        'Inmuebles',                    '🏠'),
  ('telefonia',        'Teléfonos',                    '📱'),
  ('electronica',      'Electrónica y Audio',          '🎧'),
  ('computacion',      'Computación',                  '💻'),
  ('electrodomesticos','Electrodomésticos',            '🔌'),
  ('energia',          'Energía Solar',                '☀️'),
  ('hogar',            'Hogar y Muebles',              '🛋️'),
  ('moda',             'Moda y Accesorios',            '👕'),
  ('deportes',         'Deportes y Bicicletas',        '⚽'),
  ('musica',           'Música e Instrumentos',        '🎸'),
  ('mascotas',         'Mascotas',                     '🐾'),
  ('ninos',            'Artículos Infantiles',         '🧸'),
  ('herramientas',     'Construcción y Herramientas',  '🔧'),
  ('agro',             'Agro y Jardín',                '🌱'),
  ('servicios',        'Servicios',                    '🛠️'),
  ('empleos',          'Empleos',                      '💼'),
  ('otros',            'Otros',                        '📦')
on conflict (slug) do nothing;
