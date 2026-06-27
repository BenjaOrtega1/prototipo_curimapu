-- Admin users setup for Curimapu.
-- This migration keeps perfiles compatible with the app and can bootstrap one
-- existing auth user as desarrollador when app.bootstrap_developer_email is set.

alter table if exists public.perfiles enable row level security;

alter table if exists public.perfiles
  add column if not exists nombre text,
  add column if not exists rol text default 'consulta',
  add column if not exists created_at timestamp with time zone default now();

do $$
begin
  alter table public.perfiles
    drop constraint if exists perfiles_rol_check;

  alter table public.perfiles
    add constraint perfiles_rol_check
    check (rol in ('admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta'));
end $$;

drop policy if exists "perfiles lectura propia o admin" on public.perfiles;
drop policy if exists "perfiles escritura admin" on public.perfiles;

create policy "perfiles lectura propia o admin" on public.perfiles
for select
using (
  id = auth.uid()
  or public.current_app_role() in ('admin', 'desarrollador')
);

create policy "perfiles escritura admin" on public.perfiles
for all
using (public.current_app_role() in ('admin', 'desarrollador'))
with check (public.current_app_role() in ('admin', 'desarrollador'));

do $$
declare
  target_email text := nullif(current_setting('app.bootstrap_developer_email', true), '');
  target_user_id uuid;
begin
  if target_email is null then
    raise notice 'No bootstrap developer email configured. To promote a user, run: set app.bootstrap_developer_email = ''correo@dominio.cl''; then apply this migration.';
    return;
  end if;

  select id into target_user_id
  from auth.users
  where lower(email) = lower(target_email)
  limit 1;

  if target_user_id is null then
    raise exception 'No auth.users row found for email %', target_email;
  end if;

  insert into public.perfiles (id, nombre, rol)
  values (target_user_id, target_email, 'desarrollador')
  on conflict (id) do update
  set rol = 'desarrollador',
      nombre = coalesce(public.perfiles.nombre, excluded.nombre);
end $$;
