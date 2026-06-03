import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AlmacenamientoForm from '../components/AlmacenamientoForm.jsx';
import AlmacenamientoTable from '../components/AlmacenamientoTable.jsx';
import FormularioPreviewModal from '../components/FormularioPreviewModal.jsx';
import ImportExcelButton from '../components/ImportExcelButton.jsx';
import Toast from '../components/Toast.jsx';
import { listAlmacenamiento, upsertAlmacenamiento } from '../services/almacenamientoService';
import { listRomana } from '../services/romanaService';
import { mapExcelRowToAlmacenamiento, resolveRomanaFromExcelRow } from '../utils/importExcelMapper';

export default function Almacenamiento() {
  const location = useLocation();
  const romanaDesdeRuta = location.state?.romanaSeleccionada || null;
  const laboratorioDesdeRuta = location.state?.laboratorioSeleccionado || null;
  const [romanaRows, setRomanaRows] = useState([]);
  const [almacenamientoRows, setAlmacenamientoRows] = useState([]);
  const [seleccionada, setSeleccionada] = useState(romanaDesdeRuta ? { ...romanaDesdeRuta, laboratorio: laboratorioDesdeRuta || romanaDesdeRuta.laboratorio } : null);
  const [message, setMessage] = useState('');
  const [importWarnings, setImportWarnings] = useState([]);
  const [formularioRecord, setFormularioRecord] = useState(null);

  async function load() {
    const romanas = await listRomana();
    setRomanaRows(romanas);
    setAlmacenamientoRows(await listAlmacenamiento());

    if (romanaDesdeRuta?.id) {
      const refreshed = romanas.find((item) => item.id === romanaDesdeRuta.id);
      setSeleccionada(refreshed || { ...romanaDesdeRuta, laboratorio: laboratorioDesdeRuta || romanaDesdeRuta.laboratorio });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const aprobados = romanaRows.filter((row) => row.estado === 'Pendiente de almacenamiento' && row.laboratorio?.resultado === 'Aprobado');

  function handleSelectRecepcion(id) {
    setSeleccionada(romanaRows.find((item) => item.id === id) || null);
  }

  async function save(form) {
    await upsertAlmacenamiento(form);
    setMessage('Almacenamiento guardado correctamente.');
    setSeleccionada(null);
    await load();
  }

  async function handleImportExcel(excelRows) {
    const warnings = [];
    let imported = 0;

    for (const [index, row] of excelRows.entries()) {
      const romana = resolveRomanaFromExcelRow(row, romanaRows);
      const registro = {
        ...mapExcelRowToAlmacenamiento(row),
        romana_id: romana?.id || mapExcelRowToAlmacenamiento(row).romana_id,
        laboratorio_id: romana?.laboratorio?.id || mapExcelRowToAlmacenamiento(row).laboratorio_id,
      };

      if (!registro.silo_bodega && !registro.responsable && !registro.romana_id) {
        warnings.push({ row: index + 2, reason: 'Fila sin datos de almacenamiento reconocibles.' });
        continue;
      }

      if (!registro.romana_id) {
        warnings.push({ row: index + 2, reason: 'No se encontro romana asociada por ID, patente o guia.' });
        continue;
      }

      await upsertAlmacenamiento(registro);
      imported += 1;
    }

    setImportWarnings(warnings);
    setMessage(`Se importaron ${imported} registros de almacenamiento correctamente.`);
    await load();
    return { imported, warnings };
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Almacenamiento</h1>
          <p className="text-sm text-slate-600">Asigna silo, bodega o destino a registros aprobados por laboratorio.</p>
        </div>
        <ImportExcelButton onImport={handleImportExcel} mode="almacenamiento" label="Importar Excel almacenamiento" />
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

      <AlmacenamientoForm
        aprobados={aprobados}
        selectedRomanaId={seleccionada?.id || ''}
        selectedLaboratorioId={seleccionada?.laboratorio?.id || laboratorioDesdeRuta?.id || ''}
        resumenSeleccionado={seleccionada}
        onRecepcionChange={handleSelectRecepcion}
        onSubmit={save}
      />
      <AlmacenamientoTable rows={almacenamientoRows} onGenerateOfficial={setFormularioRecord} />
      <FormularioPreviewModal recepcion={formularioRecord} open={Boolean(formularioRecord)} onClose={() => setFormularioRecord(null)} />
      <Toast message={message} onClose={() => setMessage('')} />
    </div>
  );
}
