create table if not exists perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  rol text default 'operador',
  created_at timestamp with time zone default now()
);

alter table perfiles enable row level security;

drop policy if exists "perfiles lectura prototipo" on perfiles;
drop policy if exists "perfiles escritura prototipo" on perfiles;

create policy "perfiles lectura prototipo"
on perfiles for select using (true);

create policy "perfiles escritura prototipo"
on perfiles for all using (true) with check (true);
