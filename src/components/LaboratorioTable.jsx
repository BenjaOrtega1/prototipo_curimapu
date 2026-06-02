import StatusBadge from './StatusBadge.jsx';
import { humedadAlerta, number } from '../utils/formatters';

export default function LaboratorioTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-curimapu-green text-white">
            <tr>
              {['Fecha análisis', 'Patente', 'Proveedor', 'Producto', 'N° lote', '% humedad', 'Impurezas', 'Resultado', 'Observaciones'].map((head) => (
                <th key={head} className="px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const wet = Number(row.humedad || 0) > humedadAlerta;
              return (
                <tr key={row.id} className={`${row.resultado === 'Rechazado' ? 'bg-red-50' : wet ? 'bg-amber-50' : 'bg-white'} border-b border-slate-100`}>
                  <td className="px-3 py-2">{row.fecha_analisis}</td>
                  <td className="px-3 py-2 font-bold">{row.romana?.patente}</td>
                  <td className="px-3 py-2">{row.romana?.proveedor_nombre}</td>
                  <td className="px-3 py-2">{row.producto}</td>
                  <td className="px-3 py-2">{row.numero_lote}</td>
                  <td className="px-3 py-2 font-semibold">{number(row.humedad, 1)}</td>
                  <td className="px-3 py-2">{number(row.impurezas, 1)}</td>
                  <td className="px-3 py-2"><StatusBadge value={row.resultado} /></td>
                  <td className="px-3 py-2">{row.observaciones_laboratorio}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
