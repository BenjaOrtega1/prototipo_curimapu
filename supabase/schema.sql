create extension if not exists "pgcrypto";

create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rut text,
  telefono text,
  email text,
  direccion text,
  created_at timestamp with time zone default now()
);

create table if not exists romana (
  id uuid primary key default gen_random_uuid(),
  patente text not null,
  chofer text not null,
  rut_chofer text,
  proveedor_id uuid references proveedores(id),
  proveedor_nombre text,
  guia_despacho text,
  numero_guia_despacho text,
  peso_entrada numeric not null,
  fecha_ingreso date not null,
  hora_ingreso time not null,
  empresa_transporte text,
  estado text default 'Pendiente de laboratorio',
  observaciones text,
  created_at timestamp with time zone default now()
);

create table if not exists laboratorio (
  id uuid primary key default gen_random_uuid(),
  romana_id uuid references romana(id) on delete cascade,
  numero_lote text,
  fecha_muestreo date,
  hora_muestreo time,
  fecha_analisis date,
  hora_analisis time,
  laboratorio_ensayo text,
  correlativo_muestra text,
  producto text,
  humedad numeric,
  proteina numeric,
  gluten numeric,
  gluten_index numeric,
  peso_hectolitro numeric,
  falling_number numeric,
  peso_1000_granos numeric,
  sedimentacion numeric,
  impurezas numeric,
  granos_partidos numeric,
  granos_quebrados_chupados numeric,
  granos_danados numeric,
  granos_brotados numeric,
  hongos numeric,
  otros text,
  resultado text,
  observaciones_laboratorio text,
  created_at timestamp with time zone default now()
);

create table if not exists almacenamiento (
  id uuid primary key default gen_random_uuid(),
  romana_id uuid references romana(id) on delete cascade,
  laboratorio_id uuid references laboratorio(id) on delete cascade,
  destino text,
  silo_bodega text,
  sector text,
  fecha_ingreso date,
  hora_ingreso time,
  responsable text,
  estado_almacenamiento text default 'En espera',
  observaciones text,
  created_at timestamp with time zone default now()
);

create table if not exists configuracion (
  id uuid primary key default gen_random_uuid(),
  humedad_alerta numeric default 15.0,
  nombre_empresa text default 'CURIMAPU',
  logo_url text,
  color_principal text default '#2f6b3f',
  color_secundario text default '#1f3d2b',
  created_at timestamp with time zone default now()
);

create index if not exists idx_romana_fecha on romana(fecha_ingreso);
create index if not exists idx_romana_estado on romana(estado);
create index if not exists idx_laboratorio_romana on laboratorio(romana_id);
create index if not exists idx_almacenamiento_romana on almacenamiento(romana_id);

alter table proveedores enable row level security;
alter table romana enable row level security;
alter table laboratorio enable row level security;
alter table almacenamiento enable row level security;
alter table configuracion enable row level security;

create policy "prototipo proveedores lectura" on proveedores for select using (true);
create policy "prototipo proveedores escritura" on proveedores for all using (true) with check (true);
create policy "prototipo romana lectura" on romana for select using (true);
create policy "prototipo romana escritura" on romana for all using (true) with check (true);
create policy "prototipo laboratorio lectura" on laboratorio for select using (true);
create policy "prototipo laboratorio escritura" on laboratorio for all using (true) with check (true);
create policy "prototipo almacenamiento lectura" on almacenamiento for select using (true);
create policy "prototipo almacenamiento escritura" on almacenamiento for all using (true) with check (true);
create policy "prototipo configuracion lectura" on configuracion for select using (true);
create policy "prototipo configuracion escritura" on configuracion for all using (true) with check (true);

insert into configuracion (humedad_alerta, nombre_empresa, color_principal, color_secundario)
select 15.0, 'CURIMAPU', '#2f6b3f', '#1f3d2b'
where not exists (select 1 from configuracion);
