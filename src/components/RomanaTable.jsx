import { Eye, FileText, FlaskConical, Pencil, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';
import { number } from '../utils/formatters';

export default function RomanaTable({ rows, onEdit, onDelete, onSendLab, onGenerateOfficial }) {
  if (!rows.length) {
    return (
      <div className="section-card">
        <EmptyState title="Aun no hay ingresos de romana" description="Ingresa el primer camion desde el formulario superior o importa una planilla Excel." />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-curimapu-green text-white">
            <tr>
              {['Fecha', 'Hora', 'Patente', 'Chofer', 'Proveedor', 'N° guía', 'Peso entrada', 'Estado', 'Acciones'].map((head) => (
                <th key={head} className="px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-curimapu-light/40">
                <td className="px-3 py-2">{row.fecha_ingreso}</td>
                <td className="px-3 py-2">{row.hora_ingreso}</td>
                <td className="px-3 py-2 font-bold">{row.patente}</td>
                <td className="px-3 py-2">{row.chofer}</td>
                <td className="px-3 py-2">{row.proveedor_nombre || row.proveedor?.nombre}</td>
                <td className="px-3 py-2">{row.numero_guia_despacho}</td>
                <td className="px-3 py-2">{number(row.peso_entrada)} kg</td>
                <td className="px-3 py-2"><StatusBadge value={row.estado} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="btn btn-secondary px-2" onClick={() => window.alert(`Detalle romana\nPatente: ${row.patente}\nChofer: ${row.chofer}\nProveedor: ${row.proveedor_nombre}\nGuía: ${row.numero_guia_despacho}\nPeso: ${number(row.peso_entrada)} kg\nEstado: ${row.estado}`)} title="Ver detalle"><Eye size={15} /></button>
                    <button className="btn btn-secondary px-2" onClick={() => onGenerateOfficial?.(row)} title="Generar Formulario Oficial"><FileText size={15} /></button>
                    <button className="btn btn-secondary px-2" onClick={() => onEdit(row)} title="Editar"><Pencil size={15} /></button>
                    <button className="btn btn-secondary px-2" onClick={() => onSendLab(row)} title="Enviar a laboratorio"><FlaskConical size={15} /></button>
                    <button className="btn btn-secondary px-2 text-red-700" onClick={() => onDelete(row.id)} title="Eliminar"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
