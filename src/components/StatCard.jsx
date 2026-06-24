import { motion, useReducedMotion } from 'motion/react';
import AnimatedNumber from './AnimatedNumber.jsx';
import { itemReveal, pressableMotion } from '../lib/motionSystem';

export default function StatCard({ label, value, suffix = '', icon: Icon, tone = 'green', detail, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const numericValue = typeof value === 'number' || !Number.isNaN(Number(value));

  return (
    <motion.article
      className={`stat-card stat-card--${tone}`}
      layout
      variants={itemReveal}
      initial="hidden"
      animate="show"
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
      whileTap={reduceMotion ? undefined : pressableMotion.whileTap}
      transition={{ ...pressableMotion.transition, delay: index * 0.025 }}
    >
      <motion.div className="stat-card__icon" layoutId={`kpi-icon-${label}`}>
        {Icon && <Icon size={24} />}
      </motion.div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">
          {numericValue ? <AnimatedNumber value={Number(value)} suffix={suffix} /> : value}
        </p>
        {detail && <p className="stat-card__detail">{detail}</p>}
      </div>
    </motion.article>
  );
}
