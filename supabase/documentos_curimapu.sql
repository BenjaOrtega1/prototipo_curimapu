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

alter table documentos_curimapu enable row level security;

drop policy if exists "documentos lectura prototipo" on documentos_curimapu;
drop policy if exists "documentos escritura prototipo" on documentos_curimapu;

create policy "documentos lectura prototipo"
on documentos_curimapu for select using (true);

create policy "documentos escritura prototipo"
on documentos_curimapu for all using (true) with check (true);
