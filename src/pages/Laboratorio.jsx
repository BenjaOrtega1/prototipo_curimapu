import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LaboratorioForm from '../components/LaboratorioForm.jsx';
import LaboratorioTable from '../components/LaboratorioTable.jsx';
import { listLaboratorio, upsertLaboratorio } from '../services/laboratorioService';
import { listRomana } from '../services/romanaService';

export default function Laboratorio() {
  const [params] = useSearchParams();
  const [romanaRows, setRomanaRows] = useState([]);
  const [laboratorioRows, setLaboratorioRows] = useState([]);

  async function load() {
    setRomanaRows(await listRomana());
    setLaboratorioRows(await listLaboratorio());
  }

  useEffect(() => {
    load();
  }, []);

  const pendientes = romanaRows.filter((row) => row.estado === 'Pendiente de laboratorio');

  async function save(form) {
    await upsertLaboratorio(form);
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Laboratorio / Análisis</h1>
        <p className="text-sm text-slate-600">Recibe registros desde romana y define aprobación o rechazo.</p>
      </div>
      <LaboratorioForm pendientes={pendientes} selectedRomanaId={params.get('romana')} onSubmit={save} />
      <LaboratorioTable rows={laboratorioRows} />
    </div>
  );
}
