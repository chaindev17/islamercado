-- IslaMercado — fallback de username único en el trigger de perfiles.
-- Si dos usuarios eligen el mismo nombre, se les añade un sufijo
-- con los primeros 4 caracteres de su UUID en vez de fallar el registro.

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
exception
  when unique_violation then
    insert into public.profiles (id, username, phone)
    values (
      new.id,
      split_part(new.email, '@', 1) || '_' || substr(replace(new.id::text, '-', ''), 1, 4),
      nullif(new.raw_user_meta_data->>'phone', '')
    );
    return new;
end $$;
