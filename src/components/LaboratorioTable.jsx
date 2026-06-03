import { FileText, Warehouse } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';
import { humedadAlerta, number } from '../utils/formatters';

export default function LaboratorioTable({ rows, onSendStorage, onGenerateOfficial }) {
  if (!rows.length) {
    return (
      <div className="section-card">
        <EmptyState title="Aun no hay analisis" description="Selecciona un camion pendiente y registra la muestra de laboratorio." />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full text-left text-sm">
          <thead className="bg-curimapu-green text-white">
            <tr>
              {['Fecha analisis', 'Patente', 'Proveedor', 'Producto', 'N lote', '% humedad', 'Impurezas', 'Resultado', 'Observaciones', 'Acciones'].map((head) => (
                <th key={head} className="px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const wet = Number(row.humedad || 0) > humedadAlerta;
              return (
                <tr key={row.id} className={`${row.resultado === 'Rechazado' ? 'bg-red-50' : wet ? 'bg-amber-50' : 'bg-white'} border-b border-slate-100 hover:bg-curimapu-light/40`}>
                  <td className="px-3 py-2">{row.fecha_analisis}</td>
                  <td className="px-3 py-2 font-bold">{row.romana?.patente}</td>
                  <td className="px-3 py-2">{row.romana?.proveedor_nombre}</td>
                  <td className="px-3 py-2">{row.producto}</td>
                  <td className="px-3 py-2">{row.numero_lote}</td>
                  <td className="px-3 py-2 font-semibold">{number(row.humedad, 1)}</td>
                  <td className="px-3 py-2">{number(row.impurezas, 1)}</td>
                  <td className="px-3 py-2"><StatusBadge value={row.resultado} /></td>
                  <td className="px-3 py-2">{row.observaciones_laboratorio}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button className="btn btn-secondary px-2" type="button" onClick={() => onGenerateOfficial?.({ ...row.romana, laboratorio: row })} title="Generar Formulario Oficial">
                        <FileText size={15} />
                      </button>
                      {row.resultado === 'Aprobado' ? (
                        <button className="btn btn-secondary px-2" type="button" onClick={() => onSendStorage?.(row)} title="Enviar a almacenamiento">
                          <Warehouse size={15} />
                        </button>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold text-slate-400">No aplica</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
