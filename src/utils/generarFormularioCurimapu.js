import { jsPDF } from 'jspdf';

const page = {
  width: 210,
  height: 297,
  margin: 10,
};

export function generarFormularioCurimapu({ recepcion, numero }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const proveedor = recepcion.proveedor || {};
  const laboratorio = recepcion.laboratorio || {};
  const almacenamiento = recepcion.almacenamiento || {};
  const netos = recepcion.kilos_netos || recepcion.peso_entrada || '';

  drawHeader(doc, numero);

  let y = 33;
  y = drawSection(doc, 'PROVEEDOR', y, [
    ['Nombre proveedor', recepcion.proveedor_nombre || proveedor.nombre],
    ['RUT', recepcion.rut_proveedor || proveedor.rut],
    ['Celular', proveedor.telefono || proveedor.celular],
    ['Mail', proveedor.email],
    ['Direccion', proveedor.direccion],
    ['Ciudad', proveedor.ciudad],
    ['Comuna', proveedor.comuna],
    ['Predio de origen', recepcion.predio_origen],
  ]);

  y = drawSection(doc, 'RECEPCION', y + 2, [
    ['N guia despacho', recepcion.numero_guia_despacho || recepcion.guia_despacho],
    ['Nombre/tipo producto', laboratorio.producto || recepcion.producto],
    ['Fecha recepcion', recepcion.fecha_ingreso || recepcion.fecha_recepcion],
    ['Hora recepcion', recepcion.hora_ingreso || recepcion.hora_recepcion],
    ['Peso bruto camion', recepcion.peso_bruto || recepcion.peso_entrada],
    ['Tara camion', recepcion.tara],
    ['Total kilos netos recibidos', netos],
    ['Patente camion', recepcion.patente || recepcion.patente_camion],
    ['Patente carro', recepcion.patente_carro],
    ['Empresa transporte', recepcion.empresa_transporte],
    ['Nombre chofer', recepcion.chofer || recepcion.nombre_chofer],
    ['Rut chofer', recepcion.rut_chofer],
  ]);

  y = drawSection(doc, 'LABORATORIO', y + 2, [
    ['N lote recepcion', laboratorio.numero_lote],
    ['Fecha muestreo', laboratorio.fecha_muestreo],
    ['Hora muestreo', laboratorio.hora_muestreo],
    ['Laboratorio ensayo', laboratorio.laboratorio_ensayo || laboratorio.laboratorio],
    ['N correlativo muestra', laboratorio.correlativo_muestra],
    ['Fecha analisis', laboratorio.fecha_analisis],
    ['Hora analisis', laboratorio.hora_analisis],
    ['Destino', almacenamiento.destino],
    ['Silo/Bodega', almacenamiento.silo_bodega],
    ['Nombre laboratorio arbitrador', laboratorio.laboratorio_arbitrador],
  ]);

  y = drawResultados(doc, y + 2, laboratorio);
  y = drawSection(doc, 'COSTOS', y + 2, [
    ['Tarifa secado', laboratorio.tarifa_secado],
    ['Limpieza', laboratorio.limpieza],
    ['Analisis laboratorio', laboratorio.analisis_laboratorio],
    ['Precio referencial', laboratorio.precio_referencial],
  ]);

  y = drawObservaciones(doc, y + 2, recepcion, laboratorio, almacenamiento);
  drawFirmas(doc, Math.max(y + 4, 252));

  return doc;
}

export function crearUrlFormulario(args) {
  const doc = generarFormularioCurimapu(args);
  return {
    doc,
    url: URL.createObjectURL(doc.output('blob')),
  };
}

function drawHeader(doc, numero) {
  doc.setDrawColor(24, 61, 40);
  doc.setLineWidth(0.6);
  doc.rect(page.margin, 8, page.width - page.margin * 2, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CURIMAPU', 14, 18);

  doc.setFontSize(9);
  doc.text('Guia de Recepcion / Resultados de Analisis / Formulario Contramuestras', 14, 25);

  doc.setFontSize(12);
  doc.text(`N ${numero}`, 170, 18);
}

function drawSection(doc, title, y, rows) {
  const validRows = rows.map(([label, value]) => [label, printable(value)]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setFillColor(232, 245, 236);
  doc.rect(page.margin, y, page.width - page.margin * 2, 7, 'F');
  doc.text(title, page.margin + 2, y + 5);

  return drawGridRows(doc, y + 7, chunkPairs(validRows), [34, 61, 34, 61]);
}

function drawResultados(doc, y, laboratorio) {
  const rows = [
    ['Porcentaje humedad', laboratorio.humedad],
    ['Porcentaje proteina', laboratorio.proteina],
    ['Porcentaje gluten corregido al 14%', laboratorio.gluten],
    ['Gluten index', laboratorio.gluten_index],
    ['Peso hectolitro', laboratorio.peso_hectolitro],
    ['Falling number', laboratorio.falling_number],
    ['Peso 1000 granos', laboratorio.peso_1000_granos],
    ['Valor sedimentacion', laboratorio.sedimentacion],
    ['Porcentaje impurezas', laboratorio.impurezas],
    ['Porcentaje granos partidos', laboratorio.granos_partidos],
    ['Porcentaje granos partidos/quebrados/chupados', laboratorio.granos_quebrados_chupados],
    ['Porcentaje granos agorgojados', laboratorio.granos_agorgojados || laboratorio.granos_agregados],
    ['Porcentaje granos danados por calor', laboratorio.granos_danados_calor || laboratorio.granos_danados],
    ['Porcentaje granos helados', laboratorio.granos_helados || laboratorio.granos_helados_verdes_inmaduros],
    ['Porcentaje granos brotados', laboratorio.granos_brotados],
    ['Porcentaje punta negra', laboratorio.granos_punta_negra],
    ['Porcentaje hongos', laboratorio.hongos],
    ['Otros', laboratorio.otros],
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setFillColor(232, 245, 236);
  doc.rect(page.margin, y, page.width - page.margin * 2, 7, 'F');
  doc.text('TABLA RESULTADOS', page.margin + 2, y + 5);

  return drawGridRows(doc, y + 7, chunkPairs(rows.map(([label, value]) => [label, printable(value)])), [47, 48, 47, 48], 5);
}

function drawGridRows(doc, startY, rows, widths, rowHeight = 5.5) {
  let y = startY;
  const x0 = page.margin;

  doc.setLineWidth(0.15);
  doc.setDrawColor(90, 110, 96);
  doc.setFontSize(7.2);

  rows.forEach((row) => {
    let x = x0;
    row.forEach((cell, index) => {
      const width = widths[index];
      if (index === 0 || index === 2) {
        doc.setFillColor(247, 250, 248);
        doc.rect(x, y, width, rowHeight, 'FD');
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, width, rowHeight, 'FD');
        doc.setFont('helvetica', 'normal');
      }
      doc.text(doc.splitTextToSize(printable(cell), width - 2), x + 1.2, y + 3.6);
      x += width;
    });
    y += rowHeight;
  });

  return y;
}

function drawObservaciones(doc, y, recepcion, laboratorio, almacenamiento) {
  const text = printable(recepcion.observaciones || laboratorio.observaciones_laboratorio || almacenamiento.observaciones);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OBSERVACIONES', page.margin, y + 4);
  doc.rect(page.margin, y + 6, page.width - page.margin * 2, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(text, page.width - page.margin * 2 - 4), page.margin + 2, y + 11);
  return y + 24;
}

function drawFirmas(doc, y) {
  const labels = [
    'V B Representante Empresa',
    'V B Analista Laboratorio',
    'V B Encargado Laboratorio',
    'V B Recibido Cliente/Chofer',
  ];
  const width = (page.width - page.margin * 2 - 9) / 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  labels.forEach((label, index) => {
    const x = page.margin + index * (width + 3);
    doc.rect(x, y, width, 22);
    doc.line(x + 4, y + 14, x + width - 4, y + 14);
    doc.text(doc.splitTextToSize(label, width - 4), x + 2, y + 18);
  });
}

function chunkPairs(rows) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += 2) {
    const left = rows[index] || ['', ''];
    const right = rows[index + 1] || ['', ''];
    chunks.push([left[0], left[1], right[0], right[1]]);
  }
  return chunks;
}

function printable(value) {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
}
