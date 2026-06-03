import { upsertAlmacenamiento } from './almacenamientoService';
import { upsertLaboratorio } from './laboratorioService';
import { upsertProveedor } from './proveedorService';
import { upsertRomana } from './romanaService';

const aliases = {
  patente: ['patente', 'patente camion', 'patente camión', 'camion', 'camión'],
  chofer: ['chofer', 'conductor', 'nombre chofer'],
  rut_chofer: ['rut chofer', 'rut conductor'],
  proveedor: ['proveedor', 'nombre proveedor', 'productor'],
  rut_proveedor: ['rut proveedor', 'rut productor'],
  guia_despacho: ['guia despacho', 'guía despacho', 'tipo guia', 'tipo guía', 'documento'],
  numero_guia_despacho: ['n guia despacho', 'n° guia despacho', 'n° guía despacho', 'numero guia despacho', 'numero guía despacho', 'n guia', 'n° guia', 'guia', 'guía'],
  peso_entrada: ['peso entrada', 'peso', 'kilos', 'kg', 'peso bruto', 'total kilos'],
  fecha_ingreso: ['fecha ingreso', 'fecha recepcion', 'fecha recepción', 'fecha'],
  hora_ingreso: ['hora ingreso', 'hora recepcion', 'hora recepción', 'hora'],
  empresa_transporte: ['empresa transporte', 'transporte', 'transportista'],
  observaciones: ['observaciones', 'observacion', 'observación'],
  producto: ['producto', 'nombre producto', 'tipo producto', 'cereal'],
  numero_lote: ['n lote', 'n° lote', 'numero lote', 'lote', 'rp', 'rpn°', 'rp n°'],
  fecha_muestreo: ['fecha muestreo'],
  hora_muestreo: ['hora muestreo'],
  fecha_analisis: ['fecha analisis', 'fecha análisis'],
  hora_analisis: ['hora analisis', 'hora análisis'],
  laboratorio_ensayo: ['laboratorio ensayo', 'laboratorio'],
  correlativo_muestra: ['correlativo muestra', 'n muestra', 'n° muestra', 'folio', 'muestra'],
  humedad: ['humedad', '% humedad', 'porcentaje humedad'],
  proteina: ['proteina', 'proteína', '% proteina', '% proteína'],
  gluten: ['gluten', '% gluten'],
  gluten_index: ['gluten index'],
  peso_hectolitro: ['peso hectolitro', 'ph'],
  falling_number: ['falling number'],
  peso_1000_granos: ['peso 1000 granos', 'peso mil granos'],
  sedimentacion: ['sedimentacion', 'sedimentación', 'valor sedimentacion', 'valor sedimentación'],
  impurezas: ['impurezas', '% impurezas', 'imp (%)', 'imp'],
  granos_partidos: ['granos partidos', '% granos partidos', 'g.p (%)', 'gp', 'g.p'],
  granos_quebrados_chupados: ['granos quebrados chupados', 'granos quebrados/chupados', 'quebrados chupados'],
  granos_danados: ['granos danados', 'granos dañados', 'danados', 'dañados'],
  granos_brotados: ['granos brotados', 'brotados'],
  hongos: ['hongos'],
  otros: ['otros'],
  resultado: ['resultado', 'resultado laboratorio', 'estado laboratorio'],
  observaciones_laboratorio: ['observaciones laboratorio', 'observacion laboratorio', 'observación laboratorio'],
  destino: ['destino'],
  silo_bodega: ['silo bodega', 'silo/bodega', 'silo', 'bodega', 'silo o bodega'],
  sector: ['sector'],
  fecha_ingreso_almacenamiento: ['fecha ingreso almacenamiento', 'fecha almacenamiento'],
  hora_ingreso_almacenamiento: ['hora ingreso almacenamiento', 'hora almacenamiento'],
  responsable: ['responsable'],
  estado_almacenamiento: ['estado almacenamiento'],
  observaciones_almacenamiento: ['observaciones almacenamiento'],
};

export async function importExcelRows(rows, { mode = 'general' } = {}) {
  const warnings = [];
  let imported = 0;

  for (const [index, row] of rows.entries()) {
    const mapped = mapRow(row);
    const required = ['patente', 'chofer', 'proveedor', 'numero_guia_despacho', 'peso_entrada', 'fecha_ingreso', 'hora_ingreso'];
    const missing = required.filter((field) => !mapped[field]);

    if (missing.length) {
      warnings.push({
        row: index + 2,
        reason: `Faltan campos obligatorios: ${missing.join(', ')}`,
        data: row,
      });
      continue;
    }

    try {
      const proveedor = await upsertProveedor({
        nombre: mapped.proveedor,
        rut: mapped.rut_proveedor,
      });

      const romana = await upsertRomana({
        patente: String(mapped.patente).toUpperCase(),
        chofer: mapped.chofer,
        rut_chofer: mapped.rut_chofer,
        proveedor_id: proveedor.id,
        proveedor_nombre: proveedor.nombre,
        rut_proveedor: mapped.rut_proveedor,
        guia_despacho: mapped.guia_despacho || 'Guia despacho',
        numero_guia_despacho: mapped.numero_guia_despacho,
        peso_entrada: toNumber(mapped.peso_entrada),
        fecha_ingreso: toDate(mapped.fecha_ingreso),
        hora_ingreso: toTime(mapped.hora_ingreso),
        empresa_transporte: mapped.empresa_transporte,
        estado: 'Pendiente de laboratorio',
        observaciones: mapped.observaciones,
      });

      if (mode !== 'romana' && hasLaboratorio(mapped)) {
        const laboratorio = await upsertLaboratorio({
          romana_id: romana.id,
          numero_lote: mapped.numero_lote,
          fecha_muestreo: toDate(mapped.fecha_muestreo || mapped.fecha_ingreso),
          hora_muestreo: toTime(mapped.hora_muestreo || mapped.hora_ingreso),
          fecha_analisis: toDate(mapped.fecha_analisis || mapped.fecha_muestreo || mapped.fecha_ingreso),
          hora_analisis: toTime(mapped.hora_analisis || mapped.hora_muestreo || mapped.hora_ingreso),
          laboratorio_ensayo: mapped.laboratorio_ensayo || 'Laboratorio Curimapu Chillan',
          correlativo_muestra: mapped.correlativo_muestra,
          producto: mapped.producto,
          humedad: toNullableNumber(mapped.humedad),
          proteina: toNullableNumber(mapped.proteina),
          gluten: toNullableNumber(mapped.gluten),
          gluten_index: toNullableNumber(mapped.gluten_index),
          peso_hectolitro: toNullableNumber(mapped.peso_hectolitro),
          falling_number: toNullableNumber(mapped.falling_number),
          peso_1000_granos: toNullableNumber(mapped.peso_1000_granos),
          sedimentacion: toNullableNumber(mapped.sedimentacion),
          impurezas: toNullableNumber(mapped.impurezas),
          granos_partidos: toNullableNumber(mapped.granos_partidos),
          granos_quebrados_chupados: toNullableNumber(mapped.granos_quebrados_chupados),
          granos_danados: toNullableNumber(mapped.granos_danados),
          granos_brotados: toNullableNumber(mapped.granos_brotados),
          hongos: toNullableNumber(mapped.hongos),
          otros: mapped.otros,
          resultado: normalizeResultado(mapped.resultado),
          observaciones_laboratorio: mapped.observaciones_laboratorio,
        });

        if (hasAlmacenamiento(mapped) && normalizeResultado(mapped.resultado) !== 'Rechazado') {
          await upsertAlmacenamiento({
            romana_id: romana.id,
            laboratorio_id: laboratorio.id,
            destino: normalizeDestino(mapped.destino),
            silo_bodega: mapped.silo_bodega,
            sector: mapped.sector,
            fecha_ingreso: toDate(mapped.fecha_ingreso_almacenamiento || mapped.fecha_ingreso),
            hora_ingreso: toTime(mapped.hora_ingreso_almacenamiento || mapped.hora_ingreso),
            responsable: mapped.responsable,
            estado_almacenamiento: normalizeEstadoAlmacenamiento(mapped.estado_almacenamiento),
            observaciones: mapped.observaciones_almacenamiento,
          });
        }
      }

      imported += 1;
    } catch (error) {
      warnings.push({
        row: index + 2,
        reason: error.message,
        data: row,
      });
    }
  }

  return { imported, warnings };
}

function mapRow(row) {
  return Object.fromEntries(
    Object.entries(aliases).map(([field, names]) => [field, pick(row, names)]),
  );
}

function pick(row, names) {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
  );
  for (const name of names) {
    const value = normalized[normalizeKey(name)];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
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

function hasLaboratorio(mapped) {
  return Boolean(
    mapped.producto
    || mapped.numero_lote
    || mapped.humedad
    || mapped.impurezas
    || mapped.resultado
    || mapped.hora_analisis,
  );
}

function hasAlmacenamiento(mapped) {
  return Boolean(mapped.silo_bodega || mapped.destino || mapped.estado_almacenamiento || mapped.responsable);
}

function toNumber(value) {
  const parsed = Number(String(value || '0').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return toNumber(value);
}

function toDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const [, day, month, year] = match;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function toTime(value) {
  if (!value) return new Date().toTimeString().slice(0, 5);
  const text = String(value).trim();
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  return new Date().toTimeString().slice(0, 5);
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
