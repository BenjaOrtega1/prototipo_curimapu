import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { composeRecords, getStore, setStore, uid } from './localStore';

export async function listRomana() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('romana')
      .select('*, proveedores(*), laboratorio(*), almacenamiento(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      ...row,
      proveedor: row.proveedores,
      laboratorio: Array.isArray(row.laboratorio) ? row.laboratorio[0] : row.laboratorio,
      almacenamiento: Array.isArray(row.almacenamiento) ? row.almacenamiento[0] : row.almacenamiento,
    }));
  }
  return composeRecords().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function upsertRomana(payload) {
  const record = {
    estado: 'Pendiente de laboratorio',
    ...payload,
  };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('romana').upsert(record).select().single();
    if (error) throw error;
    return data;
  }
  const store = getStore();
  const romana = {
    id: record.id || uid('rom'),
    created_at: record.created_at || new Date().toISOString(),
    ...record,
  };
  const exists = store.romana.some((item) => item.id === romana.id);
  const romanaRows = exists
    ? store.romana.map((item) => (item.id === romana.id ? romana : item))
    : [romana, ...store.romana];
  setStore({ ...store, romana: romanaRows });
  return romana;
}

export async function updateRomanaEstado(id, estado) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('romana').update({ estado }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const store = getStore();
  const romana = store.romana.map((item) => (item.id === id ? { ...item, estado } : item));
  setStore({ ...store, romana });
}

export async function deleteRomana(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('romana').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const store = getStore();
  setStore({
    ...store,
    romana: store.romana.filter((item) => item.id !== id),
    laboratorio: store.laboratorio.filter((item) => item.romana_id !== id),
    almacenamiento: store.almacenamiento.filter((item) => item.romana_id !== id),
  });
}
