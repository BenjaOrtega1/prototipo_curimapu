import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { humedadAlerta, monthName, number, statusLabel } from '../utils/formatters';

export function buildPlanillaRows(records) {
  return records.map((recepcion, index) => {
    const analisis = recepcion.analisis?.[0] || {};
    const impG = Number(analisis.impurezas || 0) * 10;
    const gpG = Number(analisis.granos_partidos || 0) * 10;
    return {
      id: recepcion.id,
      Mes: monthName(recepcion.fecha_recepcion),
      Fecha: recepcion.fecha_recepcion,
      'Hora muestreo': analisis.hora_muestreo || '',
      'Hora análisis': analisis.hora_analisis || '',
      'N°': index + 1,
      'RPN°': analisis.numero_lote || '',
      'N° guía': recepcion.guia_despacho || '',
      Folio: analisis.correlativo_muestra || recepcion.id,
      Proveedor: recepcion.proveedores?.nombre || '',
      Producto: recepcion.producto || '',
      Patente: recepcion.patente_camion || '',
      '% humedad': Number(analisis.humedad || 0),
      'C. muestra (g)': 1000,
      'IMP (g)': impG,
      'G.P (g)': gpG,
      'IMP (%)': Number(analisis.impurezas || 0),
      'G.P (%)': Number(analisis.granos_partidos || 0),
      'C. muestra limpia (g)': 1000 - impG - gpG,
      Estado: statusLabel(recepcion),
      Observaciones: recepcion.observaciones || analisis.otros || '',
      Kilos: Number(recepcion.kilos_netos || 0),
      _recepcion: recepcion,
    };
  });
}

export default function RecepcionTable({ rows, onDelete }) {
  const totalKilos = rows.reduce((sum, row) => sum + Number(row.Kilos || 0), 0);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
          <thead className="bg-curimapu-green text-white">
            <tr>
              {['Mes', 'Fecha', 'Hora muestreo', 'Hora análisis', 'N°', 'RPN°', 'N° guía', 'Folio', '% humedad', 'C. muestra (g)', 'IMP (g)', 'G.P (g)', 'IMP (%)', 'G.P (%)', 'C. muestra limpia (g)', 'Estado', 'Observaciones', 'Acciones'].map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rejected = row.Estado === 'Rechazado';
              const wet = Number(row['% humedad']) > humedadAlerta;
              return (
                <tr key={row.id} className={`${rejected ? 'bg-red-50 text-red-950' : wet ? 'bg-amber-50' : 'bg-white'} border-b border-slate-100`}>
                  <Cell>{row.Mes}</Cell>
                  <Cell>{row.Fecha}</Cell>
                  <Cell>{row['Hora muestreo']}</Cell>
                  <Cell>{row['Hora análisis']}</Cell>
                  <Cell>{row['N°']}</Cell>
                  <Cell>{row['RPN°']}</Cell>
                  <Cell>{row['N° guía']}</Cell>
                  <Cell>{row.Folio}</Cell>
                  <Cell className={wet ? 'font-bold text-amber-800' : ''}>{number(row['% humedad'], 1)}</Cell>
                  <Cell>{row['C. muestra (g)']}</Cell>
                  <Cell>{number(row['IMP (g)'], 1)}</Cell>
                  <Cell>{number(row['G.P (g)'], 1)}</Cell>
                  <Cell>{number(row['IMP (%)'], 1)}</Cell>
                  <Cell>{number(row['G.P (%)'], 1)}</Cell>
                  <Cell>{number(row['C. muestra limpia (g)'], 1)}</Cell>
                  <Cell><Status value={row.Estado} /></Cell>
                  <Cell>{row.Observaciones}</Cell>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="flex gap-1">
                      <Link className="btn btn-secondary px-2" to={`/recepciones/${row.id}`} title="Ver detalle"><Eye size={15} /></Link>
                      <Link className="btn btn-secondary px-2" to={`/nueva?id=${row.id}`} title="Editar"><Pencil size={15} /></Link>
                      <button className="btn btn-secondary px-2 text-red-700" onClick={() => onDelete(row.id)} title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 font-bold text-slate-900">
            <tr>
              <td className="px-3 py-3" colSpan="17">Total registros: {rows.length} · Total kilos recibidos: {number(totalKilos)} kg</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Cell({ children, className = '' }) {
  return <td className={`whitespace-nowrap px-3 py-2 align-top ${className}`}>{children}</td>;
}

function Status({ value }) {
  const className = value === 'Rechazado'
    ? 'bg-red-100 text-red-800'
    : value === 'Aprobado'
      ? 'bg-green-100 text-green-800'
      : value === 'Incompleto'
        ? 'bg-slate-200 text-slate-700'
        : 'bg-amber-100 text-amber-800';
  return <span className={`rounded px-2 py-1 text-xs font-bold ${className}`}>{value}</span>;
}
