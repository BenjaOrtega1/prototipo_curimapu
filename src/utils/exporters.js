import * as XLSX from 'xlsx';

export function exportExcel(rows, filename = 'recepcion_cereales_curimapu.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(normalizeRows(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recepciones');
  XLSX.writeFile(workbook, filename);
}

export function printRowsSummary(rows, title = 'Resumen recepcion Curimapu') {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';

  document.body.appendChild(iframe);

  const printDocument = iframe.contentWindow?.document;
  if (!printDocument) {
    iframe.remove();
    throw new Error('No se pudo preparar el documento de impresion.');
  }

  printDocument.open();
  printDocument.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>${printStyles()}</style>
  </head>
  <body>
    ${buildPrintableSummaryHtml(rows, { title, mode: 'print' })}
  </body>
</html>`);
  printDocument.close();

  const printFrame = iframe.contentWindow;
  window.setTimeout(() => {
    printFrame?.focus();
    printFrame?.print();
    window.setTimeout(() => iframe.remove(), 1000);
  }, 150);
}

function normalizeRows(rows = []) {
  return rows.map((row) => {
    const { id, _record, Acciones, ...clean } = row || {};
    return clean;
  });
}

function buildPrintableSummaryHtml(rows = [], { title = 'Resumen recepcion Curimapu', mode = 'print' } = {}) {
  const cleanRows = normalizeRows(rows);
  const totalPeso = cleanRows.reduce((sum, row) => sum + Number(row['Peso entrada'] || 0), 0);
  const aprobados = cleanRows.filter((row) => row['Resultado laboratorio'] === 'Aprobado').length;
  const rechazados = cleanRows.filter((row) => row['Estado general'] === 'Rechazado').length;
  const fecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
  const columns = [
    'Fecha ingreso',
    'Hora ingreso',
    'Patente',
    'Proveedor',
    'N guia despacho',
    'Peso entrada',
    'Producto',
    'N lote',
    '% humedad',
    'Resultado laboratorio',
    'Silo/Bodega',
    'Estado general',
  ];

  return `<section class="print-sheet print-sheet--${mode}">
    <header class="print-header">
      <div>
        <p>Curimapu Chillan</p>
        <h1>${escapeHtml(title)}</h1>
        <span>Generado: ${escapeHtml(fecha)}</span>
      </div>
      <div class="print-brand">C</div>
    </header>

    <div class="print-kpis">
      <article><span>Registros</span><strong>${cleanRows.length}</strong></article>
      <article><span>Peso entrada</span><strong>${formatNumber(totalPeso)} kg</strong></article>
      <article><span>Aprobados</span><strong>${aprobados}</strong></article>
      <article><span>Rechazados</span><strong>${rechazados}</strong></article>
    </div>

    <table class="print-table">
      <thead>
        <tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${cleanRows.length ? cleanRows.map((row) => `<tr>
          ${columns.map((column) => `<td>${escapeHtml(formatCell(row[column], column))}</td>`).join('')}
        </tr>`).join('') : `<tr><td colspan="${columns.length}" class="print-empty">Sin registros para imprimir.</td></tr>`}
      </tbody>
    </table>
  </section>`;
}

function printStyles() {
  return `
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f6f4; color: #15251b; font-family: Inter, Arial, sans-serif; }
    .print-sheet { width: 100%; background: #fff; padding: 18px; }
    .print-header { display: flex; justify-content: space-between; gap: 20px; border-bottom: 2px solid #183d28; padding-bottom: 12px; }
    .print-header p { margin: 0; color: #2f6b3f; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    .print-header h1 { margin: 4px 0; color: #15251b; font-size: 24px; line-height: 1.1; }
    .print-header span { color: #657f72; font-size: 11px; font-weight: 700; }
    .print-brand { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 12px; background: #183d28; color: white; font-weight: 900; font-size: 24px; }
    .print-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
    .print-kpis article { border: 1px solid #dce8df; border-radius: 10px; background: #f8faf9; padding: 9px 10px; }
    .print-kpis span { display: block; color: #657f72; font-size: 9px; font-weight: 900; text-transform: uppercase; }
    .print-kpis strong { display: block; margin-top: 3px; color: #183d28; font-size: 17px; }
    .print-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8.5px; }
    .print-table th { background: #183d28; color: white; padding: 6px 4px; text-align: left; vertical-align: top; }
    .print-table td { border: 1px solid #dce8df; padding: 5px 4px; vertical-align: top; word-break: break-word; }
    .print-table tr:nth-child(even) td { background: #f8faf9; }
    .print-empty { text-align: center; color: #657f72; padding: 24px !important; }
    @media print { body { background: #fff; } .print-sheet { padding: 0; } }
  `;
}

function formatCell(value, column) {
  if (value === null || value === undefined || value === '') return '-';
  if (column === 'Peso entrada') return formatNumber(value);
  if (column === '% humedad') return `${formatNumber(value, 1)}%`;
  return String(value);
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
