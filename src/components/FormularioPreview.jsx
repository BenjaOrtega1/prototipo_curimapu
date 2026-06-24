import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { crearUrlFormulario } from '../utils/generarFormularioCurimapu';

export default function FormularioPreview({ datos, numero }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    async function buildPreview() {
      setError('');
      setUrl('');
      try {
        const result = await crearUrlFormulario({ datos, numero });
        objectUrl = result.url;
        if (active) setUrl(objectUrl);
      } catch (previewError) {
        if (active) setError(previewError.message || 'No se pudo preparar la vista previa del formulario.');
      }
    }

    buildPreview();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [datos, numero]);

  if (error) {
    return (
      <div className="official-preview-state">
        <FileText size={28} />
        <strong>No se pudo cargar la vista previa</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="official-preview-state">
        <FileText size={28} />
        <strong>Preparando formulario oficial</strong>
        <span>Generando una vista previa identica al PDF final.</span>
      </div>
    );
  }

  return (
    <div className="official-preview-shell">
      <iframe title="Vista previa formulario oficial Curimapu" src={url} />
    </div>
  );
}
