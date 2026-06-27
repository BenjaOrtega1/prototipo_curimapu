import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const allowedHeaders = 'authorization, x-client-info, apikey, content-type';
const allowedMethods = 'GET, POST, PATCH, OPTIONS';
const validRoles = new Set(['admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta']);

type AnyRecord = Record<string, unknown>;

function requestId() {
  return crypto.randomUUID();
}

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
    'Access-Control-Allow-Headers': allowedHeaders,
    'Access-Control-Allow-Methods': allowedMethods,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}

function log(level: 'info' | 'error', id: string, message: string, data: AnyRecord = {}) {
  const safeData = redact(data);
  const line = `[admin-users][${id}] ${message} ${JSON.stringify(safeData)}`;
  if (level === 'error') console.error(line);
  else console.log(line);
}

function redact(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);

  return Object.fromEntries(Object.entries(value as AnyRecord).map(([key, next]) => {
    const lower = key.toLowerCase();
    if (lower.includes('password') || lower.includes('service_role') || lower.includes('key') || lower.includes('authorization')) {
      return [key, next ? '[REDACTED]' : next];
    }
    return [key, redact(next)];
  }));
}

function fail(req: Request, id: string, status: number, code: string, message: string, details?: unknown) {
  log('error', id, code, { status, message, details });
  return json(req, { error: message, code, details, requestId: id }, status);
}

function cleanText(value: unknown) {
  return String(value || '').trim();
}

function envStatus() {
  return {
    hasSupabaseUrl: Boolean(Deno.env.get('SUPABASE_URL')),
    hasAnonKey: Boolean(Deno.env.get('SUPABASE_ANON_KEY')),
    hasServiceRoleKey: Boolean(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')),
  };
}

function readRequiredEnv(req: Request, id: string, name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Response(JSON.stringify({
      error: `Falta variable ${name}.`,
      code: 'missing_env',
      details: name,
      requestId: id,
    }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  return value;
}

async function readBody(req: Request, id: string) {
  if (req.method === 'GET') return {};
  const raw = await req.json().catch((error) => {
    log('error', id, 'invalid json parse', { error: String(error) });
    return null;
  });
  if (!raw || typeof raw !== 'object') return null;
  return raw as AnyRecord;
}

async function getCaller(req: Request, id: string, supabaseUrl: string, anonKey: string) {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader) {
    return { response: fail(req, id, 401, 'missing_session', 'Sesion requerida. Falta header Authorization.') };
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: authData, error: authError } = await callerClient.auth.getUser();
  if (authError || !authData.user) {
    return {
      response: fail(req, id, 401, 'invalid_session', 'Sesion invalida o expirada.', authError),
    };
  }

  log('info', id, 'caller user', {
    userId: authData.user.id,
    email: authData.user.email,
  });

  const { data: callerProfile, error: profileError } = await callerClient
    .from('perfiles')
    .select('rol, role')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      response: fail(req, id, 500, 'profile_lookup_failed', 'No se pudo validar el perfil del usuario llamador.', profileError),
    };
  }

  const callerRole = callerProfile?.role || callerProfile?.rol || 'consulta';
  log('info', id, 'caller role', { role: callerRole, profile: callerProfile });

  if (callerRole !== 'desarrollador') {
    return {
      response: fail(req, id, 403, 'developer_required', 'Usuario no autorizado: el perfil debe tener role/rol = desarrollador.', { role: callerRole }),
    };
  }

  return { user: authData.user, role: callerRole };
}

async function listUsers(req: Request, id: string, adminClient: ReturnType<typeof createClient>) {
  log('info', id, 'list users start');

  const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) {
    return fail(req, id, 500, 'auth_users_list_failed', 'Error de Auth al listar usuarios.', usersError);
  }

  const { data: profiles, error: profilesError } = await adminClient
    .from('perfiles')
    .select('id, nombre, rol, role, created_at');
  if (profilesError) {
    return fail(req, id, 500, 'profiles_list_failed', 'Error al listar perfiles.', profilesError);
  }

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
  const users = (usersData.users || []).map((user) => {
    const profile = profileById.get(user.id);
    return {
      id: user.id,
      email: user.email,
      nombre: profile?.nombre || user.user_metadata?.nombre || '',
      rol: profile?.role || profile?.rol || user.user_metadata?.role || user.user_metadata?.rol || 'consulta',
      role: profile?.role || profile?.rol || user.user_metadata?.role || user.user_metadata?.rol || 'consulta',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    };
  });

  log('info', id, 'list users success', { count: users.length });
  return json(req, { users });
}

async function emailExists(adminClient: ReturnType<typeof createClient>, email: string) {
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return { error };
  const found = (data.users || []).find((user) => String(user.email || '').toLowerCase() === email.toLowerCase());
  return { exists: Boolean(found), user: found };
}

async function createUser(req: Request, id: string, adminClient: ReturnType<typeof createClient>, body: AnyRecord) {
  const email = cleanText(body.email).toLowerCase();
  const password = cleanText(body.password);
  const nombre = cleanText(body.nombre);
  const role = cleanText(body.role || body.rol) || 'consulta';

  log('info', id, 'create user payload', { action: body.action, email, nombre, role, hasPassword: Boolean(password) });

  if (!email) return fail(req, id, 400, 'missing_email', 'Payload incompleto: email requerido.');
  if (!email.includes('@')) return fail(req, id, 400, 'invalid_email', 'Correo invalido.');
  if (!password) return fail(req, id, 400, 'missing_password', 'Payload incompleto: password requerido.');
  if (password.length < 6) return fail(req, id, 400, 'weak_password', 'Contrasena invalida: minimo 6 caracteres.');
  if (!nombre) return fail(req, id, 400, 'missing_name', 'Payload incompleto: nombre requerido.');
  if (!validRoles.has(role)) return fail(req, id, 400, 'invalid_role', `Rol no valido: ${role}.`);

  const existsResult = await emailExists(adminClient, email);
  if (existsResult.error) {
    return fail(req, id, 500, 'auth_email_check_failed', 'Error de Auth al verificar si el correo existe.', existsResult.error);
  }
  if (existsResult.exists) {
    return fail(req, id, 409, 'email_already_exists', 'Correo ya registrado en Supabase Auth.', { email });
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return fail(req, id, 400, 'auth_user_create_failed', 'Error de Auth al crear usuario.', createError);
  }

  log('info', id, 'auth user created', { userId: created.user.id, email: created.user.email });

  const { error: metadataError } = await adminClient.auth.admin.updateUserById(created.user.id, {
    user_metadata: { nombre, rol: role, role },
  });

  if (metadataError) {
    return fail(req, id, 500, 'auth_metadata_update_failed', 'Usuario creado en Auth, pero fallo la actualizacion de metadata.', metadataError);
  }

  const { error: upsertError } = await adminClient
    .from('perfiles')
    .upsert({ id: created.user.id, nombre, rol: role, role }, { onConflict: 'id' });

  if (upsertError) {
    return fail(req, id, 500, 'profile_upsert_failed', 'Usuario creado en Auth, pero fallo la creacion/actualizacion del perfil.', upsertError);
  }

  log('info', id, 'profile upsert success', { userId: created.user.id, role });
  return json(req, { user: { id: created.user.id, email, nombre, rol: role, role } }, 201);
}

async function updateUser(req: Request, id: string, adminClient: ReturnType<typeof createClient>, body: AnyRecord) {
  const userId = cleanText(body.userId);
  const nombre = cleanText(body.nombre);
  const role = cleanText(body.role || body.rol);
  const password = cleanText(body.password);

  log('info', id, 'update user payload', { action: body.action, userId, nombre, role, hasPassword: Boolean(password) });

  if (!userId) return fail(req, id, 400, 'missing_user_id', 'Payload incompleto: userId requerido.');
  if (!nombre) return fail(req, id, 400, 'missing_name', 'Payload incompleto: nombre requerido.');
  if (!validRoles.has(role)) return fail(req, id, 400, 'invalid_role', `Rol no valido: ${role}.`);
  if (password && password.length < 6) return fail(req, id, 400, 'weak_password', 'Contrasena invalida: minimo 6 caracteres.');

  const updatePayload: AnyRecord = { user_metadata: { nombre, rol: role, role } };
  if (password) updatePayload.password = password;

  const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(userId, updatePayload);
  if (updateAuthError) {
    return fail(req, id, 400, 'auth_user_update_failed', 'Error de Auth al actualizar usuario.', updateAuthError);
  }

  const { error: updateProfileError } = await adminClient
    .from('perfiles')
    .upsert({ id: userId, nombre, rol: role, role }, { onConflict: 'id' });

  if (updateProfileError) {
    return fail(req, id, 500, 'profile_update_failed', 'Error al actualizar perfil.', updateProfileError);
  }

  log('info', id, 'update user success', { userId, role });
  return json(req, { user: { id: userId, nombre, rol: role, role } });
}

Deno.serve(async (req) => {
  const id = requestId();
  log('info', id, 'request received', {
    method: req.method,
    url: req.url,
    origin: req.headers.get('Origin'),
    hasAuthorization: Boolean(req.headers.get('Authorization')),
    hasApikey: Boolean(req.headers.get('apikey')),
  });

  if (req.method === 'OPTIONS') {
    log('info', id, 'cors preflight');
    return new Response('ok', { headers: corsHeaders(req) });
  }

  let body: AnyRecord | null = null;

  try {
    log('info', id, 'env status', envStatus());

    const supabaseUrl = readRequiredEnv(req, id, 'SUPABASE_URL');
    const anonKey = readRequiredEnv(req, id, 'SUPABASE_ANON_KEY');
    const serviceRoleKey = readRequiredEnv(req, id, 'SUPABASE_SERVICE_ROLE_KEY');

    log('info', id, 'admin client key source', { usingServiceRoleKey: serviceRoleKey !== anonKey });
    if (serviceRoleKey === anonKey) {
      return fail(req, id, 500, 'service_role_misconfigured', 'SUPABASE_SERVICE_ROLE_KEY no puede ser igual a SUPABASE_ANON_KEY.');
    }

    body = await readBody(req, id);
    if (body === null) {
      return fail(req, id, 400, 'invalid_json', 'Error de payload: el body no es JSON valido.');
    }
    log('info', id, 'body received', body);

    const caller = await getCaller(req, id, supabaseUrl, anonKey);
    if ('response' in caller) return caller.response;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const action = cleanText(body.action);
    if (req.method === 'GET' || action === 'list') return await listUsers(req, id, adminClient);
    if (req.method === 'POST' && (!action || action === 'create')) return await createUser(req, id, adminClient, body);
    if ((req.method === 'POST' || req.method === 'PATCH') && action === 'update') return await updateUser(req, id, adminClient, body);
    if (req.method === 'PATCH' && !action) return await updateUser(req, id, adminClient, body);

    return fail(req, id, 405, 'method_or_action_not_allowed', 'Metodo o action no permitido.', { method: req.method, action });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(req, id, 500, 'unexpected_error', 'Error inesperado en admin-users.', error);
  }
});
