import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Aun no hay registros', description = 'Ingresa el primer camion desde Romana.' }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Inbox size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
