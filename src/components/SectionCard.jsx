import { motion, useReducedMotion } from 'motion/react';
import { itemReveal, pressableMotion } from '../lib/motionSystem';

export default function SectionCard({ title, description, action, children, className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={`section-card ${className}`}
      layout
      variants={itemReveal}
      initial="hidden"
      animate="show"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={pressableMotion.transition}
    >
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
    </motion.section>
  );
}
