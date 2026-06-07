import { isSupabaseConfigured, supabase } from '../lib/supabase';

const STORAGE_KEY = 'curimapu_documentos';
const START_CORRELATIVO = 5083;

function readLocal() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function writeLocal(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export async function getNextCorrelativo() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('documentos_curimapu')
      .select('correlativo')
      .order('correlativo', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return Number(data?.correlativo || START_CORRELATIVO - 1) + 1;
  }

  const last = readLocal().reduce((max, item) => Math.max(max, Number(item.correlativo || 0)), START_CORRELATIVO - 1);
  return last + 1;
}

export async function saveDocumentoMetadata(payload) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('documentos_curimapu').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  const rows = readLocal();
  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  };
  writeLocal([record, ...rows]);
  return record;
}

export async function listDocumentosByRomanaId(romanaId) {
  if (!romanaId) return [];
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('documentos_curimapu')
      .select('*')
      .eq('romana_id', romanaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return readLocal().filter((item) => item.romana_id === romanaId);
}

export async function getDocumentoById(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('documentos_curimapu').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
  return readLocal().find((item) => item.id === id);
}

export async function deleteDocumento(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('documentos_curimapu').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  writeLocal(readLocal().filter((item) => item.id !== id));
}

export function formatCorrelativo(correlativo) {
  return String(correlativo).padStart(6, '0');
}
