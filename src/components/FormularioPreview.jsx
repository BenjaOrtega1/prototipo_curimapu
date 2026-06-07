import { safe } from '../utils/generarFormularioCurimapu';

export default function FormularioPreview({ datos, numero }) {
  const proveedor = [
    ['Nombre proveedor', datos.proveedor_nombre],
    ['RUT', datos.proveedor_rut],
    ['Celular', datos.proveedor_celular],
    ['Mail', datos.proveedor_mail],
    ['Direccion', datos.proveedor_direccion],
    ['Ciudad', datos.proveedor_ciudad],
    ['Comuna', datos.proveedor_comuna],
    ['Predio de origen', datos.predio_origen],
  ];

  const recepcion = [
    ['N guia despacho', datos.numero_guia_despacho],
    ['Producto', datos.producto],
    ['Fecha recepcion', datos.fecha_recepcion],
    ['Hora recepcion', datos.hora_recepcion],
    ['Peso bruto', datos.peso_bruto],
    ['Tara', datos.tara],
    ['Kilos netos', datos.kilos_netos],
    ['Patente camion', datos.patente_camion],
    ['Patente carro', datos.patente_carro],
    ['Empresa transporte', datos.empresa_transporte],
    ['Chofer', datos.nombre_chofer],
    ['RUT chofer', datos.rut_chofer],
  ];

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 text-sm text-slate-900 shadow-sm">
      <div className="border-2 border-curimapu-dark">
        <div className="flex items-start justify-between bg-curimapu-light p-4">
          <div>
            <h2 className="text-2xl font-black text-curimapu-dark">CURIMAPU</h2>
            <p className="font-bold">Guia de Recepcion / Resultados de Analisis / Formulario Contramuestras</p>
          </div>
          <p className="text-lg font-black">N {numero}</p>
        </div>
        <PreviewSection title="Proveedor" rows={proveedor} />
        <PreviewSection title="Recepcion" rows={recepcion} />
        <PreviewSection title="Laboratorio" rows={[
          ['N lote', datos.numero_lote],
          ['Fecha muestreo', datos.fecha_muestreo],
          ['Hora muestreo', datos.hora_muestreo],
          ['Laboratorio ensayo', datos.laboratorio_ensayo],
          ['Correlativo muestra', datos.correlativo_muestra],
          ['Fecha analisis', datos.fecha_analisis],
          ['Hora analisis', datos.hora_analisis],
          ['Destino', datos.destino],
          ['Silo/Bodega', datos.silo_bodega],
          ['Laboratorio arbitrador', datos.laboratorio_arbitrador],
        ]} />
        <PreviewSection title="Resultados" rows={[
          ['Humedad', datos.humedad],
          ['Proteina', datos.proteina],
          ['Gluten', datos.gluten],
          ['Gluten index', datos.gluten_index],
          ['Peso hectolitro', datos.peso_hectolitro],
          ['Falling number', datos.falling_number],
          ['Peso 1000 granos', datos.peso_1000_granos],
          ['Sedimentacion', datos.sedimentacion],
          ['Impurezas', datos.impurezas],
          ['Granos partidos', datos.granos_partidos],
          ['Quebrados/chupados', datos.granos_quebrados_chupados],
          ['Danados calor', datos.granos_danados_calor],
          ['Helados/verdes/inmaduros', datos.granos_helados],
          ['Brotados', datos.granos_brotados],
          ['Punta negra', datos.punta_negra],
          ['Hongos', datos.hongos],
          ['Otros', datos.otros],
        ]} />
        <div className="border-t border-curimapu-dark p-3">
          <h3 className="font-black uppercase text-curimapu-dark">Observaciones</h3>
          <div className="mt-2 min-h-20 whitespace-pre-wrap border border-slate-300 p-3">{safe(datos.observaciones)}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 border-t border-curimapu-dark p-3 text-center text-xs font-bold">
          {['Representante Empresa', 'Analista Laboratorio', 'Encargado Laboratorio', 'Recibido Cliente / Chofer'].map((label) => (
            <div key={label} className="min-h-20 border border-slate-300 p-2">
              <div className="mt-8 border-t border-slate-500 pt-2">V B<br />{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ title, rows }) {
  return (
    <div className="border-t border-curimapu-dark">
      <h3 className="bg-curimapu-light px-3 py-2 font-black uppercase text-curimapu-dark">{title}</h3>
      <div className="grid grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-2 border-t border-slate-200">
            <div className="bg-slate-50 px-3 py-2 font-bold">{label}</div>
            <div className="px-3 py-2">{safe(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
