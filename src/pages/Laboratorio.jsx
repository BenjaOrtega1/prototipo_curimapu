import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ImportExcelButton from '../components/ImportExcelButton.jsx';
import FormularioPreviewModal from '../components/FormularioPreviewModal.jsx';
import LaboratorioForm from '../components/LaboratorioForm.jsx';
import LaboratorioTable from '../components/LaboratorioTable.jsx';
import Toast from '../components/Toast.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { listLaboratorio, upsertLaboratorio } from '../services/laboratorioService';
import { listRomana } from '../services/romanaService';
import { mapExcelRowToLaboratorio, resolveRomanaFromExcelRow } from '../utils/importExcelMapper';

export default function Laboratorio() {
  const { can } = useAuth();
  const canWriteLaboratorio = can('laboratorio:write');
  const canWriteAlmacenamiento = can('almacenamiento:write');
  const canWriteDocuments = can('documentos:write');
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const romanaDesdeRuta = location.state?.romanaSeleccionada || null;
  const [romanaRows, setRomanaRows] = useState([]);
  const [laboratorioRows, setLaboratorioRows] = useState([]);
  const [romanaSeleccionada, setRomanaSeleccionada] = useState(romanaDesdeRuta);
  const [message, setMessage] = useState('');
  const [importWarnings, setImportWarnings] = useState([]);
  const [formularioRecord, setFormularioRecord] = useState(null);

  async function load() {
    const romanas = await listRomana();
    setRomanaRows(romanas);
    setLaboratorioRows(await listLaboratorio());
    const idFromQuery = params.get('romana');
    const selectedId = romanaDesdeRuta?.id || idFromQuery;
    if (selectedId) {
      setRomanaSeleccionada(romanaDesdeRuta || romanas.find((item) => item.id === selectedId) || null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pendientes = romanaRows.filter((row) => row.estado === 'Pendiente de laboratorio');
  const selectedRomanaId = romanaSeleccionada?.id || params.get('romana') || '';

  function handleSelectRomana(id) {
    setRomanaSeleccionada(romanaRows.find((item) => item.id === id) || null);
  }

  async function save(form) {
    if (!canWriteLaboratorio) return;
    await upsertLaboratorio(form);
    setMessage('Analisis de laboratorio guardado correctamente.');
    setRomanaSeleccionada(null);
    await load();
  }

  async function handleImportExcel(excelRows) {
    if (!canWriteLaboratorio) return { imported: 0, warnings: [{ row: '-', reason: 'No tienes permiso para importar análisis de laboratorio.' }] };
    const warnings = [];
    let imported = 0;

    for (const [index, row] of excelRows.entries()) {
      const romana = resolveRomanaFromExcelRow(row, romanaRows);
      const registro = mapExcelRowToLaboratorio(row, romana?.id);
      const hasData = registro.producto || registro.numero_lote || registro.humedad !== null;

      if (!hasData) {
        warnings.push({ row: index + 2, reason: 'Fila sin datos de laboratorio reconocibles.' });
        continue;
      }

      if (!registro.romana_id) {
        warnings.push({ row: index + 2, reason: 'No se encontro romana asociada por ID, patente o guia.' });
        continue;
      }

      await upsertLaboratorio(registro);
      imported += 1;
    }

    setImportWarnings(warnings);
    setMessage(`Se importaron ${imported} analisis correctamente.`);
    await load();
    return { imported, warnings };
  }

  function sendStorage(registro) {
    navigate('/almacenamiento', {
      state: {
        laboratorioSeleccionado: registro,
        romanaSeleccionada: registro.romana,
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Laboratorio / Analisis</h1>
          <p className="text-sm text-slate-600">Recibe registros desde romana y define aprobacion o rechazo.</p>
        </div>
        {canWriteLaboratorio && <ImportExcelButton onImport={handleImportExcel} mode="laboratorio" label="Importar Excel laboratorio" />}
      </div>

      {importWarnings.length > 0 && (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-bold">Advertencias de importacion</h2>
          <ul className="mt-2 space-y-1">
            {importWarnings.slice(0, 8).map((warning) => (
              <li key={`${warning.row}-${warning.reason}`}>Fila {warning.row}: {warning.reason}</li>
            ))}
          </ul>
          {importWarnings.length > 8 && <p className="mt-2">Hay {importWarnings.length - 8} advertencias adicionales.</p>}
        </section>
      )}

      {canWriteLaboratorio && (
        <LaboratorioForm
          pendientes={pendientes}
          selectedRomanaId={selectedRomanaId}
          romanaSeleccionada={romanaSeleccionada}
          onRomanaChange={handleSelectRomana}
          onSubmit={save}
        />
      )}
      <LaboratorioTable
        rows={laboratorioRows}
        canSendStorage={canWriteAlmacenamiento}
        canGenerateOfficial={canWriteDocuments}
        onSendStorage={sendStorage}
        onGenerateOfficial={setFormularioRecord}
      />
      <FormularioPreviewModal recepcion={formularioRecord} open={Boolean(formularioRecord)} onClose={() => setFormularioRecord(null)} />
      <Toast message={message} onClose={() => setMessage('')} />
    </div>
  );
}
