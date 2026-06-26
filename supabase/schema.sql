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
  rol text default 'consulta'
    check (rol in ('admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta')),
  created_at timestamp with time zone default now()
);

create or replace function create_profile_for_new_user()
returns trigger as $$
begin
  insert into perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', new.email),
    case
      when new.raw_user_meta_data ->> 'rol' in ('admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta')
      then new.raw_user_meta_data ->> 'rol'
      else 'consulta'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_create_profile_for_new_user on auth.users;
create trigger trg_create_profile_for_new_user
after insert on auth.users
for each row execute function create_profile_for_new_user();

create table if not exists auditoria_cambios (
  id uuid primary key default gen_random_uuid(),
  tabla text not null,
  registro_id uuid,
  accion text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id uuid references auth.users(id) on delete set null,
  usuario_email text,
  rol text,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
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
create index if not exists idx_auditoria_cambios_tabla on auditoria_cambios(tabla);
create index if not exists idx_auditoria_cambios_usuario on auditoria_cambios(usuario_id);
create index if not exists idx_auditoria_cambios_created_at on auditoria_cambios(created_at);

alter table proveedores add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table proveedores add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table proveedores add column if not exists updated_at timestamp with time zone;
alter table romana add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table romana add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table romana add column if not exists updated_at timestamp with time zone;
alter table laboratorio add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table laboratorio add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table laboratorio add column if not exists updated_at timestamp with time zone;
alter table almacenamiento add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table almacenamiento add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table almacenamiento add column if not exists updated_at timestamp with time zone;
alter table documentos_curimapu add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table documentos_curimapu add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table documentos_curimapu add column if not exists updated_at timestamp with time zone;

create or replace function current_app_role()
returns text as $$
  select coalesce((select rol from perfiles where id = auth.uid()), 'consulta');
$$ language sql stable security definer;

create or replace function can_write_area(area text)
returns boolean as $$
  select current_app_role() in ('admin', 'desarrollador') or current_app_role() = area;
$$ language sql stable security definer;

create or replace function can_write_documents()
returns boolean as $$
  select current_app_role() in ('admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento');
$$ language sql stable security definer;

create or replace function set_user_tracking_columns()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = coalesce(new.created_by, auth.uid());
    new.updated_by = auth.uid();
    new.updated_at = now();
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.created_by = old.created_by;
    new.updated_by = auth.uid();
    new.updated_at = now();
    return new;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create or replace function audit_table_change()
returns trigger as $$
declare
  next_record jsonb;
  previous_record jsonb;
  record_id uuid;
begin
  if tg_op = 'DELETE' then
    previous_record = to_jsonb(old);
    next_record = null;
    record_id = old.id;
  else
    previous_record = case when tg_op = 'UPDATE' then to_jsonb(old) else null end;
    next_record = to_jsonb(new);
    record_id = new.id;
  end if;

  insert into auditoria_cambios (
    tabla,
    registro_id,
    accion,
    usuario_id,
    usuario_email,
    rol,
    datos_anteriores,
    datos_nuevos
  )
  values (
    tg_table_name,
    record_id,
    tg_op,
    auth.uid(),
    auth.jwt() ->> 'email',
    current_app_role(),
    previous_record,
    next_record
  );

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists trg_tracking_proveedores on proveedores;
create trigger trg_tracking_proveedores before insert or update on proveedores
for each row execute function set_user_tracking_columns();
drop trigger if exists trg_tracking_romana on romana;
create trigger trg_tracking_romana before insert or update on romana
for each row execute function set_user_tracking_columns();
drop trigger if exists trg_tracking_laboratorio on laboratorio;
create trigger trg_tracking_laboratorio before insert or update on laboratorio
for each row execute function set_user_tracking_columns();
drop trigger if exists trg_tracking_almacenamiento on almacenamiento;
create trigger trg_tracking_almacenamiento before insert or update on almacenamiento
for each row execute function set_user_tracking_columns();
drop trigger if exists trg_tracking_documentos on documentos_curimapu;
create trigger trg_tracking_documentos before insert or update on documentos_curimapu
for each row execute function set_user_tracking_columns();

drop trigger if exists trg_audit_proveedores on proveedores;
create trigger trg_audit_proveedores after insert or update or delete on proveedores
for each row execute function audit_table_change();
drop trigger if exists trg_audit_romana on romana;
create trigger trg_audit_romana after insert or update or delete on romana
for each row execute function audit_table_change();
drop trigger if exists trg_audit_laboratorio on laboratorio;
create trigger trg_audit_laboratorio after insert or update or delete on laboratorio
for each row execute function audit_table_change();
drop trigger if exists trg_audit_almacenamiento on almacenamiento;
create trigger trg_audit_almacenamiento after insert or update or delete on almacenamiento
for each row execute function audit_table_change();
drop trigger if exists trg_audit_documentos on documentos_curimapu;
create trigger trg_audit_documentos after insert or update or delete on documentos_curimapu
for each row execute function audit_table_change();

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

-- RLS por rol para produccion.
-- Roles validos en perfiles.rol:
-- admin: acceso total.
-- desarrollador: acceso total tecnico.
-- romana: modifica romana/proveedores y puede leer laboratorio/almacenamiento/planilla.
-- laboratorio: modifica laboratorio y puede leer romana/almacenamiento/planilla.
-- almacenamiento: modifica almacenamiento y puede leer romana/laboratorio/planilla.
-- consulta: solo lectura.
alter table proveedores enable row level security;
alter table romana enable row level security;
alter table laboratorio enable row level security;
alter table almacenamiento enable row level security;
alter table configuracion enable row level security;
alter table documentos_curimapu enable row level security;
alter table perfiles enable row level security;
alter table auditoria_cambios enable row level security;

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
drop policy if exists "proveedores lectura autenticada" on proveedores;
drop policy if exists "proveedores escritura romana admin" on proveedores;
drop policy if exists "romana lectura autenticada" on romana;
drop policy if exists "romana escritura rol romana" on romana;
drop policy if exists "laboratorio lectura autenticada" on laboratorio;
drop policy if exists "laboratorio escritura rol laboratorio" on laboratorio;
drop policy if exists "almacenamiento lectura autenticada" on almacenamiento;
drop policy if exists "almacenamiento escritura rol almacenamiento" on almacenamiento;
drop policy if exists "configuracion lectura autenticada" on configuracion;
drop policy if exists "configuracion escritura admin" on configuracion;
drop policy if exists "documentos lectura autenticada" on documentos_curimapu;
drop policy if exists "documentos escritura roles operativos" on documentos_curimapu;
drop policy if exists "perfiles lectura propia o admin" on perfiles;
drop policy if exists "perfiles escritura admin" on perfiles;
drop policy if exists "auditoria lectura admin" on auditoria_cambios;
drop policy if exists "auditoria insercion sistema" on auditoria_cambios;

create policy "proveedores lectura autenticada" on proveedores
for select using (auth.uid() is not null);
create policy "proveedores escritura romana admin" on proveedores
for all using (can_write_area('romana')) with check (can_write_area('romana'));

create policy "romana lectura autenticada" on romana
for select using (auth.uid() is not null);
create policy "romana escritura rol romana" on romana
for all using (can_write_area('romana')) with check (can_write_area('romana'));

create policy "laboratorio lectura autenticada" on laboratorio
for select using (auth.uid() is not null);
create policy "laboratorio escritura rol laboratorio" on laboratorio
for all using (can_write_area('laboratorio')) with check (can_write_area('laboratorio'));

create policy "almacenamiento lectura autenticada" on almacenamiento
for select using (auth.uid() is not null);
create policy "almacenamiento escritura rol almacenamiento" on almacenamiento
for all using (can_write_area('almacenamiento')) with check (can_write_area('almacenamiento'));

create policy "configuracion lectura autenticada" on configuracion
for select using (auth.uid() is not null);
create policy "configuracion escritura admin" on configuracion
for all using (current_app_role() in ('admin', 'desarrollador')) with check (current_app_role() in ('admin', 'desarrollador'));

create policy "documentos lectura autenticada" on documentos_curimapu
for select using (auth.uid() is not null);
create policy "documentos escritura roles operativos" on documentos_curimapu
for all using (can_write_documents()) with check (can_write_documents());

create policy "perfiles lectura propia o admin" on perfiles
for select using (id = auth.uid() or current_app_role() in ('admin', 'desarrollador'));
create policy "perfiles escritura admin" on perfiles
for all using (current_app_role() in ('admin', 'desarrollador')) with check (current_app_role() in ('admin', 'desarrollador'));

create policy "auditoria lectura admin" on auditoria_cambios
for select using (current_app_role() in ('admin', 'desarrollador'));
create policy "auditoria insercion sistema" on auditoria_cambios
for insert with check (auth.uid() is not null);
