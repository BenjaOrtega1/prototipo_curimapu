import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';

const initial = {
  patente: '',
  chofer: '',
  rut_chofer: '',
  proveedor_nombre: '',
  rut_proveedor: '',
  guia_despacho: 'Guía despacho',
  numero_guia_despacho: '',
  peso_entrada: '',
  fecha_ingreso: new Date().toISOString().slice(0, 10),
  hora_ingreso: new Date().toTimeString().slice(0, 5),
  empresa_transporte: '',
  observaciones: '',
};

export default function RomanaForm({ value, onSubmit }) {
  const [form, setForm] = useState({ ...initial, ...value });
  const update = (field, next) => setForm((current) => ({ ...current, [field]: next }));

  useEffect(() => {
    setForm({ ...initial, ...value });
  }, [value]);

  function submit(event) {
    event.preventDefault();
    onSubmit({ ...form, estado: value?.estado || 'Pendiente de laboratorio' });
    setForm(initial);
  }

  return (
    <form className="panel rounded-md p-4" onSubmit={submit}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ingreso romana / pesaje</h2>
          <p className="text-sm text-slate-500">Primer punto del flujo real observado en planta.</p>
        </div>
        <button className="btn btn-primary" type="submit"><Save size={17} />Guardar ingreso</button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Patente *"><input required value={form.patente} onChange={(e) => update('patente', e.target.value.toUpperCase())} /></Field>
        <Field label="Chofer *"><input required value={form.chofer} onChange={(e) => update('chofer', e.target.value)} /></Field>
        <Field label="Proveedor *"><input required value={form.proveedor_nombre} onChange={(e) => update('proveedor_nombre', e.target.value)} /></Field>
        <Field label="Guía despacho *"><input required value={form.guia_despacho} onChange={(e) => update('guia_despacho', e.target.value)} /></Field>
        <Field label="N° guía despacho *"><input required value={form.numero_guia_despacho} onChange={(e) => update('numero_guia_despacho', e.target.value)} /></Field>
        <Field label="Peso entrada *"><input required type="number" value={form.peso_entrada} onChange={(e) => update('peso_entrada', e.target.value)} /></Field>
        <Field label="Fecha ingreso *"><input required type="date" value={form.fecha_ingreso} onChange={(e) => update('fecha_ingreso', e.target.value)} /></Field>
        <Field label="Hora ingreso *"><input required type="time" value={form.hora_ingreso} onChange={(e) => update('hora_ingreso', e.target.value)} /></Field>
        <Field label="RUT chofer"><input value={form.rut_chofer} onChange={(e) => update('rut_chofer', e.target.value)} /></Field>
        <Field label="RUT proveedor"><input value={form.rut_proveedor} onChange={(e) => update('rut_proveedor', e.target.value)} /></Field>
        <Field label="Empresa transporte"><input value={form.empresa_transporte} onChange={(e) => update('empresa_transporte', e.target.value)} /></Field>
        <div className="md:col-span-4">
          <Field label="Observaciones"><textarea rows="2" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} /></Field>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return <div className="space-y-1"><label>{label}</label>{children}</div>;
}
