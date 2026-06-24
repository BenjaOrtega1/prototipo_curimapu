import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

export default function Toast({ message, type = 'success', onClose }) {
  const reduceMotion = useReducedMotion();
  const Icon = icons[type] || CheckCircle2;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`toast toast--${type}`}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span initial={false} animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }} transition={{ duration: 0.28 }}>
            <Icon size={18} />
          </motion.span>
          <span>{message}</span>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Cerrar">
              <X size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
