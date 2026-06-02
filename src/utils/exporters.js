import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';

export function exportExcel(rows, filename = 'recepcion_cereales_curimapu.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recepciones');
  XLSX.writeFile(workbook, filename);
}

export async function downloadNodeAsPng(node, filename = 'resumen_recepcion_curimapu.png') {
  if (!node) return;
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
