export default function StatusBadge({ value }) {
  const tone = {
    'Pendiente de laboratorio': 'bg-amber-100 text-amber-800 border-amber-200',
    'Pendiente de almacenamiento': 'bg-blue-100 text-blue-800 border-blue-200',
    Aprobado: 'bg-green-100 text-green-800 border-green-200',
    Rechazado: 'bg-red-100 text-red-800 border-red-200',
    'En silo': 'bg-green-100 text-green-800 border-green-200',
    'En bodega': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Despachado: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-bold ${tone[value] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {value || 'Sin estado'}
    </span>
  );
}
