import { FileSpreadsheet, FlaskConical, Scale, Warehouse } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCards from '../components/DashboardCards.jsx';
import ExportButtons from '../components/ExportButtons.jsx';
import Logo from '../components/Logo.jsx';
import { buildGeneralRows } from '../components/PlanillaGeneral.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { listRomana } from '../services/romanaService';
import { humedadAlerta, number } from '../utils/formatters';

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
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Logo size="md" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Dashboard principal</h1>
          <p className="text-sm text-slate-600">Flujo centralizado desde romana hasta almacenamiento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-primary" to="/romana"><Scale size={17} />Nuevo ingreso romana</Link>
          <Link className="btn btn-secondary" to="/laboratorio"><FlaskConical size={17} />Registrar análisis</Link>
          <Link className="btn btn-secondary" to="/almacenamiento"><Warehouse size={17} />Ver almacenamiento</Link>
          <button className="btn btn-secondary" onClick={() => import('../utils/exporters').then(({ exportExcel }) => exportExcel(rows))}><FileSpreadsheet size={17} />Exportar Excel</button>
        </div>
      </div>

      <DashboardCards stats={stats} />

      <section ref={captureRef} className="grid gap-5 lg:grid-cols-3">
        <div className="panel rounded-md p-4 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Últimos ingresos de romana</h2>
            <ExportButtons rows={rows} captureRef={captureRef} compact />
          </div>
          <div className="space-y-2">
            {records.slice(0, 6).map((row) => (
              <div key={row.id} className="grid gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-5 sm:items-center">
                <div><b>{row.patente}</b><p className="text-xs text-slate-500">{row.fecha_ingreso} · {row.hora_ingreso}</p></div>
                <div className="sm:col-span-2">{row.proveedor_nombre}<p className="text-xs text-slate-500">{row.chofer}</p></div>
                <div>{number(row.peso_entrada)} kg</div>
                <StatusBadge value={row.estado} />
              </div>
            ))}
          </div>
        </div>
        <div className="panel rounded-md p-4">
          <h2 className="text-lg font-bold text-slate-900">Alertas de humedad alta</h2>
          <div className="mt-3 space-y-2">
            {alertas.length === 0 && <p className="text-sm text-slate-500">Sin alertas activas.</p>}
            {alertas.map((row) => (
              <div key={row.id} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <b>{row.patente}</b> · {row.proveedor_nombre}<br />
                Humedad: {number(row.laboratorio?.humedad, 1)}%
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
