-- Curimapu Chillan
-- Sistema de Recepcion y Analisis de Cereales
-- Ejecutar completo en Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- Limpieza opcional para recrear el prototipo desde cero.
-- Descomenta estas lineas solo si quieres borrar todo.
-- drop view if exists planilla_general;
-- drop table if exists almacenamiento cascade;
-- drop table if exists laboratorio cascade;
-- drop table if exists romana cascade;
-- drop table if exists proveedores cascade;
-- drop table if exists documentos_curimapu cascade;
-- drop table if exists configuracion cascade;

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
  proveedor_id uuid references proveedores(id) on delete set null,
  proveedor_nombre text,
  rut_proveedor text,
  guia_despacho text,
  numero_guia_despacho text,
  peso_entrada numeric not null check (peso_entrada >= 0),
  fecha_ingreso date not null,
  hora_ingreso time not null,
  empresa_transporte text,
  estado text not null default 'Pendiente de laboratorio'
    check (estado in (
      'Pendiente de laboratorio',
      'Pendiente de almacenamiento',
      'Rechazado',
      'En espera',
      'En silo',
      'En bodega',
      'Despachado'
    )),
  observaciones text,
  created_at timestamp with time zone default now()
);

create table if not exists laboratorio (
  id uuid primary key default gen_random_uuid(),
  romana_id uuid not null references romana(id) on delete cascade,
  numero_lote text,
  fecha_muestreo date,
  hora_muestreo time,
  fecha_analisis date,
  hora_analisis time,
  laboratorio_ensayo text,
  correlativo_muestra text,
  producto text,
  humedad numeric check (humedad is null or humedad >= 0),
  proteina numeric check (proteina is null or proteina >= 0),
  gluten numeric check (gluten is null or gluten >= 0),
  gluten_index numeric check (gluten_index is null or gluten_index >= 0),
  peso_hectolitro numeric check (peso_hectolitro is null or peso_hectolitro >= 0),
  falling_number numeric check (falling_number is null or falling_number >= 0),
  peso_1000_granos numeric check (peso_1000_granos is null or peso_1000_granos >= 0),
  sedimentacion numeric check (sedimentacion is null or sedimentacion >= 0),
  impurezas numeric check (impurezas is null or impurezas >= 0),
  granos_partidos numeric check (granos_partidos is null or granos_partidos >= 0),
  granos_quebrados_chupados numeric check (granos_quebrados_chupados is null or granos_quebrados_chupados >= 0),
  granos_danados numeric check (granos_danados is null or granos_danados >= 0),
  granos_brotados numeric check (granos_brotados is null or granos_brotados >= 0),
  hongos numeric check (hongos is null or hongos >= 0),
  otros text,
  resultado text check (resultado is null or resultado in ('Aprobado', 'Rechazado')),
  observaciones_laboratorio text,
  created_at timestamp with time zone default now(),
  unique (romana_id)
);

create table if not exists almacenamiento (
  id uuid primary key default gen_random_uuid(),
  romana_id uuid not null references romana(id) on delete cascade,
  laboratorio_id uuid references laboratorio(id) on delete cascade,
  destino text check (destino is null or destino in ('almacenamiento', 'venta', 'guarda')),
  silo_bodega text,
  sector text,
  fecha_ingreso date,
  hora_ingreso time,
  responsable text,
  estado_almacenamiento text not null default 'En espera'
    check (estado_almacenamiento in ('En espera', 'En silo', 'En bodega', 'Despachado')),
  observaciones text,
  created_at timestamp with time zone default now(),
  unique (romana_id)
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

create table if not exists perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  rol text default 'operador',
  created_at timestamp with time zone default now()
);

create table if not exists documentos_curimapu (
  id uuid primary key default gen_random_uuid(),
  romana_id uuid references romana(id) on delete cascade,
  laboratorio_id uuid references laboratorio(id) on delete set null,
  almacenamiento_id uuid references almacenamiento(id) on delete set null,
  correlativo integer not null,
  numero_formateado text not null,
  nombre_archivo text not null,
  url_pdf text,
  proveedor text,
  patente text,
  producto text,
  resultado_laboratorio text,
  observaciones text,
  fecha_generacion timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index if not exists idx_proveedores_nombre on proveedores(nombre);
create index if not exists idx_romana_fecha on romana(fecha_ingreso);
create index if not exists idx_romana_estado on romana(estado);
create index if not exists idx_romana_patente on romana(patente);
create index if not exists idx_romana_numero_guia on romana(numero_guia_despacho);
create index if not exists idx_laboratorio_romana on laboratorio(romana_id);
create index if not exists idx_laboratorio_lote on laboratorio(numero_lote);
create index if not exists idx_laboratorio_resultado on laboratorio(resultado);
create index if not exists idx_almacenamiento_romana on almacenamiento(romana_id);
create index if not exists idx_almacenamiento_estado on almacenamiento(estado_almacenamiento);
create index if not exists idx_documentos_curimapu_romana on documentos_curimapu(romana_id);
create index if not exists idx_documentos_curimapu_correlativo on documentos_curimapu(correlativo);

-- Mantiene el estado general del camion segun laboratorio.
create or replace function set_estado_romana_desde_laboratorio()
returns trigger as $$
begin
  update romana
  set estado = case
    when new.resultado = 'Rechazado' then 'Rechazado'
    when new.resultado = 'Aprobado' then 'Pendiente de almacenamiento'
    else estado
  end
  where id = new.romana_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_estado_romana_desde_laboratorio on laboratorio;
create trigger trg_set_estado_romana_desde_laboratorio
after insert or update of resultado on laboratorio
for each row execute function set_estado_romana_desde_laboratorio();

-- Mantiene el estado general del camion segun almacenamiento.
create or replace function set_estado_romana_desde_almacenamiento()
returns trigger as $$
begin
  update romana
  set estado = new.estado_almacenamiento
  where id = new.romana_id
    and estado <> 'Rechazado';

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_estado_romana_desde_almacenamiento on almacenamiento;
create trigger trg_set_estado_romana_desde_almacenamiento
after insert or update of estado_almacenamiento on almacenamiento
for each row execute function set_estado_romana_desde_almacenamiento();

-- Vista unificada para planilla general.
create or replace view planilla_general as
select
  r.id as romana_id,
  to_char(r.fecha_ingreso, 'TMMonth') as mes,
  r.fecha_ingreso,
  r.hora_ingreso,
  r.patente,
  r.chofer,
  r.rut_chofer,
  coalesce(p.nombre, r.proveedor_nombre) as proveedor,
  coalesce(p.rut, r.rut_proveedor) as rut_proveedor,
  r.guia_despacho,
  r.numero_guia_despacho,
  r.peso_entrada,
  l.producto,
  l.numero_lote,
  l.fecha_muestreo,
  l.hora_muestreo,
  l.fecha_analisis,
  l.hora_analisis,
  l.laboratorio_ensayo,
  l.correlativo_muestra,
  l.humedad,
  l.proteina,
  l.gluten,
  l.gluten_index,
  l.peso_hectolitro,
  l.falling_number,
  l.peso_1000_granos,
  l.sedimentacion,
  l.impurezas,
  l.granos_partidos,
  l.granos_quebrados_chupados,
  l.granos_danados,
  l.granos_brotados,
  l.hongos,
  l.otros,
  l.resultado as resultado_laboratorio,
  l.observaciones_laboratorio,
  a.destino,
  a.silo_bodega,
  a.sector,
  a.fecha_ingreso as fecha_ingreso_almacenamiento,
  a.hora_ingreso as hora_ingreso_almacenamiento,
  a.responsable,
  a.estado_almacenamiento,
  r.estado as estado_general,
  coalesce(a.observaciones, l.observaciones_laboratorio, r.observaciones) as observaciones
from romana r
left join proveedores p on p.id = r.proveedor_id
left join laboratorio l on l.romana_id = r.id
left join almacenamiento a on a.romana_id = r.id;

-- Configuracion inicial unica para el prototipo.
insert into configuracion (humedad_alerta, nombre_empresa, color_principal, color_secundario)
select 15.0, 'CURIMAPU', '#2f6b3f', '#1f3d2b'
where not exists (select 1 from configuracion);

-- RLS abierto para prototipo academico.
-- Para produccion, reemplazar estas politicas por reglas con auth.uid().
alter table proveedores enable row level security;
alter table romana enable row level security;
alter table laboratorio enable row level security;
alter table almacenamiento enable row level security;
alter table configuracion enable row level security;
alter table documentos_curimapu enable row level security;
alter table perfiles enable row level security;

drop policy if exists "prototipo proveedores lectura" on proveedores;
drop policy if exists "prototipo proveedores escritura" on proveedores;
drop policy if exists "prototipo romana lectura" on romana;
drop policy if exists "prototipo romana escritura" on romana;
drop policy if exists "prototipo laboratorio lectura" on laboratorio;
drop policy if exists "prototipo laboratorio escritura" on laboratorio;
drop policy if exists "prototipo almacenamiento lectura" on almacenamiento;
drop policy if exists "prototipo almacenamiento escritura" on almacenamiento;
drop policy if exists "prototipo configuracion lectura" on configuracion;
drop policy if exists "prototipo configuracion escritura" on configuracion;
drop policy if exists "prototipo documentos lectura" on documentos_curimapu;
drop policy if exists "prototipo documentos escritura" on documentos_curimapu;
drop policy if exists "prototipo perfiles lectura" on perfiles;
drop policy if exists "prototipo perfiles escritura" on perfiles;

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
create policy "prototipo documentos lectura" on documentos_curimapu for select using (true);
create policy "prototipo documentos escritura" on documentos_curimapu for all using (true) with check (true);
create policy "prototipo perfiles lectura" on perfiles for select using (true);
create policy "prototipo perfiles escritura" on perfiles for all using (true) with check (true);
