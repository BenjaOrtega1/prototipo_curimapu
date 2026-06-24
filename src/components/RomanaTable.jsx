import { Eye, FileText, FlaskConical, Pencil, Trash2, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';
import { number } from '../utils/formatters';

export default function RomanaTable({ rows, onEdit, onDelete, onSendLab, onGenerateOfficial }) {
  const [detail, setDetail] = useState(null);

  if (!rows.length) {
    return (
      <div className="section-card">
        <EmptyState title="Aun no hay ingresos de romana" description="Ingresa el primer camion desde el formulario superior o importa una planilla Excel." />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-curimapu-green text-white">
              <tr>
                {['Fecha', 'Hora', 'Patente', 'Chofer', 'Proveedor', 'N guia', 'Peso entrada', 'Estado', 'Acciones'].map((head) => (
                  <th key={head} className="px-3 py-3 font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-curimapu-light/40 dark:border-slate-800">
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
                      <button className="btn btn-secondary px-2" type="button" onClick={() => setDetail(row)} title="Ver detalle"><Eye size={15} /></button>
                      <button className="btn btn-secondary px-2" type="button" onClick={() => onGenerateOfficial?.(row)} title="Generar Formulario Oficial"><FileText size={15} /></button>
                      <button className="btn btn-secondary px-2" type="button" onClick={() => onEdit(row)} title="Editar"><Pencil size={15} /></button>
                      <button className="btn btn-secondary px-2" type="button" onClick={() => onSendLab(row)} title="Enviar a laboratorio"><FlaskConical size={15} /></button>
                      <button className="btn btn-secondary px-2 text-red-700" type="button" onClick={() => onDelete(row.id)} title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <RomanaDetailModal row={detail} onClose={() => setDetail(null)} />
    </>
  );
}

function RomanaDetailModal({ row, onClose }) {
  if (!row) return null;

  const proveedor = row.proveedor_nombre || row.proveedor?.nombre || '-';
  const details = [
    ['Fecha ingreso', row.fecha_ingreso],
    ['Hora ingreso', row.hora_ingreso],
    ['Patente', row.patente],
    ['Chofer', row.chofer],
    ['RUT chofer', row.rut_chofer],
    ['Proveedor', proveedor],
    ['RUT proveedor', row.rut_proveedor],
    ['Guia despacho', row.guia_despacho],
    ['N guia despacho', row.numero_guia_despacho],
    ['Peso entrada', `${number(row.peso_entrada)} kg`],
    ['Empresa transporte', row.empresa_transporte],
    ['Observaciones', row.observaciones],
  ];

  return createPortal(
    <div className="modal-backdrop-stable z-[85]" onClick={onClose}>
        <article className="romana-detail-card" onClick={(event) => event.stopPropagation()}>
          <header className="romana-detail-card__header">
            <div className="romana-detail-card__icon"><Truck size={22} /></div>
            <div>
              <p>Detalle romana</p>
              <h2>{row.patente || 'Ingreso sin patente'}</h2>
            </div>
            <button className="btn btn-secondary px-2" type="button" onClick={onClose} aria-label="Cerrar detalle">
              <X size={17} />
            </button>
          </header>

          <div className="romana-detail-card__status">
            <StatusBadge value={row.estado} />
            <strong>{number(row.peso_entrada)} kg</strong>
          </div>

          <dl className="romana-detail-grid">
            {details.map(([label, value]) => (
              <div key={label} className={label === 'Observaciones' ? 'is-wide' : ''}>
                <dt>{label}</dt>
                <dd>{value || '-'}</dd>
              </div>
            ))}
          </dl>
        </article>
    </div>,
    document.body,
  );
}
