export const motionTokens = {
  duration: {
    fast: 0.14,
    base: 0.2,
    slow: 0.28,
  },
  ease: {
    out: [0.16, 1, 0.3, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  spring: {
    type: 'spring',
    stiffness: 420,
    damping: 34,
    mass: 0.8,
  },
  softSpring: {
    type: 'spring',
    stiffness: 260,
    damping: 28,
    mass: 0.9,
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 14, scale: 0.992 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.996,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.inOut },
  },
};

export const containerStagger = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
};

export const itemReveal = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.ease.out },
  },
};

export const pressableMotion = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.975 },
  transition: motionTokens.spring,
};
