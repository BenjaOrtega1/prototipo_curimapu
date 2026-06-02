import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnalisisForm from '../components/AnalisisForm.jsx';
import FlujoRecepcion from '../components/FlujoRecepcion.jsx';
import RecepcionForm from '../components/RecepcionForm.jsx';
import { upsertAnalisis } from '../services/analisisService';
import { listProveedores, upsertProveedor } from '../services/proveedorService';
import { getRecepcion, upsertRecepcion } from '../services/recepcionService';

export default function NuevaRecepcion() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editId = params.get('id');
  const [proveedores, setProveedores] = useState([]);
  const [recepcion, setRecepcion] = useState(null);
  const [savedRecepcion, setSavedRecepcion] = useState(null);

  useEffect(() => {
    listProveedores().then(setProveedores);
    if (editId) getRecepcion(editId).then((item) => {
      setRecepcion({ ...item, ...(item.proveedores || {}) });
      setSavedRecepcion(item);
    });
  }, [editId]);

  const analisis = useMemo(() => savedRecepcion?.analisis?.[0], [savedRecepcion]);

  async function saveRecepcion(form) {
    let proveedorId = form.proveedor_id;
    if (!proveedorId) {
      const proveedor = await upsertProveedor({
        nombre: form.nombre,
        rut: form.rut,
        celular: form.celular,
        email: form.email,
        direccion: form.direccion,
        ciudad: form.ciudad,
        comuna: form.comuna,
      });
      proveedorId = proveedor.id;
      setProveedores(await listProveedores());
    }

    const saved = await upsertRecepcion({
      id: editId || form.id,
      proveedor_id: proveedorId,
      producto: form.producto,
      fecha_recepcion: form.fecha_recepcion,
      hora_recepcion: form.hora_recepcion,
      predio_origen: form.predio_origen,
      guia_despacho: form.guia_despacho,
      peso_bruto: form.peso_bruto,
      tara: form.tara,
      kilos_netos: form.kilos_netos,
      patente_camion: form.patente_camion,
      patente_carro: form.patente_carro,
      empresa_transporte: form.empresa_transporte,
      nombre_chofer: form.nombre_chofer,
      rut_chofer: form.rut_chofer,
      estado: form.estado,
      etapa_actual: form.etapa_actual,
      observaciones: form.observaciones,
    });
    const full = await getRecepcion(saved.id);
    setSavedRecepcion(full || saved);
    setRecepcion({ ...form, id: saved.id, proveedor_id: proveedorId });
  }

  async function saveAnalisis(form) {
    if (!savedRecepcion?.id && !recepcion?.id) return;
    await upsertAnalisis({ ...form, id: analisis?.id, recepcion_id: savedRecepcion?.id || recepcion.id });
    navigate(`/recepciones/${savedRecepcion?.id || recepcion.id}`);
  }

  function setEtapa(etapa) {
    setRecepcion((current) => ({ ...current, etapa_actual: etapa }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">{editId ? 'Editar recepción' : 'Nueva recepción'}</h1>
        <p className="text-sm text-slate-600">Completa una sola ficha digital para evitar doble digitación y fichas físicas dispersas.</p>
      </div>
      <RecepcionForm proveedores={proveedores} value={recepcion} onSubmit={saveRecepcion} />
      <FlujoRecepcion etapaActual={recepcion?.etapa_actual || savedRecepcion?.etapa_actual} onChange={setEtapa} />
      {(savedRecepcion || recepcion?.id) && (
        <AnalisisForm value={analisis} recepcionId={savedRecepcion?.id || recepcion.id} onSubmit={saveAnalisis} />
      )}
      {!savedRecepcion && !recepcion?.id && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Guarda primero la recepción para habilitar el análisis de laboratorio asociado.
        </div>
      )}
    </div>
  );
}
