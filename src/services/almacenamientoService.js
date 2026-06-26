import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStore, setStore, shouldUseRemote, uid } from './localStore';
import { updateRomanaEstado } from './romanaService';

export async function listAlmacenamiento() {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase.from('almacenamiento').select('*, romana(*), laboratorio(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  const store = getStore();
  return store.almacenamiento.map((alm) => ({
    ...alm,
    romana: store.romana.find((item) => item.id === alm.romana_id),
    laboratorio: store.laboratorio.find((item) => item.id === alm.laboratorio_id),
  }));
}

export async function upsertAlmacenamiento(payload) {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase.from('almacenamiento').upsert(payload, { onConflict: 'romana_id' }).select().single();
    if (error) throw error;
    await updateRomanaEstado(payload.romana_id, payload.estado_almacenamiento || 'En silo');
    return data;
  }
  const store = getStore();
  const almacenamiento = {
    id: payload.id || uid('alm'),
    created_at: payload.created_at || new Date().toISOString(),
    ...payload,
  };
  const exists = store.almacenamiento.some((item) => item.id === almacenamiento.id || item.romana_id === almacenamiento.romana_id);
  const almacenamientoRows = exists
    ? store.almacenamiento.map((item) => (item.id === almacenamiento.id || item.romana_id === almacenamiento.romana_id ? { ...item, ...almacenamiento, id: item.id || almacenamiento.id } : item))
    : [almacenamiento, ...store.almacenamiento];
  const romana = store.romana.map((item) => (
    item.id === payload.romana_id ? { ...item, estado: payload.estado_almacenamiento || 'En silo' } : item
  ));
  setStore({ ...store, almacenamiento: almacenamientoRows, romana });
  return almacenamiento;
}

export const createAlmacenamiento = upsertAlmacenamiento;
export const create = upsertAlmacenamiento;
