import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';

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

export default function AlmacenamientoForm({ aprobados, value, onSubmit }) {
  const [form, setForm] = useState({ ...initial, ...value });

  useEffect(() => {
    setForm({ ...initial, ...value });
  }, [value]);

  function selectRecepcion(id) {
    const record = aprobados.find((item) => item.id === id);
    setForm((current) => ({ ...current, romana_id: id, laboratorio_id: record?.laboratorio?.id || '' }));
  }

  const update = (field, next) => setForm((current) => ({ ...current, [field]: next }));

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
    setForm(initial);
  }

  return (
    <form className="panel rounded-md p-4" onSubmit={submit}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ingreso a almacenamiento</h2>
          <p className="text-sm text-slate-500">Asigna destino, silo o bodega a registros aprobados.</p>
        </div>
        <button className="btn btn-primary" type="submit"><Save size={17} />Guardar almacenamiento</button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Recepción asociada">
          <select required value={form.romana_id} onChange={(e) => selectRecepcion(e.target.value)}>
            <option value="">Seleccionar</option>
            {aprobados.map((row) => <option key={row.id} value={row.id}>{row.patente} · {row.proveedor_nombre} · {row.laboratorio?.producto}</option>)}
          </select>
        </Field>
        <Field label="Destino">
          <select value={form.destino} onChange={(e) => update('destino', e.target.value)}>
            <option>almacenamiento</option>
            <option>venta</option>
            <option>guarda</option>
          </select>
        </Field>
        <Field label="Silo o bodega N°"><input required value={form.silo_bodega} onChange={(e) => update('silo_bodega', e.target.value)} /></Field>
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
    </form>
  );
}

function Field({ label, children }) {
  return <div className="space-y-1"><label>{label}</label>{children}</div>;
}
