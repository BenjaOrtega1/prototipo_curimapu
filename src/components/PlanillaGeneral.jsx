import { FileText } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import EmptyState from './EmptyState.jsx';
import { humedadAlerta, monthName, number } from '../utils/formatters';

const emptyColumns = {
  Mes: '',
  'Fecha ingreso': '',
  'Hora ingreso': '',
  Patente: '',
  Chofer: '',
  Proveedor: '',
  'Guia despacho': '',
  'N guia despacho': '',
  'Peso entrada': '',
  Producto: '',
  'N lote': '',
  'Hora muestreo': '',
  'Hora analisis': '',
  '% humedad': '',
  Impurezas: '',
  'Granos partidos': '',
  'Resultado laboratorio': '',
  'Silo/Bodega': '',
  'Estado general': '',
  Observaciones: '',
};

export function buildGeneralRows(records) {
  return records.map((row) => ({
    id: row.id,
    _record: row,
    Mes: monthName(row.fecha_ingreso),
    'Fecha ingreso': row.fecha_ingreso,
    'Hora ingreso': row.hora_ingreso,
    Patente: row.patente,
    Chofer: row.chofer,
    Proveedor: row.proveedor_nombre || row.proveedor?.nombre || '',
    'Guia despacho': row.guia_despacho,
    'N guia despacho': row.numero_guia_despacho,
    'Peso entrada': Number(row.peso_entrada || 0),
    Producto: row.laboratorio?.producto || '',
    'N lote': row.laboratorio?.numero_lote || '',
    'Hora muestreo': row.laboratorio?.hora_muestreo || '',
    'Hora analisis': row.laboratorio?.hora_analisis || '',
    '% humedad': Number(row.laboratorio?.humedad || 0),
    Impurezas: Number(row.laboratorio?.impurezas || 0),
    'Granos partidos': Number(row.laboratorio?.granos_partidos || 0),
    'Resultado laboratorio': row.laboratorio?.resultado || '',
    'Silo/Bodega': row.almacenamiento?.silo_bodega || '',
    'Estado general': row.estado,
    Observaciones: row.observaciones || row.laboratorio?.observaciones_laboratorio || row.almacenamiento?.observaciones || '',
  }));
}

export default function PlanillaGeneral({ rows, onGenerateOfficial }) {
  const total = rows.reduce((sum, row) => sum + Number(row['Peso entrada'] || 0), 0);
  const heads = Object.keys(rows[0] || emptyColumns).filter((key) => key !== 'id' && key !== '_record');
  if (rows.length && onGenerateOfficial && !heads.includes('Acciones')) heads.push('Acciones');

  if (!rows.length) {
    return (
      <div className="section-card">
        <EmptyState title="Aun no hay registros en la planilla" description="Ingresa el primer camion desde Romana o importa un Excel historico." />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1500px] w-full text-left text-sm">
          <thead className="bg-curimapu-green text-white">
            <tr>
              {heads.map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const wet = Number(row['% humedad'] || 0) > humedadAlerta;
              const rejected = row['Estado general'] === 'Rechazado';
              return (
                <tr key={row.id} className={`${rejected ? 'bg-red-50' : wet ? 'bg-amber-50' : 'bg-white'} border-b border-slate-100`}>
                  <td className="px-3 py-2">{row.Mes}</td>
                  <td className="px-3 py-2">{row['Fecha ingreso']}</td>
                  <td className="px-3 py-2">{row['Hora ingreso']}</td>
                  <td className="px-3 py-2 font-bold">{row.Patente}</td>
                  <td className="px-3 py-2">{row.Chofer}</td>
                  <td className="px-3 py-2">{row.Proveedor}</td>
                  <td className="px-3 py-2">{row['Guia despacho']}</td>
                  <td className="px-3 py-2">{row['N guia despacho']}</td>
                  <td className="px-3 py-2">{number(row['Peso entrada'])}</td>
                  <td className="px-3 py-2">{row.Producto}</td>
                  <td className="px-3 py-2">{row['N lote']}</td>
                  <td className="px-3 py-2">{row['Hora muestreo']}</td>
                  <td className="px-3 py-2">{row['Hora analisis']}</td>
                  <td className="px-3 py-2 font-semibold">{number(row['% humedad'], 1)}</td>
                  <td className="px-3 py-2">{number(row.Impurezas, 1)}</td>
                  <td className="px-3 py-2">{number(row['Granos partidos'], 1)}</td>
                  <td className="px-3 py-2"><StatusBadge value={row['Resultado laboratorio']} /></td>
                  <td className="px-3 py-2">{row['Silo/Bodega']}</td>
                  <td className="px-3 py-2"><StatusBadge value={row['Estado general']} /></td>
                  <td className="px-3 py-2">{row.Observaciones}</td>
                  {onGenerateOfficial && (
                    <td className="px-3 py-2">
                      <button className="btn btn-secondary px-2" type="button" onClick={() => onGenerateOfficial(row._record)} title="Generar Formulario Oficial">
                        <FileText size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 font-bold">
            <tr><td className="px-3 py-3" colSpan="20">Total registros: {rows.length} · Peso total entrada: {number(total)} kg</td></tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
