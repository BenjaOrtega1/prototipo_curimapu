import { Inbox } from 'lucide-react';
import { animate } from 'animejs';
import { useEffect, useRef } from 'react';

export default function EmptyState({ title = 'Aun no hay registros', description = 'Ingresa el primer camion desde Romana.' }) {
  const iconRef = useRef(null);

  useEffect(() => {
    if (!iconRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const animation = animate(iconRef.current, {
      translateY: [0, -5, 0],
      scale: [1, 1.035, 1],
      duration: 1800,
      ease: 'inOut(2)',
      loop: true,
    });

    return () => animation.pause();
  }, []);

  return (
    <div className="empty-state">
      <div ref={iconRef} className="empty-state__icon">
        <Inbox size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
