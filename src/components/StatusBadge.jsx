export default function StatusBadge({ value }) {
  const tone = {
    'Pendiente de laboratorio': 'border-amber-200 bg-amber-100 text-amber-800',
    'Pendiente de almacenamiento': 'border-blue-200 bg-blue-100 text-blue-800',
    Aprobado: 'border-green-200 bg-green-100 text-green-800',
    Rechazado: 'border-red-200 bg-red-100 text-red-800',
    'En espera': 'border-amber-200 bg-amber-100 text-amber-800',
    'En silo': 'border-emerald-200 bg-emerald-100 text-emerald-800',
    'En bodega': 'border-emerald-200 bg-emerald-100 text-emerald-800',
    Despachado: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${tone[value] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
      {value || 'Sin estado'}
    </span>
  );
}
