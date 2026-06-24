export default function StatusBadge({ value }) {
  const tone = {
    'Pendiente de laboratorio': 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    'Pendiente de almacenamiento': 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
    Aprobado: 'border-green-200 bg-green-100 text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300',
    Rechazado: 'border-red-200 bg-red-100 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300',
    'En espera': 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    'En silo': 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
    'En bodega': 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
    Despachado: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${tone[value] || 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}>
      {value || 'Sin estado'}
    </span>
  );
}
