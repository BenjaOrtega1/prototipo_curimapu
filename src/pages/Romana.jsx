import { useEffect, useState } from 'react';
import RomanaForm from '../components/RomanaForm.jsx';
import RomanaTable from '../components/RomanaTable.jsx';
import { upsertProveedor } from '../services/proveedorService';
import { deleteRomana, listRomana, upsertRomana } from '../services/romanaService';

export default function Romana() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    setRows(await listRomana());
  }

  useEffect(() => {
    load();
  }, []);

  async function save(form) {
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
    load();
  }

  async function remove(id) {
    if (window.confirm('¿Eliminar este ingreso de romana?')) {
      await deleteRomana(id);
      load();
    }
  }

  function sendLab(row) {
    window.location.href = `/laboratorio?romana=${row.id}`;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Romana / Pesaje</h1>
        <p className="text-sm text-slate-600">Registra patente, chofer, proveedor, guía y peso de entrada.</p>
      </div>
      <RomanaForm value={editing} onSubmit={save} />
      <RomanaTable rows={rows} onEdit={setEditing} onDelete={remove} onSendLab={sendLab} />
    </div>
  );
}
