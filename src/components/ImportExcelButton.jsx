import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

export default function ImportExcelButton({ onImport, mode = 'general', label = 'Importar Excel' }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState([]);
  const [rows, setRows] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    setError('');
    setResult(null);
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
        raw: false,
      });

      setRows(json);
      setPreview(json.slice(0, 5));
      setShowPreview(true);
    } catch (readError) {
      setError(`No se pudo leer el archivo: ${readError.message}`);
    } finally {
      event.target.value = '';
    }
  }

  async function confirmarImportacion() {
    if (!rows.length || loading) return;
    setLoading(true);
    setError('');
    try {
      const importResult = await onImport(rows, { mode });
      setResult(importResult);
      setRows([]);
      setPreview([]);
      setShowPreview(false);
    } catch (importError) {
      setError(`No se pudo importar: ${importError.message}`);
    } finally {
      setLoading(false);
    }
  }

  function cancelar() {
    setRows([]);
    setPreview([]);
    setShowPreview(false);
  }

  const headers = Object.keys(preview[0] || {});

  return (
    <div className="relative">
      <button className="btn btn-secondary" type="button" onClick={() => inputRef.current?.click()}>
        <Upload size={17} />
        {label}
      </button>
      <input ref={inputRef} className="hidden" type="file" accept=".xlsx,.xls" onChange={handleFile} />

      {result && (
        <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 size={16} />
            Importacion completada: {result.imported} registros importados.
          </div>
          {result.warnings?.length > 0 && (
            <p className="mt-1 text-amber-800">{result.warnings.length} filas fueron omitidas o tienen advertencias.</p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900">
          {error}
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <FileSpreadsheet size={20} />
                  Previsualizacion Excel
                </h3>
                <p className="text-sm text-slate-500">Modo: {mode} · Filas detectadas: {rows.length}</p>
              </div>
              <button className="btn btn-secondary px-2" type="button" onClick={cancelar}>
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-auto p-4">
              {preview.length === 0 ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  El archivo no contiene filas con datos.
                </div>
              ) : (
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-curimapu-green text-white">
                    <tr>
                      {headers.map((key) => (
                        <th key={key} className="whitespace-nowrap px-3 py-2 font-semibold">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={`${index}-${JSON.stringify(row).slice(0, 20)}`} className="border-b border-slate-100">
                        {headers.map((key) => (
                          <td key={key} className="whitespace-nowrap px-3 py-2">{String(row[key] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                Se importaran las filas con datos minimos de romana. Las filas incompletas se omitiran y se informaran como advertencia.
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button className="btn btn-secondary" type="button" onClick={cancelar}>Cancelar</button>
                <button className="btn btn-primary" type="button" disabled={!rows.length || loading} onClick={confirmarImportacion}>
                  {loading ? 'Importando...' : 'Confirmar importacion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
