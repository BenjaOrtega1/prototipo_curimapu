import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStore, setStore, shouldUseRemote, uid } from './localStore';

export async function listProveedores() {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase.from('proveedores').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return getStore().proveedores;
}

export async function upsertProveedor(payload) {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase.from('proveedores').upsert(payload).select().single();
    if (error) throw error;
    return data;
  }
  const store = getStore();
  const proveedor = {
    id: payload.id || uid('prov'),
    created_at: payload.created_at || new Date().toISOString(),
    ...payload,
  };
  const exists = store.proveedores.some((item) => item.id === proveedor.id);
  const proveedores = exists
    ? store.proveedores.map((item) => (item.id === proveedor.id ? proveedor : item))
    : [proveedor, ...store.proveedores];
  setStore({ ...store, proveedores });
  return proveedor;
}
