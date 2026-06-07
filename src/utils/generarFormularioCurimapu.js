export const safe = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const page = {
  width: 210,
  height: 297,
  margin: 8,
};

export async function generarFormularioCurimapu({ datos, numero }) {
  const { jsPDF } = await import(/* @vite-ignore */ 'jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawHeader(doc, numero);

  let y = 31;
  y = drawSection(doc, 'PROVEEDOR', y, [
    ['Nombre proveedor', datos.proveedor_nombre],
    ['RUT', datos.proveedor_rut],
    ['Celular', datos.proveedor_celular],
    ['Mail', datos.proveedor_mail],
    ['Direccion', datos.proveedor_direccion],
    ['Ciudad', datos.proveedor_ciudad],
    ['Comuna', datos.proveedor_comuna],
    ['Predio de origen', datos.predio_origen],
  ]);

  y = drawSection(doc, 'RECEPCION', y + 1.5, [
    ['N guia despacho', datos.numero_guia_despacho],
    ['Nombre/tipo producto', datos.producto],
    ['Fecha recepcion', datos.fecha_recepcion],
    ['Hora recepcion', datos.hora_recepcion],
    ['Peso bruto camion', datos.peso_bruto],
    ['Tara camion', datos.tara],
    ['Total kilos netos recibidos', datos.kilos_netos],
    ['Patente camion', datos.patente_camion],
    ['Patente carro', datos.patente_carro],
    ['Empresa transporte', datos.empresa_transporte],
    ['Nombre chofer', datos.nombre_chofer],
    ['RUT chofer', datos.rut_chofer],
  ]);

  y = drawSection(doc, 'LABORATORIO', y + 1.5, [
    ['N lote recepcion', datos.numero_lote],
    ['Fecha muestreo', datos.fecha_muestreo],
    ['Hora muestreo', datos.hora_muestreo],
    ['Laboratorio ensayo', datos.laboratorio_ensayo],
    ['N correlativo muestra/contramuestra', datos.correlativo_muestra],
    ['Fecha analisis', datos.fecha_analisis],
    ['Hora analisis', datos.hora_analisis],
    ['Destino', datos.destino],
    ['Silo/Bodega N', datos.silo_bodega],
    ['Laboratorio arbitrador', datos.laboratorio_arbitrador],
  ]);

  y = drawResultados(doc, y + 1.5, datos);
  y = drawSection(doc, 'COSTOS', y + 1.5, [
    ['Tarifa secado', datos.tarifa_secado],
    ['Limpieza', datos.limpieza],
    ['Analisis laboratorio', datos.analisis_laboratorio],
    ['Precio referencial', datos.precio_referencial],
  ]);

  y = drawObservaciones(doc, y + 1.5, datos.observaciones);
  drawFirmas(doc, Math.max(y + 3, 254), datos);

  return doc;
}

export async function crearUrlFormulario(args) {
  const doc = await generarFormularioCurimapu(args);
  return {
    doc,
    url: URL.createObjectURL(doc.output('blob')),
  };
}

export function buildFormularioData(recepcion = {}) {
  const proveedor = recepcion.proveedor || {};
  const laboratorio = recepcion.laboratorio || {};
  const almacenamiento = recepcion.almacenamiento || {};
  const observaciones = [
    recepcion.observaciones,
    laboratorio.observaciones_laboratorio,
    almacenamiento.observaciones,
  ].filter(Boolean).join('\n');

  return {
    romana_id: recepcion.id,
    laboratorio_id: laboratorio.id,
    almacenamiento_id: almacenamiento.id,
    proveedor_nombre: recepcion.proveedor_nombre || proveedor.nombre,
    proveedor_rut: recepcion.rut_proveedor || proveedor.rut,
    proveedor_celular: proveedor.telefono || proveedor.celular,
    proveedor_mail: proveedor.email,
    proveedor_direccion: proveedor.direccion,
    proveedor_ciudad: proveedor.ciudad,
    proveedor_comuna: proveedor.comuna,
    predio_origen: recepcion.predio_origen,
    numero_guia_despacho: recepcion.numero_guia_despacho || recepcion.guia_despacho,
    producto: laboratorio.producto || recepcion.producto,
    fecha_recepcion: recepcion.fecha_ingreso || recepcion.fecha_recepcion,
    hora_recepcion: recepcion.hora_ingreso || recepcion.hora_recepcion,
    peso_bruto: recepcion.peso_bruto || recepcion.peso_entrada,
    tara: recepcion.tara,
    kilos_netos: recepcion.kilos_netos || recepcion.peso_entrada,
    patente_camion: recepcion.patente || recepcion.patente_camion,
    patente_carro: recepcion.patente_carro,
    empresa_transporte: recepcion.empresa_transporte,
    nombre_chofer: recepcion.chofer || recepcion.nombre_chofer,
    rut_chofer: recepcion.rut_chofer,
    numero_lote: laboratorio.numero_lote,
    fecha_muestreo: laboratorio.fecha_muestreo,
    hora_muestreo: laboratorio.hora_muestreo,
    laboratorio_ensayo: laboratorio.laboratorio_ensayo || laboratorio.laboratorio,
    correlativo_muestra: laboratorio.correlativo_muestra,
    fecha_analisis: laboratorio.fecha_analisis,
    hora_analisis: laboratorio.hora_analisis,
    destino: almacenamiento.destino,
    silo_bodega: almacenamiento.silo_bodega,
    laboratorio_arbitrador: laboratorio.laboratorio_arbitrador,
    humedad: laboratorio.humedad,
    proteina: laboratorio.proteina,
    gluten: laboratorio.gluten,
    gluten_index: laboratorio.gluten_index,
    peso_hectolitro: laboratorio.peso_hectolitro,
    falling_number: laboratorio.falling_number,
    peso_1000_granos: laboratorio.peso_1000_granos,
    sedimentacion: laboratorio.sedimentacion,
    impurezas: laboratorio.impurezas,
    granos_partidos: laboratorio.granos_partidos,
    granos_quebrados_chupados: laboratorio.granos_quebrados_chupados,
    granos_danados_calor: laboratorio.granos_danados_calor || laboratorio.granos_danados,
    granos_helados: laboratorio.granos_helados || laboratorio.granos_helados_verdes_inmaduros,
    granos_brotados: laboratorio.granos_brotados,
    punta_negra: laboratorio.granos_punta_negra,
    hongos: laboratorio.hongos,
    otros: laboratorio.otros,
    tarifa_secado: laboratorio.tarifa_secado,
    limpieza: laboratorio.limpieza,
    analisis_laboratorio: laboratorio.analisis_laboratorio,
    precio_referencial: laboratorio.precio_referencial,
    observaciones,
    firma_representante: '',
    firma_analista: '',
    firma_encargado: '',
    firma_recibido: '',
    resultado_laboratorio: laboratorio.resultado,
  };
}

function drawHeader(doc, numero) {
  doc.setDrawColor(24, 61, 40);
  doc.setLineWidth(0.7);
  doc.rect(page.margin, 7, page.width - page.margin * 2, 23);
  doc.setFillColor(232, 245, 236);
  doc.rect(page.margin, 7, page.width - page.margin * 2, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CURIMAPU', 12, 21);

  doc.setFontSize(8.5);
  doc.text('Guia de Recepcion / Resultados de Analisis / Formulario Contramuestras', 12, 27);

  doc.setFontSize(12);
  doc.text(`N ${safe(numero)}`, 167, 20);
}

function drawSection(doc, title, y, rows) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setFillColor(232, 245, 236);
  doc.rect(page.margin, y, page.width - page.margin * 2, 6, 'F');
  doc.rect(page.margin, y, page.width - page.margin * 2, 6);
  doc.text(title, page.margin + 2, y + 4.3);
  return drawGridRows(doc, y + 6, chunkPairs(rows), [36, 59, 36, 59], 6);
}

function drawResultados(doc, y, datos) {
  const rows = [
    ['Humedad', datos.humedad],
    ['Proteina', datos.proteina],
    ['Gluten corregido al 14%', datos.gluten],
    ['Gluten index', datos.gluten_index],
    ['Peso hectolitro', datos.peso_hectolitro],
    ['Falling number', datos.falling_number],
    ['Peso 1000 granos', datos.peso_1000_granos],
    ['Sedimentacion', datos.sedimentacion],
    ['Impurezas', datos.impurezas],
    ['Granos partidos', datos.granos_partidos],
    ['Partidos/quebrados/chupados', datos.granos_quebrados_chupados],
    ['Danados por calor', datos.granos_danados_calor],
    ['Helados/verdes/inmaduros', datos.granos_helados],
    ['Brotados', datos.granos_brotados],
    ['Punta negra', datos.punta_negra],
    ['Hongos', datos.hongos],
    ['Otros', datos.otros],
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setFillColor(232, 245, 236);
  doc.rect(page.margin, y, page.width - page.margin * 2, 6, 'F');
  doc.rect(page.margin, y, page.width - page.margin * 2, 6);
  doc.text('RESULTADOS ANALISIS', page.margin + 2, y + 4.3);
  return drawGridRows(doc, y + 6, chunkPairs(rows), [48, 47, 48, 47], 5.5);
}

function drawGridRows(doc, startY, rows, widths, rowHeight) {
  let y = startY;
  doc.setLineWidth(0.15);
  doc.setDrawColor(90, 110, 96);
  doc.setFontSize(7);

  rows.forEach((row) => {
    let x = page.margin;
    row.forEach((cell, index) => {
      const width = widths[index];
      const isLabel = index === 0 || index === 2;
      doc.setFillColor(isLabel ? 247 : 255, isLabel ? 250 : 255, isLabel ? 248 : 255);
      doc.rect(x, y, width, rowHeight, 'FD');
      doc.setFont('helvetica', isLabel ? 'bold' : 'normal');
      doc.text(doc.splitTextToSize(safe(cell), width - 2), x + 1.2, y + 3.6);
      x += width;
    });
    y += rowHeight;
  });

  return y;
}

function drawObservaciones(doc, y, text) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setFillColor(232, 245, 236);
  doc.rect(page.margin, y, page.width - page.margin * 2, 6, 'F');
  doc.rect(page.margin, y, page.width - page.margin * 2, 6);
  doc.text('OBSERVACIONES', page.margin + 2, y + 4.3);
  doc.rect(page.margin, y + 6, page.width - page.margin * 2, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(doc.splitTextToSize(safe(text), page.width - page.margin * 2 - 4), page.margin + 2, y + 11);
  return y + 26;
}

function drawFirmas(doc, y, datos) {
  const labels = [
    ['V B', 'Representante Empresa', datos.firma_representante],
    ['V B', 'Analista Laboratorio', datos.firma_analista],
    ['V B', 'Encargado Laboratorio', datos.firma_encargado],
    ['V B', 'Recibido Cliente / Chofer', datos.firma_recibido],
  ];
  const width = (page.width - page.margin * 2 - 9) / 4;

  labels.forEach(([prefix, label, value], index) => {
    const x = page.margin + index * (width + 3);
    doc.rect(x, y, width, 25);
    doc.line(x + 4, y + 13, x + width - 4, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(safe(value), width - 4), x + 2, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.text(prefix, x + 2, y + 17);
    doc.text(doc.splitTextToSize(label, width - 4), x + 2, y + 21);
  });
}

function chunkPairs(rows) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += 2) {
    chunks.push([rows[index]?.[0] || '', rows[index]?.[1] || '', rows[index + 1]?.[0] || '', rows[index + 1]?.[1] || '']);
  }
  return chunks;
}
