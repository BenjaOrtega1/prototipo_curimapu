import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStore, setStore, shouldUseRemote, uid } from './localStore';

export async function listRecepciones() {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase
      .from('recepciones')
      .select('*, proveedores(*), analisis(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  const store = getStore();
  return store.recepciones.map((recepcion) => ({
    ...recepcion,
    proveedores: store.proveedores.find((proveedor) => proveedor.id === recepcion.proveedor_id),
    analisis: store.analisis.filter((item) => item.recepcion_id === recepcion.id),
  }));
}

export async function getRecepcion(id) {
  const records = await listRecepciones();
  return records.find((item) => item.id === id);
}

export async function upsertRecepcion(payload) {
  const kilosNetos = Number(payload.peso_bruto || 0) - Number(payload.tara || 0);
  const record = {
    ...payload,
    kilos_netos: kilosNetos > 0 ? kilosNetos : Number(payload.kilos_netos || 0),
  };

  if (isSupabaseConfigured && shouldUseRemote()) {
    // Supabase calcula kilos_netos como columna generada; se omite para evitar errores de escritura.
    const { kilos_netos, ...supabaseRecord } = record;
    const { data, error } = await supabase.from('recepciones').upsert(supabaseRecord).select().single();
    if (error) throw error;
    return data;
  }
  const store = getStore();
  const recepcion = {
    id: record.id || uid('rec'),
    created_at: record.created_at || new Date().toISOString(),
    ...record,
  };
  const exists = store.recepciones.some((item) => item.id === recepcion.id);
  const recepciones = exists
    ? store.recepciones.map((item) => (item.id === recepcion.id ? recepcion : item))
    : [recepcion, ...store.recepciones];
  setStore({ ...store, recepciones });
  return recepcion;
}

export async function deleteRecepcion(id) {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { error } = await supabase.from('recepciones').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const store = getStore();
  setStore({
    ...store,
    recepciones: store.recepciones.filter((item) => item.id !== id),
    analisis: store.analisis.filter((item) => item.recepcion_id !== id),
  });
}
