import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { flujoEtapas } from '../data/mockData';

const initial = {
  proveedor_id: '',
  nombre: '',
  rut: '',
  celular: '',
  email: '',
  direccion: '',
  ciudad: '',
  comuna: '',
  predio_origen: '',
  guia_despacho: '',
  producto: 'Trigo panadero',
  fecha_recepcion: new Date().toISOString().slice(0, 10),
  hora_recepcion: new Date().toTimeString().slice(0, 5),
  peso_bruto: '',
  tara: '',
  kilos_netos: '',
  patente_camion: '',
  patente_carro: '',
  empresa_transporte: '',
  nombre_chofer: '',
  rut_chofer: '',
  estado: 'Pendiente',
  etapa_actual: flujoEtapas[0],
  observaciones: '',
};

export default function RecepcionForm({ proveedores, value, onSubmit }) {
  const [form, setForm] = useState({ ...initial, ...value });

  useEffect(() => {
    setForm({ ...initial, ...value });
  }, [value]);

  const kilosNetos = useMemo(() => {
    const neto = Number(form.peso_bruto || 0) - Number(form.tara || 0);
    return neto > 0 ? neto : '';
  }, [form.peso_bruto, form.tara]);

  function update(field, nextValue) {
    setForm((current) => ({ ...current, [field]: nextValue }));
  }

  function selectProveedor(id) {
    const proveedor = proveedores.find((item) => item.id === id);
    setForm((current) => ({
      ...current,
      proveedor_id: id,
      nombre: proveedor?.nombre || '',
      rut: proveedor?.rut || '',
      celular: proveedor?.celular || '',
      email: proveedor?.email || '',
      direccion: proveedor?.direccion || '',
      ciudad: proveedor?.ciudad || '',
      comuna: proveedor?.comuna || '',
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...form, kilos_netos: kilosNetos || form.kilos_netos });
  }

  return (
    <form className="panel rounded-md p-4" onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Registro de recepción</h2>
          <p className="text-sm text-slate-500">Datos del proveedor, camión, guía y pesaje.</p>
        </div>
        <button className="btn btn-primary" type="submit">
          <Save size={17} />
          Guardar recepción
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Proveedor existente">
          <select value={form.proveedor_id} onChange={(event) => selectProveedor(event.target.value)}>
            <option value="">Crear o seleccionar</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nombre proveedor"><input value={form.nombre} onChange={(e) => update('nombre', e.target.value)} /></Field>
        <Field label="RUT proveedor"><input value={form.rut} onChange={(e) => update('rut', e.target.value)} /></Field>
        <Field label="Celular"><input value={form.celular} onChange={(e) => update('celular', e.target.value)} /></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></Field>
        <Field label="Dirección"><input value={form.direccion} onChange={(e) => update('direccion', e.target.value)} /></Field>
        <Field label="Ciudad"><input value={form.ciudad} onChange={(e) => update('ciudad', e.target.value)} /></Field>
        <Field label="Comuna"><input value={form.comuna} onChange={(e) => update('comuna', e.target.value)} /></Field>
        <Field label="Predio de origen"><input value={form.predio_origen} onChange={(e) => update('predio_origen', e.target.value)} /></Field>
        <Field label="N° guía despacho o factura"><input value={form.guia_despacho} onChange={(e) => update('guia_despacho', e.target.value)} /></Field>
        <Field label="Producto"><input value={form.producto} onChange={(e) => update('producto', e.target.value)} /></Field>
        <Field label="Fecha recepción"><input type="date" value={form.fecha_recepcion} onChange={(e) => update('fecha_recepcion', e.target.value)} /></Field>
        <Field label="Hora recepción"><input type="time" value={form.hora_recepcion} onChange={(e) => update('hora_recepcion', e.target.value)} /></Field>
        <Field label="Peso bruto camión"><input type="number" value={form.peso_bruto} onChange={(e) => update('peso_bruto', e.target.value)} /></Field>
        <Field label="Tara camión"><input type="number" value={form.tara} onChange={(e) => update('tara', e.target.value)} /></Field>
        <Field label="Kilos netos recibidos"><input readOnly value={kilosNetos || form.kilos_netos || ''} /></Field>
        <Field label="Patente camión"><input value={form.patente_camion} onChange={(e) => update('patente_camion', e.target.value.toUpperCase())} /></Field>
        <Field label="Patente carro"><input value={form.patente_carro} onChange={(e) => update('patente_carro', e.target.value.toUpperCase())} /></Field>
        <Field label="Empresa transporte"><input value={form.empresa_transporte} onChange={(e) => update('empresa_transporte', e.target.value)} /></Field>
        <Field label="Nombre chofer"><input value={form.nombre_chofer} onChange={(e) => update('nombre_chofer', e.target.value)} /></Field>
        <Field label="RUT chofer"><input value={form.rut_chofer} onChange={(e) => update('rut_chofer', e.target.value)} /></Field>
        <Field label="Estado">
          <select value={form.estado} onChange={(e) => update('estado', e.target.value)}>
            <option>Pendiente</option>
            <option>Aprobado</option>
            <option>Rechazado</option>
          </select>
        </Field>
        <Field label="Etapa actual">
          <select value={form.etapa_actual} onChange={(e) => update('etapa_actual', e.target.value)}>
            {flujoEtapas.map((etapa) => <option key={etapa}>{etapa}</option>)}
          </select>
        </Field>
        <div className="md:col-span-3">
          <Field label="Observaciones">
            <textarea rows="3" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} />
          </Field>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label>{label}</label>
      {children}
    </div>
  );
}
