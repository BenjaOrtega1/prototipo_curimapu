import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStore, setStore, shouldUseRemote, uid } from './localStore';

export async function upsertAnalisis(payload) {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase.from('analisis').upsert(payload).select().single();
    if (error) throw error;
    return data;
  }
  const store = getStore();
  const analisis = {
    id: payload.id || uid('ana'),
    created_at: payload.created_at || new Date().toISOString(),
    ...payload,
  };
  const exists = store.analisis.some((item) => item.id === analisis.id);
  const next = exists
    ? store.analisis.map((item) => (item.id === analisis.id ? analisis : item))
    : [analisis, ...store.analisis];
  setStore({ ...store, analisis: next });
  return analisis;
}
