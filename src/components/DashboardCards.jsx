import { AlertTriangle, CheckCircle2, Clock, Scale, Truck, Warehouse } from 'lucide-react';
import { number } from '../utils/formatters';

export default function DashboardCards({ stats }) {
  const cards = [
    { label: 'Camiones ingresados hoy', value: stats.totalCamiones, icon: Truck, tone: 'text-curimapu-green' },
    { label: 'Kilos recibidos', value: `${number(stats.kilos)} kg`, icon: Scale, tone: 'text-slate-700' },
    { label: 'Pendientes análisis', value: stats.pendientes, icon: Clock, tone: 'text-amber-700' },
    { label: 'Muestras aprobadas', value: stats.aprobadas, icon: CheckCircle2, tone: 'text-green-700' },
    { label: 'Muestras rechazadas', value: stats.rechazadas, icon: AlertTriangle, tone: 'text-red-700' },
    { label: 'En almacenamiento', value: stats.almacenamiento, icon: Warehouse, tone: 'text-curimapu-dark' },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article key={label} className="panel rounded-md p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <Icon className={tone} size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
        </article>
      ))}
    </section>
  );
}
