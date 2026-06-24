import { motion, useReducedMotion } from 'motion/react';

export default function PremiumSkeleton({ rows = 3, className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Cargando contenido">
      {Array.from({ length: rows }).map((_, index) => (
        <motion.div
          key={index}
          className="premium-skeleton"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: index * 0.04 }}
        >
          <span className="premium-skeleton__block premium-skeleton__block--short" />
          <span className="premium-skeleton__block" />
          <span className="premium-skeleton__block premium-skeleton__block--tiny" />
        </motion.div>
      ))}
    </div>
  );
}
