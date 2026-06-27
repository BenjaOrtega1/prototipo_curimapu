-- Admin users role compatibility.
-- Explicit SQL change: adds public.perfiles.role and keeps it synced with public.perfiles.rol.

create extension if not exists "pgcrypto";

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  rol text default 'consulta',
  created_at timestamp with time zone default now()
);

alter table public.perfiles
  add column if not exists role text default 'consulta';

update public.perfiles
set role = coalesce(nullif(role, ''), nullif(rol, ''), 'consulta'),
    rol = coalesce(nullif(rol, ''), nullif(role, ''), 'consulta');

do $$
begin
  alter table public.perfiles drop constraint if exists perfiles_rol_check;
  alter table public.perfiles drop constraint if exists perfiles_role_check;

  alter table public.perfiles
    add constraint perfiles_rol_check
    check (rol in ('admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta'));

  alter table public.perfiles
    add constraint perfiles_role_check
    check (role in ('admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta'));
end $$;

create or replace function public.sync_perfiles_role_columns()
returns trigger as $$
begin
  new.role = coalesce(nullif(new.role, ''), nullif(new.rol, ''), 'consulta');
  new.rol = coalesce(nullif(new.rol, ''), nullif(new.role, ''), 'consulta');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_perfiles_role_columns on public.perfiles;
create trigger trg_sync_perfiles_role_columns
before insert or update on public.perfiles
for each row execute function public.sync_perfiles_role_columns();

create or replace function public.current_app_role()
returns text as $$
  select coalesce((select coalesce(role, rol) from public.perfiles where id = auth.uid()), 'consulta');
$$ language sql stable security definer;

alter table public.perfiles enable row level security;

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
