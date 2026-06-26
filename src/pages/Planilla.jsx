import { Printer, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ExportButtons from '../components/ExportButtons.jsx';
import FormularioPreviewModal from '../components/FormularioPreviewModal.jsx';
import ImportExcelButton from '../components/ImportExcelButton.jsx';
import PlanillaGeneral, { buildGeneralRows } from '../components/PlanillaGeneral.jsx';
import Toast from '../components/Toast.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { importExcelRows } from '../services/importExcelService';
import { listRomana } from '../services/romanaService';
import { printRowsSummary } from '../utils/exporters';

export default function Planilla() {
  const { can, isAdmin } = useAuth();
  const canWriteDocuments = can('documentos:write');
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ date: '', month: '', proveedor: '', patente: '', producto: '', estado: '', search: '' });
  const [importWarnings, setImportWarnings] = useState([]);
  const [formularioRecord, setFormularioRecord] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const captureRef = useRef(null);

  async function load() {
    setRecords(await listRomana());
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => buildGeneralRows(records), [records]);
  const filtered = rows.filter((row) => {
    const haystack = `${row.Patente} ${row['Guia despacho']} ${row['N guia despacho']} ${row['N lote']} ${row.Proveedor}`.toLowerCase();
    return (!filters.date || row['Fecha ingreso'] === filters.date)
      && (!filters.month || row.Mes === filters.month)
      && (!filters.proveedor || row.Proveedor === filters.proveedor)
      && (!filters.patente || row.Patente === filters.patente)
      && (!filters.producto || row.Producto === filters.producto)
      && (!filters.estado || row['Estado general'] === filters.estado)
      && (!filters.search || haystack.includes(filters.search.toLowerCase()));
  });

  const unique = (field) => [...new Set(rows.map((row) => row[field]).filter(Boolean))];

  async function handleImportExcel(excelRows, options) {
    if (!isAdmin) return { imported: 0, warnings: [{ row: '-', reason: 'Solo un administrador puede importar una planilla general.' }] };
    const result = await importExcelRows(excelRows, options);
    setImportWarnings(result.warnings || []);
    setNotice(`Se importaron ${result.imported || 0} registros.`);
    await load();
    return result;
  }

  function handlePrintSummary() {
    try {
      printRowsSummary(filtered, 'Resumen planilla general Curimapu');
      setNotice('Resumen preparado para impresion.');
    } catch (printError) {
      setError(printError.message || 'No se pudo preparar la impresion.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Planilla general</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Informacion unificada de romana, laboratorio y almacenamiento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && <ImportExcelButton onImport={handleImportExcel} mode="general" label="Importar Excel" />}
          <ExportButtons rows={filtered.map(({ id, _record, ...row }) => row)} />
          <button className="btn btn-secondary" type="button" onClick={handlePrintSummary}><Printer size={17} />Imprimir resumen</button>
        </div>
      </div>

      {importWarnings.length > 0 && (
        <section className="rounded-md border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-900 dark:text-amber-200">
          <h2 className="font-bold">Advertencias de importacion</h2>
          <ul className="mt-2 space-y-1">
            {importWarnings.slice(0, 8).map((warning) => (
              <li key={`${warning.row}-${warning.reason}`}>Fila {warning.row}: {warning.reason}</li>
            ))}
          </ul>
          {importWarnings.length > 8 && <p className="mt-2">Hay {importWarnings.length - 8} advertencias adicionales.</p>}
        </section>
      )}

      <section className="panel rounded-md p-4">
        <div className="grid gap-3 md:grid-cols-7">
          <Field label="Fecha"><input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} /></Field>
          <Select label="Mes" value={filters.month} options={unique('Mes')} onChange={(value) => setFilters({ ...filters, month: value })} />
          <Select label="Proveedor" value={filters.proveedor} options={unique('Proveedor')} onChange={(value) => setFilters({ ...filters, proveedor: value })} />
          <Select label="Patente" value={filters.patente} options={unique('Patente')} onChange={(value) => setFilters({ ...filters, patente: value })} />
          <Select label="Producto" value={filters.producto} options={unique('Producto')} onChange={(value) => setFilters({ ...filters, producto: value })} />
          <Select label="Estado" value={filters.estado} options={unique('Estado general')} onChange={(value) => setFilters({ ...filters, estado: value })} />
          <Field label="Buscar">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-slate-400" size={16} />
              <input className="pl-8" placeholder="Patente, guia, lote o proveedor" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
          </Field>
        </div>
      </section>

      <div ref={captureRef}>
        <PlanillaGeneral rows={filtered} onGenerateOfficial={canWriteDocuments ? setFormularioRecord : undefined} />
      </div>
      <FormularioPreviewModal recepcion={formularioRecord} open={Boolean(formularioRecord)} onClose={() => setFormularioRecord(null)} />
      <Toast message={notice} onClose={() => setNotice('')} />
      <Toast message={error} type="error" onClose={() => setError('')} />
    </div>
  );
}

function Field({ label, children }) {
  return <div className="space-y-1"><label>{label}</label>{children}</div>;
}

function Select({ label, value, options, onChange }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </Field>
  );
}
