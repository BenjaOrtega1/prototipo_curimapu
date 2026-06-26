import { FileText } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';
import { number } from '../utils/formatters';

export default function AlmacenamientoTable({ rows, canGenerateOfficial = true, onGenerateOfficial }) {
  if (!rows.length) {
    return (
      <div className="section-card">
        <EmptyState title="Sin registros en almacenamiento" description="Cuando laboratorio apruebe un camion, podras asignarlo a silo o bodega." />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full text-left text-sm">
          <thead className="bg-curimapu-green text-white">
            <tr>
              {['Fecha', 'Proveedor', 'Producto', 'Patente', 'Kilos', 'Silo/Bodega', 'Estado', 'Acciones'].map((head) => (
                <th key={head} className="px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-curimapu-light/40">
                <td className="px-3 py-2">{row.fecha_ingreso}</td>
                <td className="px-3 py-2">{row.romana?.proveedor_nombre}</td>
                <td className="px-3 py-2">{row.laboratorio?.producto}</td>
                <td className="px-3 py-2 font-bold">{row.romana?.patente}</td>
                <td className="px-3 py-2">{number(row.romana?.peso_entrada)} kg</td>
                <td className="px-3 py-2">{row.silo_bodega}</td>
                <td className="px-3 py-2"><StatusBadge value={row.estado_almacenamiento} /></td>
                <td className="px-3 py-2">
                  {canGenerateOfficial && <button className="btn btn-secondary px-2" type="button" onClick={() => onGenerateOfficial?.({ ...row.romana, laboratorio: row.laboratorio, almacenamiento: row })} title="Generar Formulario Oficial">
                    <FileText size={15} />
                  </button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
