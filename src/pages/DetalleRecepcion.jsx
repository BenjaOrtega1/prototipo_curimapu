import { ArrowLeft, FileSpreadsheet, ImageDown, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FlujoRecepcion from '../components/FlujoRecepcion.jsx';
import { getRecepcion } from '../services/recepcionService';
import { downloadNodeAsPng, exportExcel } from '../utils/exporters';
import { humedadAlerta, number, statusLabel } from '../utils/formatters';

export default function DetalleRecepcion() {
  const { id } = useParams();
  const [recepcion, setRecepcion] = useState(null);
  const captureRef = useRef(null);

  useEffect(() => {
    getRecepcion(id).then(setRecepcion);
  }, [id]);

  if (!recepcion) {
    return <div className="panel rounded-md p-6 text-sm text-slate-600">Cargando detalle...</div>;
  }

  const analisis = recepcion.analisis?.[0] || {};
  const proveedor = recepcion.proveedores || {};
  const wet = Number(analisis.humedad || 0) > humedadAlerta;

  const exportRow = [{
    proveedor: proveedor.nombre,
    rut: proveedor.rut,
    producto: recepcion.producto,
    guia: recepcion.guia_despacho,
    fecha: recepcion.fecha_recepcion,
    kilos_netos: recepcion.kilos_netos,
    humedad: analisis.humedad,
    impurezas: analisis.impurezas,
    granos_partidos: analisis.granos_partidos,
    estado: statusLabel(recepcion),
  }];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-curimapu-green" to="/planilla"><ArrowLeft size={16} />Volver</Link>
          <h1 className="text-2xl font-bold text-slate-950">Ficha digital de recepción</h1>
          <p className="text-sm text-slate-600">{proveedor.nombre} · {recepcion.producto} · {recepcion.guia_despacho}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-secondary" to={`/nueva?id=${recepcion.id}`}><Pencil size={17} />Editar</Link>
          <button className="btn btn-secondary" onClick={() => exportExcel(exportRow, `recepcion_${recepcion.guia_despacho || recepcion.id}.xlsx`)}><FileSpreadsheet size={17} />Excel</button>
          <button className="btn btn-primary" onClick={() => downloadNodeAsPng(captureRef.current, `recepcion_${recepcion.guia_despacho || recepcion.id}.png`)}><ImageDown size={17} />PNG</button>
        </div>
      </div>

      <section ref={captureRef} className="panel rounded-md p-5">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-curimapu-green">Curimapu Chillán</p>
            <h2 className="text-xl font-bold text-slate-950">Resumen de recepción y análisis</h2>
            <p className="text-sm text-slate-500">Folio {analisis.correlativo_muestra || recepcion.id}</p>
          </div>
          <span className={`rounded-md px-3 py-2 text-sm font-bold ${recepcion.estado === 'Rechazado' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{statusLabel(recepcion)}</span>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Info title="Proveedor" items={[
            ['Nombre', proveedor.nombre],
            ['RUT', proveedor.rut],
            ['Celular', proveedor.celular],
            ['Email', proveedor.email],
            ['Predio', recepcion.predio_origen],
          ]} />
          <Info title="Camión y pesaje" items={[
            ['Fecha/hora', `${recepcion.fecha_recepcion} ${recepcion.hora_recepcion}`],
            ['Guía', recepcion.guia_despacho],
            ['Patente camión', recepcion.patente_camion],
            ['Chofer', recepcion.nombre_chofer],
            ['Kilos netos', `${number(recepcion.kilos_netos)} kg`],
          ]} />
          <Info title="Laboratorio" items={[
            ['Lote', analisis.numero_lote],
            ['Muestreo', `${analisis.fecha_muestreo || ''} ${analisis.hora_muestreo || ''}`],
            ['Análisis', `${analisis.fecha_analisis || ''} ${analisis.hora_analisis || ''}`],
            ['Destino', analisis.destino],
            ['Silo/Bodega', analisis.silo_bodega],
          ]} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="% humedad" value={number(analisis.humedad, 1)} alert={wet} />
          <Metric label="% proteína" value={number(analisis.proteina, 1)} />
          <Metric label="% impurezas" value={number(analisis.impurezas, 1)} />
          <Metric label="% granos partidos" value={number(analisis.granos_partidos, 1)} />
          <Metric label="Peso hectolitro" value={number(analisis.peso_hectolitro, 1)} />
        </div>

        <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
          <b>Observaciones:</b> {recepcion.observaciones || analisis.otros || 'Sin observaciones registradas.'}
        </div>
      </section>

      <FlujoRecepcion etapaActual={recepcion.etapa_actual} />
    </div>
  );
}

function Info({ title, items }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-curimapu-green">{title}</h3>
      <dl className="space-y-2 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-1">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-semibold text-slate-900">{value || '-'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Metric({ label, value, alert }) {
  return (
    <div className={`rounded-md border p-3 ${alert ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
