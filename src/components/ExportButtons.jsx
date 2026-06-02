import { Download, FileSpreadsheet, ImageDown } from 'lucide-react';
import { downloadNodeAsPng, exportExcel } from '../utils/exporters';

export default function ExportButtons({ rows, captureRef, compact = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-secondary" onClick={() => exportExcel(rows)}>
        <FileSpreadsheet size={17} />
        {compact ? 'Excel' : 'Exportar Excel'}
      </button>
      <button className="btn btn-secondary" onClick={() => downloadNodeAsPng(captureRef?.current)}>
        <ImageDown size={17} />
        {compact ? 'PNG' : 'Generar imagen'}
      </button>
      <a className="btn btn-primary" href="/planilla">
        <Download size={17} />
        Ver planilla
      </a>
    </div>
  );
}
