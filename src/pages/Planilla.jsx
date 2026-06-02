import { Printer, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ExportButtons from '../components/ExportButtons.jsx';
import PlanillaGeneral, { buildGeneralRows } from '../components/PlanillaGeneral.jsx';
import { listRomana } from '../services/romanaService';

export default function Planilla() {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ date: '', month: '', proveedor: '', patente: '', producto: '', estado: '', search: '' });
  const captureRef = useRef(null);

  useEffect(() => {
    listRomana().then(setRecords);
  }, []);

  const rows = useMemo(() => buildGeneralRows(records), [records]);
  const filtered = rows.filter((row) => {
    const haystack = `${row.Patente} ${row['Guía despacho']} ${row['N° guía despacho']} ${row['N° lote']} ${row.Proveedor}`.toLowerCase();
    return (!filters.date || row['Fecha ingreso'] === filters.date)
      && (!filters.month || row.Mes === filters.month)
      && (!filters.proveedor || row.Proveedor === filters.proveedor)
      && (!filters.patente || row.Patente === filters.patente)
      && (!filters.producto || row.Producto === filters.producto)
      && (!filters.estado || row['Estado general'] === filters.estado)
      && (!filters.search || haystack.includes(filters.search.toLowerCase()));
  });

  const unique = (field) => [...new Set(rows.map((row) => row[field]).filter(Boolean))];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Planilla general</h1>
          <p className="text-sm text-slate-600">Información unificada de romana, laboratorio y almacenamiento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButtons rows={filtered.map(({ id, ...row }) => row)} captureRef={captureRef} />
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={17} />Imprimir resumen</button>
        </div>
      </div>

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
              <input className="pl-8" placeholder="Patente, guía, lote o proveedor" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
          </Field>
        </div>
      </section>

      <div ref={captureRef}>
        <PlanillaGeneral rows={filtered} />
      </div>
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
