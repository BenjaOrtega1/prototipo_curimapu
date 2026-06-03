import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SectionCard from './SectionCard.jsx';
import { number } from '../utils/formatters';

const initial = {
  romana_id: '',
  laboratorio_id: '',
  destino: 'almacenamiento',
  silo_bodega: '',
  sector: '',
  fecha_ingreso: new Date().toISOString().slice(0, 10),
  hora_ingreso: new Date().toTimeString().slice(0, 5),
  responsable: '',
  estado_almacenamiento: 'En silo',
  observaciones: '',
};

export default function AlmacenamientoForm({
  aprobados,
  value,
  selectedRomanaId,
  selectedLaboratorioId,
  resumenSeleccionado,
  onRecepcionChange,
  onSubmit,
}) {
  const [form, setForm] = useState({ ...initial, ...value, romana_id: selectedRomanaId || '', laboratorio_id: selectedLaboratorioId || '' });

  useEffect(() => {
    setForm((current) => ({
      ...initial,
      ...value,
      ...current,
      romana_id: selectedRomanaId || value?.romana_id || current.romana_id || '',
      laboratorio_id: selectedLaboratorioId || value?.laboratorio_id || current.laboratorio_id || '',
    }));
  }, [value, selectedRomanaId, selectedLaboratorioId]);

  const options = useMemo(() => {
    if (!resumenSeleccionado || aprobados.some((item) => item.id === resumenSeleccionado.id)) return aprobados;
    return [resumenSeleccionado, ...aprobados];
  }, [aprobados, resumenSeleccionado]);

  function selectRecepcion(id) {
    const record = options.find((item) => item.id === id);
    setForm((current) => ({ ...current, romana_id: id, laboratorio_id: record?.laboratorio?.id || '' }));
    onRecepcionChange?.(id);
  }

  const update = (field, next) => setForm((current) => ({ ...current, [field]: next }));

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
    setForm(initial);
  }

  return (
    <form onSubmit={submit}>
      <SectionCard
        title="Ingreso a almacenamiento"
        description="Asigna destino, silo o bodega a registros aprobados."
        action={<button className="btn btn-primary" type="submit"><Save size={17} />Guardar almacenamiento</button>}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Recepcion asociada">
            <select required value={form.romana_id} onChange={(e) => selectRecepcion(e.target.value)}>
              <option value="">Seleccionar</option>
              {options.map((row) => <option key={row.id} value={row.id}>{row.patente} - {row.proveedor_nombre} - {row.laboratorio?.producto}</option>)}
            </select>
          </Field>

          {resumenSeleccionado && (
            <div className="md:col-span-3 rounded-2xl border border-curimapu-green/20 bg-curimapu-light p-4 text-sm text-curimapu-dark">
              <strong>Datos aprobados para almacenamiento</strong>
              <div className="mt-2 grid gap-2 sm:grid-cols-6">
                <p><b>Patente:</b><br />{resumenSeleccionado.patente}</p>
                <p><b>Proveedor:</b><br />{resumenSeleccionado.proveedor_nombre}</p>
                <p><b>Producto:</b><br />{resumenSeleccionado.laboratorio?.producto}</p>
                <p><b>N lote:</b><br />{resumenSeleccionado.laboratorio?.numero_lote}</p>
                <p><b>Humedad:</b><br />{number(resumenSeleccionado.laboratorio?.humedad, 1)}%</p>
                <p><b>Resultado:</b><br />{resumenSeleccionado.laboratorio?.resultado}</p>
              </div>
            </div>
          )}

          <Field label="Destino">
            <select value={form.destino} onChange={(e) => update('destino', e.target.value)}>
              <option>almacenamiento</option>
              <option>venta</option>
              <option>guarda</option>
            </select>
          </Field>
          <Field label="Silo o bodega N"><input required value={form.silo_bodega} onChange={(e) => update('silo_bodega', e.target.value)} /></Field>
          <Field label="Sector"><input value={form.sector} onChange={(e) => update('sector', e.target.value)} /></Field>
          <Field label="Fecha ingreso almacenamiento"><input type="date" value={form.fecha_ingreso} onChange={(e) => update('fecha_ingreso', e.target.value)} /></Field>
          <Field label="Hora ingreso almacenamiento"><input type="time" value={form.hora_ingreso} onChange={(e) => update('hora_ingreso', e.target.value)} /></Field>
          <Field label="Responsable"><input value={form.responsable} onChange={(e) => update('responsable', e.target.value)} /></Field>
          <Field label="Estado almacenamiento">
            <select value={form.estado_almacenamiento} onChange={(e) => update('estado_almacenamiento', e.target.value)}>
              <option>En silo</option>
              <option>En bodega</option>
              <option>Despachado</option>
            </select>
          </Field>
          <div className="md:col-span-4"><Field label="Observaciones"><textarea rows="2" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} /></Field></div>
        </div>
      </SectionCard>
    </form>
  );
}

function Field({ label, children }) {
  return <div className="form-field"><label>{label}</label>{children}</div>;
}
