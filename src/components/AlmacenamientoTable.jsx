import StatusBadge from './StatusBadge.jsx';
import { number } from '../utils/formatters';

export default function AlmacenamientoTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
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
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{row.fecha_ingreso}</td>
                <td className="px-3 py-2">{row.romana?.proveedor_nombre}</td>
                <td className="px-3 py-2">{row.laboratorio?.producto}</td>
                <td className="px-3 py-2 font-bold">{row.romana?.patente}</td>
                <td className="px-3 py-2">{number(row.romana?.peso_entrada)} kg</td>
                <td className="px-3 py-2">{row.silo_bodega}</td>
                <td className="px-3 py-2"><StatusBadge value={row.estado_almacenamiento} /></td>
                <td className="px-3 py-2 text-slate-500">Ver / editar</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
