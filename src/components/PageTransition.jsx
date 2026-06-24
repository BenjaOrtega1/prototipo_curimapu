import { motion, useReducedMotion } from 'motion/react';
import { pageTransition } from '../lib/motionSystem';

export default function PageTransition({ children }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className="page-transition">{children}</div>;
  }

  return (
    <motion.div className="page-transition" variants={pageTransition} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}
