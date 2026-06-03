import { AlertTriangle, ArrowRight, FileSpreadsheet, FlaskConical, Scale, Table2, Warehouse } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCards from '../components/DashboardCards.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ExportButtons from '../components/ExportButtons.jsx';
import Logo from '../components/Logo.jsx';
import { buildGeneralRows } from '../components/PlanillaGeneral.jsx';
import SectionCard from '../components/SectionCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { listRomana } from '../services/romanaService';
import { humedadAlerta, number } from '../utils/formatters';

const workflow = [
  { label: 'Romana', to: '/romana' },
  { label: 'Laboratorio', to: '/laboratorio' },
  { label: 'Almacenamiento', to: '/almacenamiento' },
  { label: 'Planilla', to: '/planilla' },
];

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const captureRef = useRef(null);

  useEffect(() => {
    listRomana().then(setRecords);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const rows = useMemo(() => buildGeneralRows(records), [records]);
  const stats = {
    totalCamiones: records.filter((item) => item.fecha_ingreso === today).length,
    kilos: records.reduce((sum, item) => sum + Number(item.peso_entrada || 0), 0),
    pendientes: records.filter((item) => item.estado === 'Pendiente de laboratorio').length,
    aprobadas: records.filter((item) => item.laboratorio?.resultado === 'Aprobado').length,
    rechazadas: records.filter((item) => item.estado === 'Rechazado').length,
    almacenamiento: records.filter((item) => item.almacenamiento).length,
  };
  const alertas = records.filter((item) => Number(item.laboratorio?.humedad || 0) > humedadAlerta);

  return (
    <div className="space-y-6">
      <section className="section-card overflow-hidden bg-gradient-to-br from-white via-white to-curimapu-light">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Logo size="md" />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-curimapu-green">Panel principal</p>
            <h1 className="mt-2 text-3xl font-black text-curimapu-dark md:text-4xl">Recepcion de cereales en tiempo real</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Control rapido para camiones, muestras de laboratorio, rechazos, almacenamiento y planilla historica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/romana"><Scale size={18} />Nuevo ingreso romana</Link>
            <Link className="btn btn-secondary" to="/laboratorio"><FlaskConical size={18} />Registrar analisis</Link>
            <Link className="btn btn-secondary" to="/almacenamiento"><Warehouse size={18} />Ver almacenamiento</Link>
          </div>
        </div>
      </section>

      <DashboardCards stats={stats} />

      <SectionCard title="Flujo operativo" description="Ruta natural del camion desde el ingreso hasta la planilla general.">
        <div className="grid gap-3 md:grid-cols-4">
          {workflow.map((step, index) => (
            <Link key={step.label} to={step.to} className="workflow-step">
              <span className="workflow-step__number">{index + 1}</span>
              <span>{step.label}</span>
              {index < workflow.length - 1 && <ArrowRight className="ml-auto text-curimapu-green" size={18} />}
            </Link>
          ))}
        </div>
      </SectionCard>

      <div ref={captureRef} className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Ultimos registros"
          description="Ingresos recientes desde romana y su estado actual."
          action={<ExportButtons rows={rows} captureRef={captureRef} compact />}
        >
          {records.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {records.slice(0, 7).map((row) => (
                <div key={row.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-curimapu-green hover:shadow-sm md:grid-cols-5 md:items-center">
                  <div>
                    <p className="text-lg font-black text-curimapu-dark">{row.patente}</p>
                    <p className="text-xs font-bold text-slate-500">{row.fecha_ingreso} · {row.hora_ingreso}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-bold text-slate-900">{row.proveedor_nombre}</p>
                    <p className="text-sm text-slate-500">{row.chofer}</p>
                  </div>
                  <div className="font-black text-slate-800">{number(row.peso_entrada)} kg</div>
                  <StatusBadge value={row.estado} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Alertas" description="Humedad alta o registros con rechazo." action={<Link className="btn btn-secondary" to="/planilla"><Table2 size={17} />Planilla</Link>}>
          <div className="space-y-3">
            {alertas.length === 0 && records.filter((row) => row.estado === 'Rechazado').length === 0 && (
              <EmptyState title="Sin alertas activas" description="Los registros actuales estan dentro de los parametros visibles." />
            )}
            {alertas.map((row) => (
              <div key={row.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex items-center gap-2 font-black">
                  <AlertTriangle size={18} />
                  Humedad alta
                </div>
                <p className="mt-2"><b>{row.patente}</b> · {row.proveedor_nombre}</p>
                <p>Humedad: {number(row.laboratorio?.humedad, 1)}%</p>
              </div>
            ))}
            {records.filter((row) => row.estado === 'Rechazado').slice(0, 3).map((row) => (
              <div key={`rechazo-${row.id}`} className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="font-black">Registro rechazado</div>
                <p className="mt-2"><b>{row.patente}</b> · {row.proveedor_nombre}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <button className="btn btn-secondary" onClick={() => import('../utils/exporters').then(({ exportExcel }) => exportExcel(rows))}>
        <FileSpreadsheet size={17} />
        Exportar Excel
      </button>
    </div>
  );
}
