-- Make auth.users -> public.perfiles profile creation safe.
-- Explicit SQL change: replaces create_profile_for_new_user so Auth user creation
-- is never aborted by a profile insert/update failure.

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  next_role text;
  next_name text;
begin
  next_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'role', ''),
    nullif(new.raw_user_meta_data ->> 'rol', ''),
    'consulta'
  );

  if next_role not in ('admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta') then
    next_role := 'consulta';
  end if;

  next_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'nombre', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    new.email
  );

  insert into public.perfiles (id, nombre, rol, role)
  values (new.id, next_name, next_role, next_role)
  on conflict (id) do update
  set nombre = coalesce(public.perfiles.nombre, excluded.nombre),
      rol = coalesce(public.perfiles.rol, excluded.rol),
      role = coalesce(public.perfiles.role, excluded.role);

  return new;
exception
  when others then
    raise warning 'create_profile_for_new_user skipped profile for user %, sqlstate %, error %', new.id, sqlstate, sqlerrm;
    return new;
end;
$$;

drop trigger if exists trg_create_profile_for_new_user on auth.users;
create trigger trg_create_profile_for_new_user
after insert on auth.users
for each row execute function public.create_profile_for_new_user();
