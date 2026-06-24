import { AlertTriangle, CheckCircle2, Clock, Scale, Truck, Warehouse } from 'lucide-react';
import StatCard from './StatCard.jsx';

export default function DashboardCards({ stats }) {
  const cards = [
    { label: 'Camiones ingresados', value: stats.totalCamiones, icon: Truck, tone: 'green', detail: 'Movimientos del dia' },
    { label: 'Kilos recibidos', value: stats.kilos, suffix: ' kg', icon: Scale, tone: 'green', detail: 'Peso entrada acumulado' },
    { label: 'Pendientes laboratorio', value: stats.pendientes, icon: Clock, tone: 'yellow', detail: 'Requieren analisis' },
    { label: 'Aprobados', value: stats.aprobadas, icon: CheckCircle2, tone: 'green', detail: 'Listos para almacenar' },
    { label: 'Rechazados', value: stats.rechazadas, icon: AlertTriangle, tone: 'red', detail: 'Fuera del proceso' },
    { label: 'En almacenamiento', value: stats.almacenamiento, icon: Warehouse, tone: 'blue', detail: 'Silo, bodega o despacho' },
  ];

  return (
    <section className="dashboard-kpis grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card, index) => <StatCard key={card.label} index={index} {...card} />)}
    </section>
  );
}
