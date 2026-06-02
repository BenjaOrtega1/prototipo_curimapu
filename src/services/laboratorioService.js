import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStore, setStore, uid } from './localStore';
import { updateRomanaEstado } from './romanaService';

export async function listLaboratorio() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('laboratorio').select('*, romana(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  const store = getStore();
  return store.laboratorio.map((lab) => ({
    ...lab,
    romana: store.romana.find((item) => item.id === lab.romana_id),
  }));
}

export async function upsertLaboratorio(payload) {
  const estado = payload.resultado === 'Rechazado' ? 'Rechazado' : 'Pendiente de almacenamiento';
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('laboratorio').upsert(payload).select().single();
    if (error) throw error;
    await updateRomanaEstado(payload.romana_id, estado);
    return data;
  }
  const store = getStore();
  const laboratorio = {
    id: payload.id || uid('lab'),
    created_at: payload.created_at || new Date().toISOString(),
    ...payload,
  };
  const exists = store.laboratorio.some((item) => item.id === laboratorio.id);
  const laboratorioRows = exists
    ? store.laboratorio.map((item) => (item.id === laboratorio.id ? laboratorio : item))
    : [laboratorio, ...store.laboratorio];
  const romana = store.romana.map((item) => (item.id === payload.romana_id ? { ...item, estado } : item));
  setStore({ ...store, laboratorio: laboratorioRows, romana });
  return laboratorio;
}
