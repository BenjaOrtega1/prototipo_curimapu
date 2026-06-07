import { RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deleteDocumento, listDocumentosByRomanaId } from '../services/documentoService';
import EmptyState from './EmptyState.jsx';

export default function HistorialFormularios({ romanaId, onRegenerar }) {
  const [rows, setRows] = useState([]);

  async function load() {
    setRows(await listDocumentosByRomanaId(romanaId));
  }

  useEffect(() => {
    if (romanaId) load();
  }, [romanaId]);

  async function remove(id) {
    if (!window.confirm('Eliminar este registro del historial?')) return;
    await deleteDocumento(id);
    load();
  }

  if (!romanaId) return null;

  if (!rows.length) {
    return (
      <div className="section-card">
        <EmptyState title="Aun no existen formularios generados para esta recepcion." description="Cuando generes un PDF, aparecera en este historial." />
      </div>
    );
  }

  return (
    <section className="section-card">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-curimapu-green">Historial de formularios</h3>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-curimapu-green text-white">
            <tr>
              {['N formulario', 'Fecha generacion', 'Patente', 'Proveedor', 'Producto', 'Resultado', 'Acciones'].map((head) => (
                <th key={head} className="px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-3 py-2 font-black">{row.numero_formateado}</td>
                <td className="px-3 py-2">{row.fecha_generacion || row.created_at}</td>
                <td className="px-3 py-2">{row.patente}</td>
                <td className="px-3 py-2">{row.proveedor}</td>
                <td className="px-3 py-2">{row.producto}</td>
                <td className="px-3 py-2">{row.resultado_laboratorio}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {row.url_pdf && <a className="btn btn-secondary px-2" href={row.url_pdf} target="_blank" rel="noreferrer">Descargar</a>}
                    <button className="btn btn-secondary px-2" type="button" onClick={onRegenerar} title="Regenerar formulario"><RefreshCw size={15} /></button>
                    <button className="btn btn-secondary px-2 text-red-700" type="button" onClick={() => remove(row.id)} title="Eliminar"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
