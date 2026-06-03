import { Download, Printer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createDocumentoCurimapu } from '../services/formularioService';
import { crearUrlFormulario } from '../utils/generarFormularioCurimapu';

export default function FormularioPreviewModal({ recepcion, open, onClose }) {
  const [numero, setNumero] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function build() {
      if (!open || !recepcion) return;
      setLoading(true);
      setError('');
      try {
        const documento = await createDocumentoCurimapu(recepcion.id);
        const generated = crearUrlFormulario({ recepcion, numero: documento.numero });
        if (!active) return;
        setNumero(documento.numero);
        setPdfUrl(generated.url);
        setDoc(generated.doc);
      } catch (buildError) {
        if (active) setError(buildError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    build();
    return () => {
      active = false;
    };
  }, [open, recepcion]);

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  if (!open) return null;

  function download() {
    doc?.save(`formulario_curimapu_${numero || 'recepcion'}.pdf`);
  }

  function printPdf() {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
          <div>
            <h2 className="text-xl font-black text-curimapu-dark">Vista previa formulario</h2>
            <p className="text-sm text-slate-500">Formulario Oficial Curimapu {numero && `N ${numero}`}</p>
          </div>
          <button className="btn btn-secondary px-2" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="min-h-[60vh] flex-1 bg-slate-100 p-3">
          {loading && <div className="grid h-[60vh] place-items-center text-sm font-bold text-slate-600">Generando formulario...</div>}
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">{error}</div>}
          {!loading && !error && pdfUrl && (
            <iframe title="Vista previa formulario Curimapu" src={pdfUrl} className="h-[68vh] w-full rounded-xl border border-slate-200 bg-white" />
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white p-4">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" type="button" disabled={!pdfUrl} onClick={printPdf}>
            <Printer size={17} />
            Imprimir
          </button>
          <button className="btn btn-primary" type="button" disabled={!doc} onClick={download}>
            <Download size={17} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
