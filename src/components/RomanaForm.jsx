import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Input from './Input.jsx';
import SectionCard from './SectionCard.jsx';

const initial = {
  patente: '',
  chofer: '',
  rut_chofer: '',
  proveedor_nombre: '',
  rut_proveedor: '',
  guia_despacho: 'Guia despacho',
  numero_guia_despacho: '',
  peso_entrada: '',
  fecha_ingreso: new Date().toISOString().slice(0, 10),
  hora_ingreso: new Date().toTimeString().slice(0, 5),
  empresa_transporte: '',
  observaciones: '',
};

export default function RomanaForm({ value, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...initial, ...value });

  useEffect(() => {
    setForm({ ...initial, ...value });
  }, [value]);

  const update = (field, next) => setForm((current) => ({ ...current, [field]: next }));

  function submit(event) {
    event.preventDefault();
    onSubmit({ ...form, estado: value?.estado || 'Pendiente de laboratorio' });
    setForm(initial);
  }

  function cancel() {
    setForm(initial);
    onCancel?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <SectionCard
        title="Nuevo ingreso de romana"
        description="Registra rapidamente los datos basicos del camion al llegar a planta."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary" type="button" onClick={cancel}><X size={17} />Cancelar</button>
            <button className="btn btn-primary" type="submit"><Save size={17} />Guardar ingreso</button>
          </div>
        }
      >
        <div className="space-y-5">
          <FormGroup title="Datos del camion">
            <Input label="Patente" required>
              <input required value={form.patente} onChange={(e) => update('patente', e.target.value.toUpperCase())} placeholder="ABCD12" />
            </Input>
            <Input label="Chofer" required>
              <input required value={form.chofer} onChange={(e) => update('chofer', e.target.value)} placeholder="Nombre del conductor" />
            </Input>
            <Input label="RUT chofer">
              <input value={form.rut_chofer} onChange={(e) => update('rut_chofer', e.target.value)} placeholder="12.345.678-9" />
            </Input>
            <Input label="Empresa transporte">
              <input value={form.empresa_transporte} onChange={(e) => update('empresa_transporte', e.target.value)} placeholder="Transportes..." />
            </Input>
          </FormGroup>

          <FormGroup title="Datos del proveedor">
            <Input label="Proveedor" required className="md:col-span-2">
              <input required value={form.proveedor_nombre} onChange={(e) => update('proveedor_nombre', e.target.value)} placeholder="Nombre proveedor" />
            </Input>
            <Input label="RUT proveedor">
              <input value={form.rut_proveedor} onChange={(e) => update('rut_proveedor', e.target.value)} placeholder="76.000.000-0" />
            </Input>
          </FormGroup>

          <FormGroup title="Documentacion y pesaje">
            <Input label="Guia despacho" required>
              <input required value={form.guia_despacho} onChange={(e) => update('guia_despacho', e.target.value)} />
            </Input>
            <Input label="N guia despacho" required>
              <input required value={form.numero_guia_despacho} onChange={(e) => update('numero_guia_despacho', e.target.value)} placeholder="GD-10087" />
            </Input>
            <Input label="Peso entrada" required>
              <input required type="number" value={form.peso_entrada} onChange={(e) => update('peso_entrada', e.target.value)} placeholder="0" />
            </Input>
            <Input label="Fecha ingreso" required>
              <input required type="date" value={form.fecha_ingreso} onChange={(e) => update('fecha_ingreso', e.target.value)} />
            </Input>
            <Input label="Hora ingreso" required>
              <input required type="time" value={form.hora_ingreso} onChange={(e) => update('hora_ingreso', e.target.value)} />
            </Input>
          </FormGroup>

          <FormGroup title="Observaciones">
            <Input label="Notas operativas" className="md:col-span-4">
              <textarea rows="3" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} placeholder="Condicion del camion, comentarios de ingreso, instrucciones..." />
            </Input>
          </FormGroup>
        </div>
      </SectionCard>
    </form>
  );
}

function FormGroup({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-curimapu-green">{title}</h3>
      <div className="grid gap-4 md:grid-cols-4">{children}</div>
    </div>
  );
}
