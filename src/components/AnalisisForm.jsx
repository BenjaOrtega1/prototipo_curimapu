import { FlaskConical, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

const initial = {
  numero_lote: '',
  fecha_muestreo: new Date().toISOString().slice(0, 10),
  hora_muestreo: new Date().toTimeString().slice(0, 5),
  laboratorio: 'Laboratorio Curimapu Chillan',
  correlativo_muestra: '',
  fecha_analisis: new Date().toISOString().slice(0, 10),
  hora_analisis: new Date().toTimeString().slice(0, 5),
  destino: 'Silo',
  silo_bodega: '',
  laboratorio_arbitrador: '',
  valor_traslado_contramuestra: '',
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
  granos_agregados: '',
  granos_danados_calor: '',
  granos_helados_verdes_inmaduros: '',
  granos_brotados: '',
  granos_punta_negra: '',
  hongos: '',
  otros: '',
  tarifa_secado: '',
  limpieza: '',
  analisis_laboratorio: '',
  precio_referencial: '',
  vb_empresa: '',
  vb_analista: '',
  vb_encargado: '',
  vb_recibido: '',
};

const analysisFields = [
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
  ['granos_quebrados_chupados', '% partidos, quebrados y chupados'],
  ['granos_agregados', '% granos agregados'],
  ['granos_danados_calor', '% dañados por calor'],
  ['granos_helados_verdes_inmaduros', '% helados, verdes e inmaduros'],
  ['granos_brotados', '% brotados'],
  ['granos_punta_negra', '% punta negra'],
  ['hongos', '% hongos'],
];

export default function AnalisisForm({ value, recepcionId, onSubmit }) {
  const [form, setForm] = useState({ ...initial, ...value });

  useEffect(() => {
    setForm({ ...initial, ...value });
  }, [value]);

  function update(field, nextValue) {
    setForm((current) => ({ ...current, [field]: nextValue }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...form, recepcion_id: recepcionId });
  }

  return (
    <form className="panel rounded-md p-4" onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <FlaskConical size={20} />
            Registro de muestra y análisis
          </h2>
          <p className="text-sm text-slate-500">Datos de muestreo, laboratorio, calidad, costos y vistos buenos.</p>
        </div>
        <button className="btn btn-primary" type="submit">
          <Save size={17} />
          Guardar análisis
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="N° lote recepción"><input value={form.numero_lote} onChange={(e) => update('numero_lote', e.target.value)} /></Field>
        <Field label="Fecha muestreo"><input type="date" value={form.fecha_muestreo} onChange={(e) => update('fecha_muestreo', e.target.value)} /></Field>
        <Field label="Hora muestreo"><input type="time" value={form.hora_muestreo} onChange={(e) => update('hora_muestreo', e.target.value)} /></Field>
        <Field label="Laboratorio ensayo"><input value={form.laboratorio} onChange={(e) => update('laboratorio', e.target.value)} /></Field>
        <Field label="Correlativo muestra/contramuestra"><input value={form.correlativo_muestra} onChange={(e) => update('correlativo_muestra', e.target.value)} /></Field>
        <Field label="Fecha análisis"><input type="date" value={form.fecha_analisis} onChange={(e) => update('fecha_analisis', e.target.value)} /></Field>
        <Field label="Hora análisis"><input type="time" value={form.hora_analisis} onChange={(e) => update('hora_analisis', e.target.value)} /></Field>
        <Field label="Destino">
          <select value={form.destino} onChange={(e) => update('destino', e.target.value)}>
            <option>Silo</option>
            <option>Bodega</option>
            <option>Venta</option>
            <option>Guarda</option>
            <option>Secador</option>
            <option>Rechazo</option>
          </select>
        </Field>
        <Field label="Silo o bodega N°"><input value={form.silo_bodega} onChange={(e) => update('silo_bodega', e.target.value)} /></Field>
        <Field label="Laboratorio arbitrador"><input value={form.laboratorio_arbitrador} onChange={(e) => update('laboratorio_arbitrador', e.target.value)} /></Field>
        <Field label="Valor análisis/traslado contramuestra"><input type="number" value={form.valor_traslado_contramuestra} onChange={(e) => update('valor_traslado_contramuestra', e.target.value)} /></Field>
      </div>

      <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-curimapu-green">Datos de análisis</h3>
      <div className="grid gap-4 md:grid-cols-4">
        {analysisFields.map(([field, label]) => (
          <Field key={field} label={label}>
            <input type="number" step="0.01" value={form[field]} onChange={(e) => update(field, e.target.value)} />
          </Field>
        ))}
        <div className="md:col-span-4">
          <Field label="Otros"><textarea rows="2" value={form.otros} onChange={(e) => update('otros', e.target.value)} /></Field>
        </div>
      </div>

      <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-curimapu-green">Costos y vistos buenos</h3>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Tarifa secado $/kg"><input type="number" value={form.tarifa_secado} onChange={(e) => update('tarifa_secado', e.target.value)} /></Field>
        <Field label="Limpieza $/kg"><input type="number" value={form.limpieza} onChange={(e) => update('limpieza', e.target.value)} /></Field>
        <Field label="Análisis laboratorio $/kg"><input type="number" value={form.analisis_laboratorio} onChange={(e) => update('analisis_laboratorio', e.target.value)} /></Field>
        <Field label="Precio referencial"><input type="number" value={form.precio_referencial} onChange={(e) => update('precio_referencial', e.target.value)} /></Field>
        <Field label="V°B° representante empresa"><input value={form.vb_empresa} onChange={(e) => update('vb_empresa', e.target.value)} /></Field>
        <Field label="V°B° analista laboratorio"><input value={form.vb_analista} onChange={(e) => update('vb_analista', e.target.value)} /></Field>
        <Field label="V°B° encargado laboratorio"><input value={form.vb_encargado} onChange={(e) => update('vb_encargado', e.target.value)} /></Field>
        <Field label="V°B° recibido cliente/chofer"><input value={form.vb_recibido} onChange={(e) => update('vb_recibido', e.target.value)} /></Field>
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
