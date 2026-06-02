import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { humedadAlerta } from '../utils/formatters';

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
  ['proteina', '% proteína'],
  ['gluten', '% gluten corregido al 14%'],
  ['gluten_index', 'Gluten index'],
  ['peso_hectolitro', 'Peso hectolitro'],
  ['falling_number', 'Falling number'],
  ['peso_1000_granos', 'Peso 1000 granos'],
  ['sedimentacion', 'Valor sedimentación'],
  ['impurezas', '% impurezas'],
  ['granos_partidos', '% granos partidos'],
  ['granos_quebrados_chupados', '% granos quebrados/chupados'],
  ['granos_danados', '% granos dañados'],
  ['granos_brotados', '% granos brotados'],
  ['hongos', '% hongos'],
];

export default function LaboratorioForm({ pendientes, value, selectedRomanaId, onSubmit }) {
  const [form, setForm] = useState({ ...initial, ...value, romana_id: selectedRomanaId || value?.romana_id || '' });

  useEffect(() => {
    setForm({ ...initial, ...value, romana_id: selectedRomanaId || value?.romana_id || '' });
  }, [value, selectedRomanaId]);

  const update = (field, next) => setForm((current) => ({ ...current, [field]: next }));
  const wet = Number(form.humedad || 0) > humedadAlerta;

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
    setForm(initial);
  }

  return (
    <form className="panel rounded-md p-4" onSubmit={submit}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Laboratorio / análisis</h2>
          <p className="text-sm text-slate-500">Registra muestra y resultado para avanzar o rechazar el camión.</p>
        </div>
        <button className="btn btn-primary" type="submit"><Save size={17} />Guardar análisis</button>
      </div>
      {wet && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">Alerta: humedad sobre el valor configurado.</div>}
      {form.resultado === 'Rechazado' && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900">El registro quedará rechazado y no pasará a almacenamiento.</div>}
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Camión pendiente">
          <select required value={form.romana_id} onChange={(e) => update('romana_id', e.target.value)}>
            <option value="">Seleccionar</option>
            {pendientes.map((row) => <option key={row.id} value={row.id}>{row.patente} · {row.proveedor_nombre} · {row.numero_guia_despacho}</option>)}
          </select>
        </Field>
        <Field label="N° lote recepción"><input value={form.numero_lote} onChange={(e) => update('numero_lote', e.target.value)} /></Field>
        <Field label="Fecha muestreo"><input type="date" value={form.fecha_muestreo} onChange={(e) => update('fecha_muestreo', e.target.value)} /></Field>
        <Field label="Hora muestreo"><input type="time" value={form.hora_muestreo} onChange={(e) => update('hora_muestreo', e.target.value)} /></Field>
        <Field label="Fecha análisis"><input type="date" value={form.fecha_analisis} onChange={(e) => update('fecha_analisis', e.target.value)} /></Field>
        <Field label="Hora análisis"><input type="time" value={form.hora_analisis} onChange={(e) => update('hora_analisis', e.target.value)} /></Field>
        <Field label="Laboratorio ensayo"><input value={form.laboratorio_ensayo} onChange={(e) => update('laboratorio_ensayo', e.target.value)} /></Field>
        <Field label="N° correlativo muestra"><input value={form.correlativo_muestra} onChange={(e) => update('correlativo_muestra', e.target.value)} /></Field>
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
    </form>
  );
}

function Field({ label, children }) {
  return <div className="space-y-1"><label>{label}</label>{children}</div>;
}
