export const humedadAlerta = Number(import.meta.env.VITE_HUMEDAD_ALERTA || 14.5);

export function number(value, decimals = 0) {
  const parsed = Number(value || 0);
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(parsed);
}

export function monthName(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(new Date(`${date}T00:00:00`));
}

export function isIncomplete(recepcion) {
  const required = ['proveedor_id', 'producto', 'fecha_recepcion', 'peso_bruto', 'tara', 'patente_camion'];
  return required.some((field) => !recepcion?.[field]);
}

export function statusLabel(recepcion) {
  if (isIncomplete(recepcion)) return 'Incompleto';
  return recepcion.estado || 'Pendiente';
}
