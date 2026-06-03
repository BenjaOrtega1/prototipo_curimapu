import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SectionCard from './SectionCard.jsx';
import { humedadAlerta, number } from '../utils/formatters';

const initial = {
  romana_id: '',
  numero_lote: '',
  fecha_muestreo: new Date().toISOString().slice(0, 10),
  hora_muestreo: new Date().toTimeString().slice(0, 5),
  fecha_analisis: new Date().toISOString().slice(0, 10),
  hora_analisis: new Date().toTimeString().slice(0, 5),
  laboratorio_ensayo: 'Laboratorio Curimapu Chillan',
  correlativo_muestra: '',
  producto: 'Trigo',
  humedad: '',
  proteina: '',
  gluten: '',
  gluten_index: '',
  peso_hectolitro: '',
  falling_number: '',
  peso_1000_granos: '',
  sedimentacion: '',
  impurezas: '',
  granos_partidos: '',
  granos_quebrados_chupados: '',
  granos_danados: '',
  granos_brotados: '',
  hongos: '',
  otros: '',
  resultado: 'Aprobado',
  observaciones_laboratorio: '',
};

const numericFields = [
  ['humedad', '% humedad'],
  ['proteina', '% proteina'],
  ['gluten', '% gluten corregido al 14%'],
  ['gluten_index', 'Gluten index'],
  ['peso_hectolitro', 'Peso hectolitro'],
  ['falling_number', 'Falling number'],
  ['peso_1000_granos', 'Peso 1000 granos'],
  ['sedimentacion', 'Valor sedimentacion'],
  ['impurezas', '% impurezas'],
  ['granos_partidos', '% granos partidos'],
  ['granos_quebrados_chupados', '% granos quebrados/chupados'],
  ['granos_danados', '% granos danados'],
  ['granos_brotados', '% granos brotados'],
  ['hongos', '% hongos'],
];

export default function LaboratorioForm({
  pendientes,
  value,
  selectedRomanaId,
  romanaSeleccionada,
  onRomanaChange,
  onSubmit,
}) {
  const [form, setForm] = useState({ ...initial, ...value, romana_id: selectedRomanaId || value?.romana_id || '' });

  useEffect(() => {
    setForm((current) => ({
      ...initial,
      ...value,
      ...current,
      romana_id: selectedRomanaId || value?.romana_id || current.romana_id || '',
      producto: current.producto || value?.producto || 'Trigo',
    }));
  }, [value, selectedRomanaId]);

  const options = useMemo(() => {
    if (!romanaSeleccionada || pendientes.some((item) => item.id === romanaSeleccionada.id)) return pendientes;
    return [romanaSeleccionada, ...pendientes];
  }, [pendientes, romanaSeleccionada]);

  const update = (field, next) => setForm((current) => ({ ...current, [field]: next }));
  const wet = Number(form.humedad || 0) > humedadAlerta;

  function selectRomana(id) {
    update('romana_id', id);
    onRomanaChange?.(id);
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
    setForm(initial);
  }

  return (
    <form onSubmit={submit}>
      <SectionCard
        title="Laboratorio / analisis"
        description="Registra muestra y resultado para avanzar o rechazar el camion."
        action={<button className="btn btn-primary" type="submit"><Save size={17} />Guardar analisis</button>}
      >
        {wet && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">Alerta: humedad sobre el valor configurado.</div>}
        {form.resultado === 'Rechazado' && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900">El registro quedara rechazado y no pasara a almacenamiento.</div>}

        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Camion pendiente">
            <select required value={form.romana_id} onChange={(e) => selectRomana(e.target.value)}>
              <option value="">Seleccionar</option>
              {options.map((row) => <option key={row.id} value={row.id}>{row.patente} - {row.proveedor_nombre} - {row.numero_guia_despacho}</option>)}
            </select>
          </Field>

          {romanaSeleccionada && (
            <div className="md:col-span-3 rounded-2xl border border-curimapu-green/20 bg-curimapu-light p-4 text-sm text-curimapu-dark">
              <strong>Datos de romana seleccionada</strong>
              <div className="mt-2 grid gap-2 sm:grid-cols-5">
                <p><b>Patente:</b><br />{romanaSeleccionada.patente}</p>
                <p><b>Chofer:</b><br />{romanaSeleccionada.chofer}</p>
                <p><b>Proveedor:</b><br />{romanaSeleccionada.proveedor_nombre || romanaSeleccionada.proveedor?.nombre}</p>
                <p><b>N guia:</b><br />{romanaSeleccionada.numero_guia_despacho}</p>
                <p><b>Peso:</b><br />{number(romanaSeleccionada.peso_entrada)} kg</p>
              </div>
            </div>
          )}

          <Field label="N lote recepcion"><input value={form.numero_lote} onChange={(e) => update('numero_lote', e.target.value)} /></Field>
          <Field label="Fecha muestreo"><input type="date" value={form.fecha_muestreo} onChange={(e) => update('fecha_muestreo', e.target.value)} /></Field>
          <Field label="Hora muestreo"><input type="time" value={form.hora_muestreo} onChange={(e) => update('hora_muestreo', e.target.value)} /></Field>
          <Field label="Fecha analisis"><input type="date" value={form.fecha_analisis} onChange={(e) => update('fecha_analisis', e.target.value)} /></Field>
          <Field label="Hora analisis"><input type="time" value={form.hora_analisis} onChange={(e) => update('hora_analisis', e.target.value)} /></Field>
          <Field label="Laboratorio ensayo"><input value={form.laboratorio_ensayo} onChange={(e) => update('laboratorio_ensayo', e.target.value)} /></Field>
          <Field label="N correlativo muestra"><input value={form.correlativo_muestra} onChange={(e) => update('correlativo_muestra', e.target.value)} /></Field>
          <Field label="Producto"><input value={form.producto} onChange={(e) => update('producto', e.target.value)} /></Field>
          <Field label="Resultado">
            <select value={form.resultado} onChange={(e) => update('resultado', e.target.value)}>
              <option>Aprobado</option>
              <option>Rechazado</option>
            </select>
          </Field>
          {numericFields.map(([field, label]) => (
            <Field key={field} label={label}><input type="number" step="0.01" value={form[field]} onChange={(e) => update(field, e.target.value)} /></Field>
          ))}
          <div className="md:col-span-2"><Field label="Otros"><textarea rows="2" value={form.otros} onChange={(e) => update('otros', e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Observaciones laboratorio"><textarea rows="2" value={form.observaciones_laboratorio} onChange={(e) => update('observaciones_laboratorio', e.target.value)} /></Field></div>
        </div>
      </SectionCard>
    </form>
  );
}

function Field({ label, children }) {
  return <div className="form-field"><label>{label}</label>{children}</div>;
}
