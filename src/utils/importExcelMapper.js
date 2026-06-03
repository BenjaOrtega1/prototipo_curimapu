export function getValue(row, keys) {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
  );

  for (const key of keys) {
    const value = normalized[normalizeKey(key)];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

export function normalizeDate(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const slashDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashDate) {
    const [, day, month, year] = slashDate;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const excelSerial = Number(text);
  if (Number.isFinite(excelSerial) && excelSerial > 20000) {
    const date = new Date((excelSerial - 25569) * 86400 * 1000);
    return date.toISOString().slice(0, 10);
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

export function normalizeTime(value) {
  if (!value) return '';
  const text = String(value).trim();
  const time = text.match(/(\d{1,2}):(\d{2})/);
  if (time) return `${time[1].padStart(2, '0')}:${time[2]}`;

  const excelTime = Number(text);
  if (Number.isFinite(excelTime) && excelTime > 0 && excelTime < 1) {
    const totalMinutes = Math.round(excelTime * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return '';
}

export function parseNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const normalized = String(value)
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapExcelRowToLaboratorio(row, romanaId = null) {
  return {
    romana_id: romanaId || getValue(row, [
      'romana_id',
      'Recepción asociada',
      'Recepcion asociada',
      'ID romana',
      'ID recepción',
      'ID recepcion',
    ]),
    numero_lote: getValue(row, ['N° lote recepción', 'N lote recepción', 'N° lote', 'N lote', 'Lote', 'numero_lote']),
    fecha_muestreo: normalizeDate(getValue(row, ['Fecha muestreo', 'fecha_muestreo'])),
    hora_muestreo: normalizeTime(getValue(row, ['Hora muestreo', 'hora_muestreo'])),
    fecha_analisis: normalizeDate(getValue(row, ['Fecha análisis', 'Fecha analisis', 'fecha_analisis'])),
    hora_analisis: normalizeTime(getValue(row, ['Hora análisis', 'Hora analisis', 'hora_analisis'])),
    laboratorio_ensayo: getValue(row, ['Laboratorio ensayo', 'laboratorio_ensayo']),
    correlativo_muestra: getValue(row, ['N° correlativo muestra', 'N correlativo muestra', 'Correlativo muestra', 'correlativo_muestra']),
    producto: getValue(row, ['Producto', 'producto']),
    resultado: normalizeResultado(getValue(row, ['Resultado', 'resultado']) || 'Aprobado'),
    humedad: parseNumber(getValue(row, ['% humedad', 'Humedad', 'humedad'])),
    proteina: parseNumber(getValue(row, ['% proteína', '% proteina', 'Proteína', 'Proteina', 'proteina'])),
    gluten: parseNumber(getValue(row, ['% gluten corregido al 14%', 'Gluten', 'gluten'])),
    gluten_index: parseNumber(getValue(row, ['Gluten index', 'gluten_index'])),
    peso_hectolitro: parseNumber(getValue(row, ['Peso hectolitro', 'peso_hectolitro'])),
    falling_number: parseNumber(getValue(row, ['Falling number', 'falling_number'])),
    peso_1000_granos: parseNumber(getValue(row, ['Peso 1000 granos', 'peso_1000_granos'])),
    sedimentacion: parseNumber(getValue(row, ['Valor sedimentación', 'Valor sedimentacion', 'sedimentacion'])),
    impurezas: parseNumber(getValue(row, ['% impurezas', 'Impurezas', 'impurezas'])),
    granos_partidos: parseNumber(getValue(row, ['% granos partidos', 'Granos partidos', 'granos_partidos'])),
    granos_quebrados_chupados: parseNumber(getValue(row, ['% granos quebrados/chupados', 'Granos quebrados/chupados', 'granos_quebrados_chupados'])),
    granos_danados: parseNumber(getValue(row, ['% granos dañados', '% granos danados', 'Granos dañados', 'Granos danados', 'granos_danados'])),
    granos_brotados: parseNumber(getValue(row, ['% granos brotados', 'Granos brotados', 'granos_brotados'])),
    hongos: parseNumber(getValue(row, ['% hongos', 'Hongos', 'hongos'])),
    otros: getValue(row, ['Otros', 'otros']),
    observaciones_laboratorio: getValue(row, ['Observaciones laboratorio', 'Observaciones', 'observaciones_laboratorio']),
  };
}

export function mapExcelRowToAlmacenamiento(row) {
  return {
    romana_id: getValue(row, [
      'romana_id',
      'Recepción asociada',
      'Recepcion asociada',
      'ID romana',
      'ID recepción',
      'ID recepcion',
    ]),
    laboratorio_id: getValue(row, ['laboratorio_id', 'ID laboratorio']) || null,
    destino: normalizeDestino(getValue(row, ['Destino', 'destino']) || 'almacenamiento'),
    silo_bodega: getValue(row, ['Silo o bodega N°', 'Silo o bodega N', 'Silo/Bodega', 'Silo bodega', 'silo_bodega']),
    sector: getValue(row, ['Sector', 'sector']),
    fecha_ingreso: normalizeDate(getValue(row, ['Fecha ingreso almacenamiento', 'Fecha ingreso', 'fecha_ingreso'])),
    hora_ingreso: normalizeTime(getValue(row, ['Hora ingreso almacenamiento', 'Hora ingreso', 'hora_ingreso'])),
    responsable: getValue(row, ['Responsable', 'responsable']),
    estado_almacenamiento: normalizeEstadoAlmacenamiento(getValue(row, ['Estado almacenamiento', 'estado_almacenamiento']) || 'En silo'),
    observaciones: getValue(row, ['Observaciones', 'observaciones']),
  };
}

export function resolveRomanaFromExcelRow(row, romanaRows) {
  const romanaId = getValue(row, ['romana_id', 'ID romana', 'ID recepción', 'ID recepcion']);
  if (romanaId) return romanaRows.find((item) => item.id === romanaId);

  const patente = getValue(row, ['Patente', 'patente']);
  const guia = getValue(row, ['N° guía despacho', 'N guia despacho', 'numero_guia_despacho', 'Guía', 'Guia']);
  return romanaRows.find((item) => (
    (patente && String(item.patente).toLowerCase() === patente.toLowerCase())
    || (guia && String(item.numero_guia_despacho).toLowerCase() === guia.toLowerCase())
  ));
}

function normalizeKey(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[°º#]/g, '')
    .replace(/[^a-zA-Z0-9%]+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeResultado(value) {
  const text = normalizeKey(value);
  if (text.includes('rechaz')) return 'Rechazado';
  return 'Aprobado';
}

function normalizeDestino(value) {
  const text = normalizeKey(value);
  if (text.includes('venta')) return 'venta';
  if (text.includes('guarda')) return 'guarda';
  return 'almacenamiento';
}

function normalizeEstadoAlmacenamiento(value) {
  const text = normalizeKey(value);
  if (text.includes('bodega')) return 'En bodega';
  if (text.includes('despach')) return 'Despachado';
  if (text.includes('espera')) return 'En espera';
  return 'En silo';
}
