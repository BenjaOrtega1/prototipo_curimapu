import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { number } from '../utils/formatters';

export default function AnimatedNumber({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduceMotion = useReducedMotion();
  const numericValue = Number(value || 0);
  const count = useMotionValue(reduceMotion ? numericValue : 0);
  const rounded = useTransform(count, (latest) => `${number(latest, decimals)}${suffix}`);

  const fallback = useMemo(() => `${number(numericValue, decimals)}${suffix}`, [numericValue, decimals, suffix]);

  useEffect(() => {
    if (!inView || reduceMotion) return undefined;
    const controls = animate(count, numericValue, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [count, inView, numericValue, reduceMotion]);

  if (reduceMotion) return <span ref={ref}>{fallback}</span>;

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
