import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { shouldUseRemote } from './localStore';
import { getStore, setStore } from './localStore';

export async function getConfiguracion() {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase.from('configuracion').select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }
  return getStore().configuracion;
}

export async function saveConfiguracion(payload) {
  if (isSupabaseConfigured && shouldUseRemote()) {
    const { data, error } = await supabase.from('configuracion').upsert(payload).select().single();
    if (error) throw error;
    return data;
  }
  const store = getStore();
  const configuracion = { ...store.configuracion, ...payload };
  setStore({ ...store, configuracion });
  return configuracion;
}
