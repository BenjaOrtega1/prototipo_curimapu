export default function StatCard({ label, value, icon: Icon, tone = 'green', detail }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">{Icon && <Icon size={24} />}</div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {detail && <p className="stat-card__detail">{detail}</p>}
      </div>
    </article>
  );
}
