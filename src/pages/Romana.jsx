import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImportExcelButton from '../components/ImportExcelButton.jsx';
import FormularioPreviewModal from '../components/FormularioPreviewModal.jsx';
import RomanaForm from '../components/RomanaForm.jsx';
import RomanaTable from '../components/RomanaTable.jsx';
import Toast from '../components/Toast.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { importExcelRows } from '../services/importExcelService';
import { upsertProveedor } from '../services/proveedorService';
import { deleteRomana, listRomana, upsertRomana } from '../services/romanaService';

export default function Romana() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canWriteRomana = can('romana:write');
  const canWriteLaboratorio = can('laboratorio:write');
  const canWriteDocuments = can('documentos:write');
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [importWarnings, setImportWarnings] = useState([]);
  const [message, setMessage] = useState('');
  const [formularioRecord, setFormularioRecord] = useState(null);

  async function load() {
    setRows(await listRomana());
  }

  useEffect(() => {
    load();
  }, []);

  async function save(form) {
    if (!canWriteRomana) return;
    const proveedor = await upsertProveedor({
      nombre: form.proveedor_nombre,
      rut: form.rut_proveedor,
    });
    await upsertRomana({
      ...form,
      proveedor_id: proveedor.id,
      proveedor_nombre: proveedor.nombre,
    });
    setEditing(null);
    setMessage('Ingreso de romana guardado correctamente.');
    load();
  }

  async function remove(id) {
    if (!canWriteRomana) return;
    if (window.confirm('Eliminar este ingreso de romana?')) {
      await deleteRomana(id);
      load();
    }
  }

  function sendLab(row) {
    navigate('/laboratorio', {
      state: {
        romanaSeleccionada: row,
      },
    });
  }

  async function handleImportExcel(excelRows, options) {
    if (!canWriteRomana) return { imported: 0, warnings: [{ row: '-', reason: 'No tienes permiso para importar registros de romana.' }] };
    const result = await importExcelRows(excelRows, options);
    setImportWarnings(result.warnings || []);
    await load();
    return result;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Romana / Pesaje</h1>
          <p className="text-sm text-slate-600">Registra patente, chofer, proveedor, guia y peso de entrada.</p>
        </div>
        {canWriteRomana && <ImportExcelButton onImport={handleImportExcel} mode="romana" label="Importar Excel" />}
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

      {canWriteRomana && <RomanaForm value={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      <RomanaTable
        rows={rows}
        canEdit={canWriteRomana}
        canDelete={canWriteRomana}
        canSendLab={canWriteLaboratorio}
        canGenerateOfficial={canWriteDocuments}
        onEdit={setEditing}
        onDelete={remove}
        onSendLab={sendLab}
        onGenerateOfficial={setFormularioRecord}
      />
      <FormularioPreviewModal recepcion={formularioRecord} open={Boolean(formularioRecord)} onClose={() => setFormularioRecord(null)} />
      <Toast message={message} onClose={() => setMessage('')} />
    </div>
  );
}
