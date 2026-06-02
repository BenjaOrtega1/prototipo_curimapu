import { useEffect, useState } from 'react';
import AlmacenamientoForm from '../components/AlmacenamientoForm.jsx';
import AlmacenamientoTable from '../components/AlmacenamientoTable.jsx';
import { listAlmacenamiento, upsertAlmacenamiento } from '../services/almacenamientoService';
import { listRomana } from '../services/romanaService';

export default function Almacenamiento() {
  const [romanaRows, setRomanaRows] = useState([]);
  const [almacenamientoRows, setAlmacenamientoRows] = useState([]);

  async function load() {
    setRomanaRows(await listRomana());
    setAlmacenamientoRows(await listAlmacenamiento());
  }

  useEffect(() => {
    load();
  }, []);

  const aprobados = romanaRows.filter((row) => row.estado === 'Pendiente de almacenamiento' && row.laboratorio?.resultado === 'Aprobado');

  async function save(form) {
    await upsertAlmacenamiento(form);
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Almacenamiento</h1>
        <p className="text-sm text-slate-600">Asigna silo, bodega o destino a registros aprobados por laboratorio.</p>
      </div>
      <AlmacenamientoForm aprobados={aprobados} onSubmit={save} />
      <AlmacenamientoTable rows={almacenamientoRows} />
    </div>
  );
}
