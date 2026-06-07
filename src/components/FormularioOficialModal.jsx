import { AlertTriangle, Download, Eye, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatCorrelativo, getNextCorrelativo, saveDocumentoMetadata } from '../services/documentoService';
import { buildFormularioData, crearUrlFormulario } from '../utils/generarFormularioCurimapu';
import FormularioPreview from './FormularioPreview.jsx';
import HistorialFormularios from './HistorialFormularios.jsx';

const groups = [
  ['Datos proveedor', [
    ['proveedor_nombre', 'Nombre proveedor'],
    ['proveedor_rut', 'RUT'],
    ['proveedor_celular', 'Celular'],
    ['proveedor_mail', 'Mail'],
    ['proveedor_direccion', 'Direccion'],
    ['proveedor_ciudad', 'Ciudad'],
    ['proveedor_comuna', 'Comuna'],
    ['predio_origen', 'Predio de origen'],
  ]],
  ['Datos recepcion', [
    ['numero_guia_despacho', 'N guia despacho'],
    ['producto', 'Nombre/tipo producto'],
    ['fecha_recepcion', 'Fecha recepcion'],
    ['hora_recepcion', 'Hora recepcion'],
    ['peso_bruto', 'Peso bruto camion'],
    ['tara', 'Tara camion'],
    ['kilos_netos', 'Total kilos netos recibidos'],
    ['patente_camion', 'Patente camion'],
    ['patente_carro', 'Patente carro'],
    ['empresa_transporte', 'Empresa transporte'],
    ['nombre_chofer', 'Nombre chofer'],
    ['rut_chofer', 'RUT chofer'],
  ]],
  ['Datos laboratorio', [
    ['numero_lote', 'N lote recepcion'],
    ['fecha_muestreo', 'Fecha muestreo'],
    ['hora_muestreo', 'Hora muestreo'],
    ['laboratorio_ensayo', 'Laboratorio ensayo'],
    ['correlativo_muestra', 'N correlativo muestra/contramuestra'],
    ['fecha_analisis', 'Fecha analisis'],
    ['hora_analisis', 'Hora analisis'],
    ['destino', 'Destino'],
    ['silo_bodega', 'Silo/Bodega N'],
    ['laboratorio_arbitrador', 'Nombre laboratorio arbitrador'],
  ]],
  ['Resultados analisis', [
    ['humedad', 'Humedad'],
    ['proteina', 'Proteina'],
    ['gluten', 'Gluten corregido al 14%'],
    ['gluten_index', 'Gluten index'],
    ['peso_hectolitro', 'Peso hectolitro'],
    ['falling_number', 'Falling number'],
    ['peso_1000_granos', 'Peso 1000 granos'],
    ['sedimentacion', 'Sedimentacion'],
    ['impurezas', 'Impurezas'],
    ['granos_partidos', 'Granos partidos'],
    ['granos_quebrados_chupados', 'Granos quebrados/chupados'],
    ['granos_danados_calor', 'Granos danados por calor'],
    ['granos_helados', 'Granos helados/verdes/inmaduros'],
    ['granos_brotados', 'Granos brotados'],
    ['punta_negra', 'Punta negra'],
    ['hongos', 'Hongos'],
    ['otros', 'Otros'],
  ]],
  ['Costos', [
    ['tarifa_secado', 'Tarifa secado'],
    ['limpieza', 'Limpieza'],
    ['analisis_laboratorio', 'Analisis laboratorio'],
    ['precio_referencial', 'Precio referencial'],
  ]],
  ['Firmas', [
    ['firma_representante', 'Representante empresa'],
    ['firma_analista', 'Analista laboratorio'],
    ['firma_encargado', 'Encargado laboratorio'],
    ['firma_recibido', 'Recibido cliente/chofer/representante'],
  ]],
];

const importantFields = ['proveedor_rut', 'proveedor_celular', 'proveedor_mail', 'proveedor_direccion', 'proveedor_comuna', 'tara', 'patente_carro', 'silo_bodega', 'tarifa_secado', 'limpieza', 'analisis_laboratorio', 'precio_referencial'];

export default function FormularioOficialModal({ recepcion, open, onClose }) {
  const [datos, setDatos] = useState({});
  const [numero, setNumero] = useState('');
  const [preview, setPreview] = useState(false);
  const [highlightMissing, setHighlightMissing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      if (!open || !recepcion) return;
      setDatos(buildFormularioData(recepcion));
      setPreview(false);
      setError('');
      setHighlightMissing(false);
      const correlativo = await getNextCorrelativo();
      setNumero(formatCorrelativo(correlativo));
    }
    init();
  }, [open, recepcion]);

  const missing = useMemo(() => importantFields.filter((field) => !datos[field]), [datos]);

  if (!open) return null;

  function update(field, value) {
    setDatos((current) => ({ ...current, [field]: value }));
  }

  async function generate() {
    if (!datos.romana_id) {
      setError('Debe existir una romana asociada para generar el formulario.');
      return;
    }
    if (!datos.patente_camion && !datos.proveedor_nombre) {
      setError('Debe existir patente o proveedor para identificar la recepcion.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const correlativo = await getNextCorrelativo();
      const numeroFormateado = formatCorrelativo(correlativo);
      const { doc } = await crearUrlFormulario({ datos, numero: numeroFormateado });
      const fecha = new Date().toISOString().slice(0, 10);
      const filename = `formulario_curimapu_${numeroFormateado}_${datos.patente_camion || 'recepcion'}_${fecha}.pdf`;
      doc.save(filename);
      await saveDocumentoMetadata({
        romana_id: datos.romana_id,
        laboratorio_id: datos.laboratorio_id || null,
        almacenamiento_id: datos.almacenamiento_id || null,
        correlativo,
        numero_formateado: numeroFormateado,
        nombre_archivo: filename,
        fecha_generacion: new Date().toISOString(),
        proveedor: datos.proveedor_nombre,
        patente: datos.patente_camion,
        producto: datos.producto,
        resultado_laboratorio: datos.resultado_laboratorio,
        observaciones: datos.observaciones,
      });
      onClose();
    } catch (generateError) {
      setError(generateError.message.includes('jspdf')
        ? 'No se pudo cargar jsPDF. Ejecuta npm install jspdf jspdf-autotable y vuelve a intentar.'
        : generateError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
          <div>
            <h2 className="text-xl font-black text-curimapu-dark">Preparar Formulario Oficial</h2>
            <p className="text-sm text-slate-500">Formulario Oficial Curimapu N {numero}</p>
          </div>
          <button className="btn btn-secondary px-2" type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="overflow-auto p-4">
          {missing.length > 0 && (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                <span>Hay datos faltantes. Puedes completarlos antes de generar el formulario.</span>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => setHighlightMissing(true)}>Completar datos faltantes</button>
            </div>
          )}

          {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">{error}</div>}

          {preview ? (
            <FormularioPreview datos={datos} numero={numero} />
          ) : (
            <div className="space-y-5">
              <HistorialFormularios romanaId={datos.romana_id} onRegenerar={() => setPreview(false)} />
              {groups.map(([title, fields]) => (
                <section key={title} className="section-card">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-curimapu-green">{title}</h3>
                  <div className="grid gap-3 md:grid-cols-4">
                    {fields.map(([field, label]) => (
                      <div key={field} className="form-field">
                        <label>{label}</label>
                        <input
                          className={highlightMissing && importantFields.includes(field) && !datos[field] ? 'border-amber-400 bg-amber-50' : ''}
                          value={datos[field] || ''}
                          onChange={(event) => update(field, event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              <section className="section-card">
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-curimapu-green">Observaciones</h3>
                <textarea rows="6" value={datos.observaciones || ''} onChange={(event) => update('observaciones', event.target.value)} />
              </section>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white p-4">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn btn-secondary" type="button" onClick={() => setPreview((current) => !current)}>
            <Eye size={17} />
            {preview ? 'Editar datos' : 'Vista previa'}
          </button>
          <button className="btn btn-primary" type="button" disabled={loading} onClick={generate}>
            <Download size={17} />
            {loading ? 'Generando...' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
