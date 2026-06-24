import { motion, useReducedMotion } from 'motion/react';
import { pressableMotion } from '../lib/motionSystem';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const reduceMotion = useReducedMotion();
  const variants = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger',
    ghost: 'btn btn-ghost',
  };

  return (
    <motion.button
      className={`${variants[variant] || variants.primary} ${className}`}
      whileHover={reduceMotion ? undefined : pressableMotion.whileHover}
      whileTap={reduceMotion ? undefined : pressableMotion.whileTap}
      transition={pressableMotion.transition}
      {...props}
    >
      {children}
    </motion.button>
  );
}
