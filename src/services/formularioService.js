import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStore, setStore, uid } from './localStore';

const START_CORRELATIVO = 5083;

export async function createDocumentoCurimapu(romanaId) {
  if (isSupabaseConfigured) {
    const { data: last, error: lastError } = await supabase
      .from('documentos_curimapu')
      .select('correlativo')
      .order('correlativo', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError) throw lastError;

    const correlativo = Number(last?.correlativo || START_CORRELATIVO - 1) + 1;
    const { data, error } = await supabase
      .from('documentos_curimapu')
      .insert({ correlativo, romana_id: romanaId })
      .select()
      .single();

    if (error) throw error;
    return { ...data, numero: formatNumeroDocumento(data.correlativo) };
  }

  const store = getStore();
  const documentos = store.documentos_curimapu || [];
  const last = documentos.reduce((max, item) => Math.max(max, Number(item.correlativo || 0)), START_CORRELATIVO - 1);
  const documento = {
    id: uid('doc'),
    correlativo: last + 1,
    romana_id: romanaId,
    created_at: new Date().toISOString(),
  };

  setStore({ ...store, documentos_curimapu: [...documentos, documento] });
  return { ...documento, numero: formatNumeroDocumento(documento.correlativo) };
}

export function formatNumeroDocumento(correlativo) {
  return String(correlativo).padStart(6, '0');
}
