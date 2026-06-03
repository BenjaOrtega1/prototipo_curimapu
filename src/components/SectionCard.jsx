export default function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`section-card ${className}`}>
      {(title || description || action) && (
        <div className="section-card__header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action && <div className="section-card__action">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
