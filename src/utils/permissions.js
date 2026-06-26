export const roles = {
  admin: {
    label: 'admin',
    permissions: [
      'romana:read',
      'romana:write',
      'laboratorio:read',
      'laboratorio:write',
      'almacenamiento:read',
      'almacenamiento:write',
      'planilla:read',
      'documentos:write',
      'usuarios:admin',
      'auditoria:read',
    ],
  },
  desarrollador: {
    label: 'desarrollador',
    permissions: [
      'romana:read',
      'romana:write',
      'laboratorio:read',
      'laboratorio:write',
      'almacenamiento:read',
      'almacenamiento:write',
      'planilla:read',
      'documentos:write',
      'usuarios:admin',
      'auditoria:read',
    ],
  },
  romana: {
    label: 'romana',
    permissions: ['romana:read', 'romana:write', 'laboratorio:read', 'almacenamiento:read', 'planilla:read', 'documentos:write'],
  },
  laboratorio: {
    label: 'laboratorio',
    permissions: ['romana:read', 'laboratorio:read', 'laboratorio:write', 'almacenamiento:read', 'planilla:read', 'documentos:write'],
  },
  almacenamiento: {
    label: 'almacenamiento',
    permissions: ['romana:read', 'laboratorio:read', 'almacenamiento:read', 'almacenamiento:write', 'planilla:read', 'documentos:write'],
  },
  consulta: {
    label: 'consulta',
    permissions: ['romana:read', 'laboratorio:read', 'almacenamiento:read', 'planilla:read'],
  },
};

export function normalizeRole(role) {
  const value = String(role || 'consulta').trim().toLowerCase();
  if (['admin', 'administrador'].includes(value)) return 'admin';
  if (['desarrollador', 'developer', 'dev', 'informatica', 'informatico', 'it'].includes(value)) return 'desarrollador';
  if (['romana', 'pesaje', 'operador_romana'].includes(value)) return 'romana';
  if (['laboratorio', 'lab', 'operador_laboratorio'].includes(value)) return 'laboratorio';
  if (['almacenamiento', 'bodega', 'silo', 'operador_almacenamiento'].includes(value)) return 'almacenamiento';
  return 'consulta';
}

export function getRoleCapabilities(role) {
  return roles[normalizeRole(role)]?.permissions || roles.consulta.permissions;
}

export function roleLabel(role) {
  return roles[normalizeRole(role)]?.label || roles.consulta.label;
}
