import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from '../components/Logo.jsx';
import { getConfiguracion, saveConfiguracion } from '../services/configuracionService';

export default function Configuracion() {
  const [form, setForm] = useState(null);

  useEffect(() => {
    getConfiguracion().then(setForm);
  }, []);

  if (!form) return <div className="panel rounded-md p-6 text-sm text-slate-600">Cargando configuración...</div>;

  const update = (field, next) => setForm((current) => ({ ...current, [field]: next }));

  async function submit(event) {
    event.preventDefault();
    await saveConfiguracion(form);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Configuración</h1>
        <p className="text-sm text-slate-600">Parámetros visuales, humedad de alerta y preparación para Supabase.</p>
      </div>

      <section className="panel rounded-md p-4">
        <Logo size="lg" />
        <p className="mt-3 text-sm text-slate-500">Reemplaza `src/assets/logo-curimapu.png` por el PNG real de la empresa.</p>
      </section>

      <form className="panel rounded-md p-4" onSubmit={submit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Datos del sistema</h2>
          <button className="btn btn-primary" type="submit"><Save size={17} />Guardar</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nombre empresa"><input value={form.nombre_empresa || ''} onChange={(e) => update('nombre_empresa', e.target.value)} /></Field>
          <Field label="Humedad alerta"><input type="number" step="0.1" value={form.humedad_alerta || ''} onChange={(e) => update('humedad_alerta', e.target.value)} /></Field>
          <Field label="Logo URL Supabase Storage"><input value={form.logo_url || ''} onChange={(e) => update('logo_url', e.target.value)} /></Field>
          <Field label="Color principal"><input type="color" value={form.color_principal || '#2f6b3f'} onChange={(e) => update('color_principal', e.target.value)} /></Field>
          <Field label="Color secundario"><input type="color" value={form.color_secundario || '#1f3d2b'} onChange={(e) => update('color_secundario', e.target.value)} /></Field>
        </div>
      </form>

      <section className="panel rounded-md p-4">
        <h2 className="text-lg font-bold text-slate-900">Variables `.env`</h2>
        <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-100">{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_HUMEDAD_ALERTA=15.0`}</pre>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="space-y-1"><label>{label}</label>{children}</div>;
}
