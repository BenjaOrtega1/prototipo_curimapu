import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from './Toast.jsx';
import { exportExcel } from '../utils/exporters';

export default function ExportButtons({ rows, compact = false }) {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function handleExcel() {
    try {
      exportExcel(rows);
      setNotice('Excel generado correctamente.');
    } catch (exportError) {
      setError(exportError.message || 'No se pudo generar el Excel.');
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-secondary" type="button" onClick={handleExcel}>
          <FileSpreadsheet size={17} />
          {compact ? 'Excel' : 'Exportar Excel'}
        </button>
        <Link className="btn btn-primary" to="/planilla">
          <Download size={17} />
          Ver planilla
        </Link>
      </div>
      <Toast message={notice} onClose={() => setNotice('')} />
      <Toast message={error} type="error" onClose={() => setError('')} />
    </>
  );
}
