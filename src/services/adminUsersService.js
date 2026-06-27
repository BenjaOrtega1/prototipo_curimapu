import { isSupabaseConfigured, supabase } from '../lib/supabase';

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no esta configurado para administrar usuarios.');
  }
}

async function readFunctionError(error) {
  if (!error) return 'No se pudo completar la accion.';

  const context = error.context;
  const status = context?.status ? `HTTP ${context.status}: ` : '';

  if (context?.json) {
    try {
      const payload = await context.json();
      const suffix = payload?.requestId ? ` Codigo: ${payload.requestId}` : '';
      const code = payload?.code ? ` (${payload.code})` : '';
      const details = payload?.details ? ` Detalle: ${typeof payload.details === 'string' ? payload.details : JSON.stringify(payload.details)}` : '';
      return `${status}${payload?.error || error.message || 'Error de funcion.'}${code}.${details}${suffix}`;
    } catch {
      return error.message || 'Error de funcion.';
    }
  }

  if (context?.text) {
    try {
      const text = await context.text();
      return `${status}${text || error.message || 'Error de funcion.'}`;
    } catch {
      return error.message || 'Error de funcion.';
    }
  }

  return `${status}${error.message || 'No se pudo completar la accion.'}`;
}

async function unwrap(result) {
  if (result.error) {
    throw new Error(await readFunctionError(result.error));
  }
  return result.data;
}

export async function listAdminUsers() {
  ensureSupabase();
  return await unwrap(await supabase.functions.invoke('admin-users', {
    method: 'POST',
    body: { action: 'list' },
  }));
}

export async function createAdminUser(payload) {
  ensureSupabase();
  return await unwrap(await supabase.functions.invoke('admin-users', {
    method: 'POST',
    body: { action: 'create', ...payload },
  }));
}

export async function updateAdminUser(userId, payload) {
  ensureSupabase();
  return await unwrap(await supabase.functions.invoke('admin-users', {
    method: 'POST',
    body: { action: 'update', userId, ...payload },
  }));
}
